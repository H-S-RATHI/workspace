import type { Call, CallState } from './types';

export const CALL_STATUS = {
  IDLE: 'IDLE',
  RINGING: 'RINGING',
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED',
  FAILED: 'FAILED',
} as const;

export const INITIAL_CALL_STATE: CallState = {
  activeCall: null,
  isCallModalOpen: false,
  callStatus: 'IDLE',
};