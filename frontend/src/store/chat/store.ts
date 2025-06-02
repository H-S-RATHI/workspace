import { create } from 'zustand'
import type { ChatStore } from './types'
import { 
  createConversationActions, 
  createMessageActions, 
  createSearchActions, 
  createUtilityActions 
} from './actions'
import { INITIAL_CHAT_STATE } from './constants'
// Create the store with proper typing
export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial State
  ...INITIAL_CHAT_STATE,
  
  // Combine all actions
  ...createConversationActions(set, get),
  ...createMessageActions(set, get),
  ...createSearchActions(set, get),
  ...createUtilityActions(set, get),
}))