import { create } from 'zustand';
import type { CallStore, CallType } from './types';
import { INITIAL_CALL_STATE } from './constants';
import { createCallActions } from './actions';

// Importing CALL_STATUS from constants
import { useSocketStore } from '../socketStore';
import { SOCKET_EVENTS } from '../socket/constants';
import { toast } from 'react-hot-toast';

// Extend the Window interface to include the RTCPeerConnection type
declare global {
  interface Window {
    RTCPeerConnection: typeof RTCPeerConnection;
    webkitRTCPeerConnection: typeof RTCPeerConnection;
  }
}

// Helper function to create a peer connection
const createPeerConnection = (): RTCPeerConnection => {
  const RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection;
  return new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  }) as RTCPeerConnection;
};

// Type for call timeouts

// Extend the CallStore interface with additional state and methods
interface CallStoreState extends CallStore {
  callTimeouts: Record<string, NodeJS.Timeout>;
  setCallModalOpen: (isOpen: boolean) => void;
  handleIncomingCall: (data: {
    callId: string;
    callerId: string;
    callerUsername: string;
    callType: CallType;
    offer: RTCSessionDescriptionInit; // Only accept the init type from the wire
  }) => Promise<void>;
}

export const useCallStore = create<CallStoreState>((set, get) => ({
  ...INITIAL_CALL_STATE,
  callTimeouts: {},
  
  setCallModalOpen: (isOpen) => set({ isCallModalOpen: isOpen }),
  
  handleIncomingCall: async (data: {
    callId: string;
    callerId: string;
    callerUsername: string;
    callType: CallType;
    offer: RTCSessionDescriptionInit;
  }): Promise<void> => {
    const { callId, callerId, callerUsername, callType, offer } = data;
    const { endCall } = get();
    const peerConnection = createPeerConnection();
    const remoteStream = new MediaStream();

    try {
      // Set up the peer connection
      peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };

      // Create a native RTCSessionDescription from the offer
      const sessionDescription = new RTCSessionDescription(offer);

      // Set the remote description
      await peerConnection.setRemoteDescription(sessionDescription);

      // Create and set local description
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Update the store with the incoming call
      set({
        activeCall: {
          callId,
          callType,
          status: 'RINGING' as const, // Using const assertion for type safety
          startedAt: new Date().toISOString(),
          isIncoming: true,
          peerConnection,
          remoteStream,
          otherParty: {
            userId: callerId,
            username: callerUsername,
            fullName: callerUsername, // TODO: Get full name from user data
            profilePhotoUrl: '', // TODO: Get profile photo URL
          },
        },
        isCallModalOpen: true,
      });

      // Send the answer back to the caller
      useSocketStore.getState().emit(SOCKET_EVENTS.CALL_ANSWERED, {
        callId,
        answer
      });
      
      // Set a timeout to end the call if not answered
      const timeoutId = setTimeout(() => {
        const currentState = get();
        const currentCall = currentState.activeCall;
        if (currentCall && currentCall.status === 'RINGING') {
          if (currentCall.peerConnection) {
            currentCall.peerConnection.close();
          }
          set({ activeCall: null, isCallModalOpen: false });
          useSocketStore.getState().emit(SOCKET_EVENTS.CALL_ENDED, {
            callId,
            reason: 'Call timed out',
          });
          toast.error('Call timed out');
        }
      }, 30000);
      
      // Store the timeout ID for cleanup
      set({
        callTimeouts: {
          ...get().callTimeouts,
          [callId]: timeoutId,
        },
      });
      
      return;
    } catch (error) {
      console.error('Error handling incoming call:', error);
      endCall(callId);
      toast.error('Failed to handle incoming call');
      return;
    }
  },
  

  
  ...createCallActions(set, get),
  
  endCall: (callId: string): void => {
    const { callTimeouts, activeCall } = get();
    
    // Clear the timeout if it exists
    if (callTimeouts[callId]) {
      clearTimeout(callTimeouts[callId]);
      const newTimeouts = { ...callTimeouts };
      delete newTimeouts[callId];
      set({ callTimeouts: newTimeouts });
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
    useSocketStore.getState().emit(SOCKET_EVENTS.CALL_ENDED, {
      callId,
      reason: 'Call ended'
    });
  },
}));