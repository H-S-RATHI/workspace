import { CallActions, CallType, RTCSessionDescriptionInit } from './types';
import { createInitiateCallAction } from './initiateCall';
import { createAnswerCallAction } from './answerCall';
import { createRejectCallAction } from './rejectCall';
import { createEndCallAction } from './endCall';
export const createCallActions = (set: any, get: any): CallActions => ({
    initiateCall: createInitiateCallAction(set, get),
    answerCall: createAnswerCallAction(set, get),
    rejectCall: createRejectCallAction(set, get),
    endCall: createEndCallAction(set, get),
    setCallModalOpen: function (isOpen: boolean): void {
        throw new Error('Function not implemented.');
    },
    handleIncomingCall: function (data: { callId: string; callerId: string; callerUsername: string; callType: CallType; offer: RTCSessionDescriptionInit; }): Promise<void> {
        throw new Error('Function not implemented.');
    }
});