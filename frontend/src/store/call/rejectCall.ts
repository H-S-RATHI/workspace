import { useSocketStore } from '../socketStore';
import { validateActiveCall, cleanupCallResources } from './callDataUtils';
import { sendCallRejection } from './socketUtils';
export const createRejectCallAction = (set: any, get: any) => {
  return (callId: string): void => {
    console.log('[CallStore] rejectCall called with:', { callId });
    
    const { activeCall } = get();
    if (!validateActiveCall(activeCall, callId)) {
      return;
    }
    
    // Send rejection notification
    sendCallRejection(useSocketStore, callId);
    
    // Clean up resources
    cleanupCallResources(activeCall);
    
    // Reset call state
    set({
      activeCall: null,
      isCallModalOpen: false,
    });
  };
};