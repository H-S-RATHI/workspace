import { useState, useCallback } from 'react';
import { useCallStore } from '@/store/call/store';
import { CallType } from '../types';
interface UseCallHandlingProps {
  otherUserId: string | null;
}
export const useCallHandling = ({ otherUserId }: UseCallHandlingProps) => {
  const { 
    activeCall, 
    initiateCall, 
    endCall, 
    isCallInProgress,
    isCallActive
  } = useCallStore();
  
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  // Handle starting a call
  const handleCallStart = useCallback(async (type: CallType) => {
    if (!otherUserId) {
      console.error('Cannot start call: No target user ID');
      return;
    }
    console.log('[MobileChatWindow] Starting', type, 'call to user:', otherUserId);
    
    try {
      await initiateCall({
        targetUserId: otherUserId,
        callType: type,
      });
      setIsCallDialogOpen(false);
    } catch (error) {
      console.error('Failed to start call:', error);
      // Handle error (show toast, etc.)
    }
  }, [otherUserId, initiateCall]);
  // Handle ending a call
  const handleEndCall = useCallback(() => {
    if (activeCall?.callId) {
      endCall(activeCall.callId);
    }
  }, [activeCall, endCall]);
  
  // Open call dialog
  const handleCallButtonClick = useCallback(() => {
    if (!otherUserId) {
      console.error('Cannot start call: No target user ID');
      return;
    }
    setIsCallDialogOpen(true);
  }, [otherUserId]);
  return {
    handleCallStart,
    handleEndCall,
    handleCallButtonClick,
    isCallDialogOpen,
    setIsCallDialogOpen,
    isCallInProgress,
    isCallActive,
    activeCall
  };
};