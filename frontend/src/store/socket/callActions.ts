import { SOCKET_EVENTS } from './constants';
import type { ActionCreator, SocketResponse } from './types';
// ======================
// Call Management
// ======================
export const createCallActions: ActionCreator = (_set, get) => ({
  sendCallOffer: (targetUserId: string, offer: any, callType: 'video' | 'audio'): Promise<void> => {
    return new Promise((resolve, reject) => {
      const { socket } = get();
      
      console.log('[SocketStore][sendCallOffer] Sending call offer:', {
        targetUserId,
        callType,
        socketConnected: socket?.connected,
        socketId: socket?.id,
        offerType: offer?.type,
        offerSdp: offer?.sdp ? `${offer.sdp.substring(0, 50)}...` : 'No SDP'
      });
      
      if (!socket) {
        const error = new Error('Socket not initialized');
        console.error('[SocketStore][sendCallOffer]', error.message);
        return reject(error);
      }
      
      if (!socket.connected) {
        console.log('[SocketStore][sendCallOffer] Socket not connected, attempting to connect...');
        const onConnect = () => {
          socket.off('connect', onConnect);
          emitCallOffer();
        };
        
        const onError = (error: any) => {
          socket.off('connect_error', onError);
          console.error('[SocketStore][sendCallOffer] Socket connection error:', error);
          reject(new Error(`Failed to connect: ${error?.message || 'Unknown error'}`));
        };
        
        socket.once('connect', onConnect);
        socket.once('connect_error', onError);
        socket.connect();
        return;
      }
      
      emitCallOffer();
      
      function emitCallOffer() {
        try {
          console.log('[SocketStore][sendCallOffer] Emitting call_offer event');
          
          // Set a timeout for the call offer
          const timeout = setTimeout(() => {
            reject(new Error('Call offer timeout'));
          }, 15000);
          
          socket.emit('call_offer', {
            targetUserId,
            offer,
            callType,
          }, (response: SocketResponse) => {
            clearTimeout(timeout);
            
            if (response?.success) {
              console.log('[SocketStore][sendCallOffer] Call offer sent successfully');
              resolve();
            } else {
              const errorMsg = response?.error || 'Failed to send call offer';
              console.error('[SocketStore][sendCallOffer] Call offer failed:', errorMsg);
              reject(new Error(errorMsg));
            }
          });
        } catch (error) {
          console.error('[SocketStore][sendCallOffer] Error emitting call_offer:', error);
          reject(error);
        }
      }
    });
  },
  
  answerCall: (callId: string, answer: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      const { socket } = get();
      
      if (!socket) {
        const error = new Error('Socket not initialized');
        console.error('[SocketStore][answerCall]', error.message);
        return reject(error);
      }
      
      console.log('[SocketStore][answerCall] Sending call answer:', {
        callId,
        socketConnected: socket.connected,
        answerType: answer?.type,
        answerSdp: answer?.sdp ? `${answer.sdp.substring(0, 50)}...` : 'No SDP'
      });
      
      if (!socket.connected) {
        const error = new Error('Cannot send answer: Socket not connected');
        console.error('[SocketStore][answerCall]', error.message);
        return reject(error);
      }
      
      try {
        socket.emit(SOCKET_EVENTS.CALL_ANSWER, { callId, answer }, (response: SocketResponse) => {
          if (response?.success) {
            console.log('[SocketStore][answerCall] Call answer sent successfully');
            resolve();
          } else {
            const errorMsg = response?.error || 'Failed to send call answer';
            console.error('[SocketStore][answerCall]', errorMsg);
            reject(new Error(errorMsg));
          }
        });
      } catch (error) {
        console.error('[SocketStore][answerCall] Error sending call answer:', error);
        reject(error);
      }
    });
  },
  
  rejectCall: (callId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const { socket } = get();
      
      if (!socket) {
        const error = new Error('Socket not initialized');
        console.error('[SocketStore][rejectCall]', error.message);
        return reject(error);
      }
      
      console.log('[SocketStore][rejectCall] Rejecting call:', {
        callId,
        socketConnected: socket.connected
      });
      
      if (!socket.connected) {
        const error = new Error('Cannot reject call: Socket not connected');
        console.error('[SocketStore][rejectCall]', error.message);
        return reject(error);
      }
      
      try {
        socket.emit(SOCKET_EVENTS.CALL_REJECT, { callId }, (response: SocketResponse) => {
          if (response?.success) {
            console.log('[SocketStore][rejectCall] Call rejection sent successfully');
            resolve();
          } else {
            const errorMsg = response?.error || 'Failed to reject call';
            console.error('[SocketStore][rejectCall]', errorMsg);
            reject(new Error(errorMsg));
          }
        });
      } catch (error) {
        console.error('[SocketStore][rejectCall] Error rejecting call:', error);
        reject(error);
      }
    });
  },
  
  endCall: (callId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const { socket } = get();
      
      if (!socket) {
        const error = new Error('Socket not initialized');
        console.error('[SocketStore][endCall]', error.message);
        return reject(error);
      }
      
      console.log('[SocketStore][endCall] Ending call:', {
        callId,
        socketConnected: socket.connected
      });
      
      if (!socket.connected) {
        console.warn('[SocketStore][endCall] Socket not connected, but continuing with local cleanup');
        return resolve();
      }
      
      try {
        socket.emit(SOCKET_EVENTS.CALL_END, { callId }, (response: SocketResponse) => {
          if (response?.success) {
            console.log('[SocketStore][endCall] Call end signal sent successfully');
            resolve();
          } else {
            const errorMsg = response?.error || 'Failed to send call end signal';
            console.error('[SocketStore][endCall]', errorMsg);
            // Still resolve since we want to clean up locally even if the server fails
            resolve();
          }
        });
      } catch (error) {
        console.error('[SocketStore][endCall] Error sending call end signal:', error);
        // Still resolve since we want to clean up locally even if there's an error
        resolve();
      }
    });
  },
  
  sendIceCandidate: (targetUserId: string, callId: string, candidate: RTCIceCandidate | null): Promise<void> => {
    return new Promise((resolve, reject) => {
      const { socket } = get();
      
      if (!socket) {
        const error = new Error('Socket not initialized');
        console.error('[SocketStore][sendIceCandidate]', error.message);
        return reject(error);
      }
      
      console.log('[SocketStore][sendIceCandidate] Sending ICE candidate:', {
        targetUserId,
        callId,
        candidate: candidate ? {
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex,
          usernameFragment: candidate.usernameFragment
        } : null,
        socketConnected: socket.connected
      });
      
      if (!socket.connected) {
        const error = new Error('Cannot send ICE candidate: Socket not connected');
        console.error('[SocketStore][sendIceCandidate]', error.message);
        return reject(error);
      }
      
      try {
        socket.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
          targetUserId,
          callId,
          candidate: candidate ? {
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex,
            usernameFragment: candidate.usernameFragment
          } : null
        }, (response: SocketResponse) => {
          if (response?.success) {
            console.log('[SocketStore][sendIceCandidate] ICE candidate sent successfully');
            resolve();
          } else {
            const errorMsg = response?.error || 'Failed to send ICE candidate';
            console.error('[SocketStore][sendIceCandidate]', errorMsg);
            reject(new Error(errorMsg));
          }
        });
      } catch (error) {
        console.error('[SocketStore][sendIceCandidate] Error sending ICE candidate:', error);
        reject(error);
      }
    });
  }
});