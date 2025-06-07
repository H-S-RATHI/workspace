import { create } from 'zustand';
import type { CallStore, CallType, CallStatus, Call } from './types';
import { INITIAL_CALL_STATE } from './constants';
import { createCallActions } from './actions';
import { useSocketStore } from '../socketStore';

// Extend the Window interface to include the RTCPeerConnection type
declare global {
  interface Window {
    RTCPeerConnection: typeof RTCPeerConnection;
    webkitRTCPeerConnection: typeof RTCPeerConnection;
  }
}



// Type for call timeouts
type CallTimeouts = Record<string, NodeJS.Timeout>;

// Extend the CallStore interface with additional state and methods
interface CallStoreState extends Omit<CallStore, 'activeCall' | 'isCallModalOpen' | 'callStatus'> {
  callTimeouts: CallTimeouts;
  activeCall: Call | null;
  isCallModalOpen: boolean;
  callStatus: CallStatus;
  setCallModalOpen: (isOpen: boolean) => void;
  handleIncomingCall: (data: {
    callId: string;
    callerId: string;
    callerUsername: string;
    callType: CallType;
    offer: RTCSessionDescriptionInit;
  }) => Promise<void>;
  endCall: (callId: string) => void;
}

// Create the store with proper type
type StoreSet = (
  partial: CallStoreState | Partial<CallStoreState> | ((state: CallStoreState) => CallStoreState | Partial<CallStoreState>),
  replace?: boolean
) => void;

type StoreGet = () => CallStoreState;

// Create the store
export const useCallStore = create<CallStoreState>((set: StoreSet, get: StoreGet) => ({
  ...INITIAL_CALL_STATE,
  callTimeouts: {},
  
  ...createCallActions(set, get),
  
  endCall: async (callId: string) => {
    const { callTimeouts, activeCall } = get();
    
    // Don't proceed if there's no active call or if the call ID doesn't match
    if (!activeCall || (activeCall.callId !== callId && callId !== 'any')) {
      console.log('[CallStore][endCall] No matching active call to end');
      return;
    }
    
    console.log(`[CallStore][endCall] Ending call ${callId}`);
    
    // Clear any pending timeouts
    Object.values(callTimeouts).forEach(timeout => clearTimeout(timeout));
    
    // Clean up peer connection
    if (activeCall.peerConnection) {
      console.log('[CallStore][endCall] Closing peer connection');
      try {
        // Close all transceivers
        activeCall.peerConnection.getTransceivers?.().forEach(transceiver => {
          try {
            transceiver.stop?.();
          } catch (e) {
            console.error('Error stopping transceiver:', e);
          }
        });
        
        // Close the connection
        activeCall.peerConnection.close();
      } catch (e) {
        console.error('Error closing peer connection:', e);
      }
    }
    
    // Stop all media tracks
    if (activeCall.localStream) {
      console.log('[CallStore][endCall] Stopping local stream tracks');
      activeCall.localStream.getTracks().forEach(track => {
        track.stop();
      });
    }
    
    if (activeCall.remoteStream) {
      console.log('[CallStore][endCall] Stopping remote stream tracks');
      activeCall.remoteStream.getTracks().forEach(track => {
        track.stop();
      });
    }
    
    // Reset the call state
    set({
      activeCall: null,
      isCallModalOpen: false,
      callStatus: 'IDLE',
      callTimeouts: {}
    });
    
    // Notify the other party that the call has ended
    if (callId !== 'any') {
      try {
        console.log('[CallStore][endCall] Notifying other party of call end');
        await useSocketStore.getState().endCall(callId);
      } catch (e) {
        console.error('Error notifying other party of call end:', e);
      }
    }
    
    console.log('[CallStore][endCall] Call ended and cleaned up');
  },
}));
