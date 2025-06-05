import { create } from 'zustand';
import type { CallStore } from './types';
import { INITIAL_CALL_STATE } from './constants';
import { createCallActions } from './actions';

export const useCallStore = create<CallStore>((set, get) => ({
  ...INITIAL_CALL_STATE,
  
  // Add modal state management
  setCallModalOpen: (isOpen) => set({ isCallModalOpen: isOpen }),
  
  // Add call actions
  ...createCallActions(set, get),
}));