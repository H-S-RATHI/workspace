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
  
  endCall: (callId: string) => {
    const { callTimeouts, activeCall } = get();
    
    // Clear the timeout if it exists
    if (callTimeouts[callId]) {
      clearTimeout(callTimeouts[callId]);
      set((state: CallStoreState) => {
        const newTimeouts = { ...state.callTimeouts };
        delete newTimeouts[callId];
        return {
          ...state,
          callTimeouts: newTimeouts
        };
      });
    }
    
    // Clean up peer connection if exists
    if (activeCall?.peerConnection) {
      activeCall.peerConnection.close();
    }
    
    // Reset the call state
    set({
      activeCall: null,
      isCallModalOpen: false,
    });
    
    // Notify the other party that the call has ended
    useSocketStore.getState().endCall(callId);
  },
}));
