/**
 * Call-related socket operations
 */
import { CallType, CallOfferResponse, CallOfferData, DebugListeners } from './socketTypes';
import { SOCKET_TIMEOUTS, DEBUG_EVENTS, LOG_PREFIXES } from './socketConstants';
import { ensureSocketConnected, validateSocketInstance, logSocketState } from './socketValidations';
/**
 * Generates a unique call ID
 * @returns Unique call identifier
 */
const generateCallId = (): string => {
  return `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
/**
 * Sets up debug event listeners for socket monitoring
 * @param socket - The socket instance
 * @returns Object with debug listeners and cleanup function
 */
const setupDebugListeners = (socket: any): { 
  debugListeners: DebugListeners; 
  cleanupDebugListeners: () => void;
  canListen: boolean;
} => {
  const debugListeners: DebugListeners = {};
  const canListen = typeof socket.on === 'function';
  
  if (!canListen) {
    console.warn(`${LOG_PREFIXES.SOCKET_UTILS} Socket does not support event listening`);
    return { 
      debugListeners, 
      cleanupDebugListeners: () => {}, 
      canListen: false 
    };
  }
  DEBUG_EVENTS.forEach(event => {
    debugListeners[event] = (...args: any[]) => {
      console.log(LOG_PREFIXES.EVENT(event), ...args);
    };
    try {
      socket.on(event, debugListeners[event]);
    } catch (err) {
      console.error(`${LOG_PREFIXES.SOCKET_UTILS} Failed to listen to ${event}:`, err);
    }
  });
  const cleanupDebugListeners = () => {
    Object.entries(debugListeners).forEach(([event, listener]) => {
      try {
        socket.off(event, listener);
      } catch (err) {
        console.error(`${LOG_PREFIXES.SOCKET_UTILS} Error removing ${event} listener:`, err);
      }
    });
  };
  return { debugListeners, cleanupDebugListeners, canListen };
};
/**
 * Sends a call offer to a target user
 * @param useSocketStore - The socket store hook
 * @param targetUserId - ID of the user to call
 * @param offer - RTC session description for the offer
 * @param callType - Type of call (audio or video)
 * @throws Error if call offer fails
 */
export const sendCallOffer = async (
  useSocketStore: any,
  targetUserId: string,
  offer: RTCSessionDescriptionInit,
  callType: CallType
): Promise<void> => {
  const callId = generateCallId();
  
  console.log(`${LOG_PREFIXES.SOCKET_UTILS} Sending call offer to peer:`, { 
    callId,
    targetUserId, 
    callType,
    offerType: offer.type,
    sdp: offer.sdp ? `${offer.sdp.substring(0, 50)}...` : 'No SDP',
    timestamp: new Date().toISOString()
  });
  
  try {
    // Get the socket instance from the store
    const socket = useSocketStore.getState().socket;
    
    validateSocketInstance(socket);
    logSocketState(socket);
    
    const { debugListeners, cleanupDebugListeners, canListen } = setupDebugListeners(socket);
    
    try {
      // Ensure socket is connected
      try {
        await ensureSocketConnected(socket);
        console.log(`${LOG_PREFIXES.SOCKET_UTILS} Socket verified as connected, sending call offer...`);
      } catch (error) {
        console.error(`${LOG_PREFIXES.SOCKET_UTILS} Failed to ensure socket connection:`, error);
        throw new Error('Failed to establish socket connection');
      }
      
      console.log(`${LOG_PREFIXES.SOCKET_UTILS} Emitting call_offer event with data:`, {
        callId,
        targetUserId,
        callType,
        hasOffer: !!offer,
        offerType: offer?.type,
        timestamp: new Date().toISOString()
      });
      // Verify socket is still connected before sending
      if (!socket.connected) {
        throw new Error('Socket is not connected');
      }
      
      // Send the call offer with a timeout
      console.log(`${LOG_PREFIXES.SOCKET_UTILS} Sending call_offer event...`);
      
      const response = await new Promise<void>((resolve, reject) => {
        const offerTimeout = setTimeout(() => {
          cleanupDebugListeners();
          reject(new Error('Call offer timeout'));
        }, SOCKET_TIMEOUTS.CALL_OFFER_TIMEOUT);
        console.log(`${LOG_PREFIXES.SOCKET_UTILS} Sending call_offer event...`);
        
        const callOfferData: CallOfferData = {
          callId,
          targetUserId,
          offer,
          callType,
          timestamp: Date.now()
        };
        socket.emit('call_offer', callOfferData, (response: CallOfferResponse) => {
          clearTimeout(offerTimeout);
          cleanupDebugListeners();
          
          if (response?.success) {
            console.log(`${LOG_PREFIXES.SOCKET_UTILS} Call offer sent successfully`);
            resolve();
          } else {
            const errorMsg = response?.error || 'Failed to send call offer';
            console.error(`${LOG_PREFIXES.SOCKET_UTILS} Call offer failed:`, errorMsg);
            reject(new Error(errorMsg));
          }
        });
      });
      return response;
    } catch (error) {
      // Clean up debug listeners in case of error
      if (typeof socket.off === 'function') {
        cleanupDebugListeners();
      }
      console.error(`${LOG_PREFIXES.SOCKET_UTILS} Error in sendCallOffer:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`${LOG_PREFIXES.SOCKET_UTILS} Error in sendCallOffer:`, error);
    throw error; // Re-throw to be handled by the caller
  }
};
/**
 * Sends a call answer to the caller
 * @param useSocketStore - The socket store hook
 * @param callId - ID of the call to answer
 * @param localDescription - RTC session description for the answer
 */
export const sendCallAnswer = (
  useSocketStore: any,
  callId: string,
  localDescription: RTCSessionDescriptionInit
): void => {
  console.log(`${LOG_PREFIXES.SOCKET_UTILS} Sending answer to caller`);
  
  const { answerCall } = useSocketStore.getState();
  answerCall(callId, localDescription);
};
/**
 * Sends a call rejection to the caller
 * @param useSocketStore - The socket store hook
 * @param callId - ID of the call to reject
 */
export const sendCallRejection = (
  useSocketStore: any,
  callId: string
): void => {
  console.log(`${LOG_PREFIXES.SOCKET_UTILS} Sending call:reject event`);
  
  const { rejectCall } = useSocketStore.getState();
  rejectCall(callId);
};
/**
 * Sends a call end notification
 * @param useSocketStore - The socket store hook
 * @param callId - ID of the call to end
 */
export const sendCallEnd = (
  useSocketStore: any,
  callId: string
): void => {
  console.log(`${LOG_PREFIXES.SOCKET_UTILS} Sending call end notification`);
  
  const { endCall } = useSocketStore.getState();
  endCall(callId);
};