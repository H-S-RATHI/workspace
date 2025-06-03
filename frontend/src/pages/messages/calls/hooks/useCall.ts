import { useCallStore } from '../../../../store/call'

export const useCall = () => {
  // Directly use the Zustand call store for global state
  return useCallStore();
};