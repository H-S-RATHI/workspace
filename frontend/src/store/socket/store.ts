import { create } from 'zustand'
import { SocketStore } from './types'
import { 
  createConnectionActions,
  createConversationActions,
  createMessageActions,
  createCallActions
} from './actions'
import { INITIAL_SOCKET_STATE } from './constants'

// Create the store with proper typing
type StoreSet = (partial: SocketStore | Partial<SocketStore> | ((state: SocketStore) => SocketStore | Partial<SocketStore>), replace?: boolean) => void
type StoreGet = () => SocketStore

export const useSocketStore = create<SocketStore>((set: StoreSet, get: StoreGet) => ({
  // Initial State
  ...INITIAL_SOCKET_STATE,
  
  // Combine all actions
  ...createConnectionActions(set, get),
  ...createConversationActions(set, get),
  ...createMessageActions(set, get),
  ...createCallActions(set, get),
}))