import { create } from 'zustand';
import type { CallStore, CallType, CallStatus, Call } from './types';
import { INITIAL_CALL_STATE } from './constants';
import { createCallActions } from './actions';
import { useSocketStore } from '../socketStore';
import { SOCKET_EVENTS } from '../socket/constants';
import { toast } from 'react-hot-toast';

// Create a custom store creator that combines our enhanced functionality with the base actions
const createEnhancedCallStore = (set: any, get: any) => {
  // Start with the base call actions
  const baseActions = createCallActions(set, get);

  return {
    ...baseActions,
    
    // Enhanced endCall implementation
    endCall: (callId: string) => {
      console.log('[CallStore][endCall] Ending call with ID:', callId);
      const { callTimeouts, activeCall } = get();
      
      // If no call is active, nothing to do
      if (!activeCall) {
        console.log('[CallStore][endCall] No active call to end');
        return;
      }
      
      // Clear all timeouts to be safe
      Object.values(callTimeouts).forEach((timeout: any) => clearTimeout(timeout));
      set((state: CallStore) => ({
        ...state,
        callTimeouts: {}
      }));
      
      // If a specific call ID was provided and it doesn't match the active call, ignore
      if (callId !== 'any' && activeCall.callId !== callId) {
        console.log(`[CallStore][endCall] Call ID ${callId} doesn't match active call ${activeCall.callId}, ignoring`);
        return;
      }
      
      // Clean up peer connection if exists
      if (activeCall?.peerConnection) {
        console.log('[CallStore][endCall] Closing peer connection');
        try {
          // Close all transceivers
          activeCall.peerConnection.getTransceivers().forEach((transceiver: RTCRtpTransceiver) => {
            try {
              if (transceiver.sender) {
                transceiver.sender.track?.stop();
              }
              if (transceiver.receiver) {
                transceiver.receiver.track?.stop();
              }
              if (transceiver.stop) {
                transceiver.stop();
              }
            } catch (error) {
              console.error('[CallStore][endCall] Error stopping transceiver:', error);
            }
          });
          
          // Close the connection
          activeCall.peerConnection.close();
        } catch (error) {
          console.error('[CallStore][endCall] Error closing peer connection:', error);
        }
      }
      
      // Stop all media tracks in local and remote streams
      if (activeCall?.localStream) {
        console.log('[CallStore][endCall] Stopping local stream tracks');
        activeCall.localStream.getTracks().forEach((track: MediaStreamTrack) => {
          try {
            track.stop();
          } catch (error) {
            console.error('[CallStore][endCall] Error stopping local track:', error);
          }
        });
      }
      
      if (activeCall?.remoteStream) {
        console.log('[CallStore][endCall] Stopping remote stream tracks');
        activeCall.remoteStream.getTracks().forEach((track: MediaStreamTrack) => {
          try {
            track.stop();
          } catch (error) {
            console.error('[CallStore][endCall] Error stopping remote track:', error);
          }
        });
      }
      
      // Notify the other party that the call has ended
      const socket = useSocketStore.getState().socket;
      if (socket?.connected) {
        console.log('[CallStore][endCall] Sending CALL_END event for call:', callId);
        socket.emit(SOCKET_EVENTS.CALL_END, { callId });
        
        // Also emit CALL_ENDED for backward compatibility
        socket.emit('call:ended', {
          callId,
          reason: 'Call ended by user'
        });
      } else {
        console.warn('[CallStore][endCall] Cannot send CALL_ENDED: Socket not connected');
      }
      
      // Reset the call state
      console.log('[CallStore][endCall] Resetting call state');
      set({
        activeCall: null,
        isCallModalOpen: false,
      });
    },
    
    // Enhanced initiateCall implementation
    initiateCall: async ({ targetUserId, callType }: { targetUserId: string; callType: CallType }) => {
      console.log('[CallStore][initiateCall] Starting call with:', { targetUserId, callType });
      
      // Get current state
      const currentState = get();
      console.log('[CallStore][initiateCall] Current call state:', currentState.activeCall);
      
      // If there's an active call, end it first
      if (currentState.activeCall) {
        console.log('[CallStore][initiateCall] Active call found, ending it first');
        currentState.endCall(currentState.activeCall.callId);
        // Small delay to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Delegate to the base implementation
      return baseActions.initiateCall({ targetUserId, callType });
    }
  };
};

// Create the actual store
export const useCallStore = create(
  (set: any, get: any) => ({
    ...INITIAL_CALL_STATE,
    ...createEnhancedCallStore(set, get),
  })
);

export default useCallStore;
