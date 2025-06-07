import { useSocketStore } from '../socketStore';
import { validateActiveCall, cleanupCallResources, clearCallTimeouts } from './callDataUtils';
import { sendCallEnd } from './socketUtils';
export const createEndCallAction = (set: any, get: any) => {
  return async (callId: string): Promise<void> => {
    console.log('[CallStore] endCall called for call ID:', callId);
    
    const { activeCall } = get();
    if (!validateActiveCall(activeCall, callId)) {
      return;
    }
    
    try {
      // Notify the other party that the call has ended
      sendCallEnd(useSocketStore, callId);
      
      // Clean up all call resources
      cleanupCallResources(activeCall);
      
      // Clear any pending timeouts
      clearCallTimeouts(get, set, callId);
      
      // Reset call state
      set({
        activeCall: null,
        isCallModalOpen: false,
        callStatus: 'IDLE',
      });
    } catch (error) {
      console.error('Error ending call:', error);
      // Still reset the state even if there was an error
      set({
        activeCall: null,
        isCallModalOpen: false,
        callStatus: 'FAILED',
      });
      throw error;
    }
  };
};