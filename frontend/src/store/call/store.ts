import { create } from 'zustand';
import type { CallStore, CallType, CallStatus, Call } from './types';
import { INITIAL_CALL_STATE } from './constants';
import { createCallActions } from './actions';
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
  
  setCallModalOpen: (isOpen) => set({ isCallModalOpen: isOpen }),
  
  handleIncomingCall: async (data) => {
    const { callId, callerId, callerUsername, callType, offer } = data;
    const { endCall } = get();
    const peerConnection = createPeerConnection();
    const remoteStream = new MediaStream();

    try {
      // Set up the peer connection
      peerConnection.ontrack = (event: RTCTrackEvent) => {
        if (event.streams && event.streams[0]) {
          event.streams[0].getTracks().forEach((track) => {
            if (!remoteStream.getTracks().some(t => t.id === track.id)) {
              remoteStream.addTrack(track);
            }
          });
        }
      };

      // Set up connection state change handler
      peerConnection.onconnectionstatechange = () => {
        console.log('Peer connection state changed:', peerConnection.connectionState);
        const { activeCall } = get();
        if (peerConnection.connectionState === 'disconnected' || 
            peerConnection.connectionState === 'failed' || 
            peerConnection.connectionState === 'closed') {
          if (activeCall) {
            endCall(activeCall.callId);
          }
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
          const { socket } = useSocketStore.getState();
          const { activeCall } = get();
          if (socket && activeCall) {
            socket.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
              to: activeCall.otherParty.userId,
              callId: activeCall.callId,
              candidate: event.candidate,
            });
          }
        }
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
          status: 'RINGING',
          startedAt: new Date().toISOString(),
          isIncoming: true,
          peerConnection,
          remoteStream,
          otherParty: {
            userId: callerId,
            username: callerUsername,
            fullName: callerUsername,
            profilePhotoUrl: '',
          },
        },
        isCallModalOpen: true,
      });

      // Send the answer back to the caller
      useSocketStore.getState().emit(SOCKET_EVENTS.CALL_ANSWERED, {
        callId,
        answer: peerConnection.localDescription
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
      set((state: CallStoreState) => ({
        ...state,
        callTimeouts: {
          ...state.callTimeouts,
          [callId]: timeoutId,
        },
      }));
      
    } catch (error) {
      console.error('Error handling incoming call:', error);
      endCall(callId);
      toast.error('Failed to handle incoming call');
    }
  },
  
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
    const socket = useSocketStore.getState().socket;
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.CALL_ENDED, {
        callId,
        reason: 'Call ended'
      });
    } else {
      console.warn('[CallStore][endCall] Cannot send CALL_ENDED: Socket not connected');
    }
  },
}));
