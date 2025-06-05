import { useCallback } from 'react';
import { useCallStore } from '@/store/call/store';

export const useCall = () => {
  const state = useCallStore();
  
  // Wrap actions in useCallback to prevent unnecessary re-renders
  const initiateCall = useCallback(
    (params: { targetUserId: string; callType: 'video' | 'audio' }) => 
      state.initiateCall(params),
    [state]
  );
  
  const answerCall = useCallback(
    (callId: string, answer: any) => state.answerCall(callId, answer),
    [state]
  );
  
  const rejectCall = useCallback(
    (callId: string) => state.rejectCall(callId),
    [state]
  );
  
  const endCall = useCallback(
    (callId: string) => state.endCall(callId),
    [state]
  );

  return {
    // State
    activeCall: state.activeCall,
    isCallModalOpen: state.isCallModalOpen,
    
    // Actions
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
  };
};