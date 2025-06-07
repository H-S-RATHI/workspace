// Export all types
export * from './types';
// Import all action creators
import { createConnectionActions } from './connectionActions';
import { createConversationActions } from './conversationActions';
import { createMessageActions } from './messageActions';
import { createCallActions } from './callActions';
import type { SetState, GetState, ActionCreators } from './types';
// ======================
// Combined Actions
// ======================
/**
 * Creates all socket-related actions combined into a single object
 */
export const createSocketActions = (set: SetState, get: GetState) => {
  // Create all action groups
  const connectionActions = createConnectionActions(set, get);
  const conversationActions = createConversationActions(set, get);
  const messageActions = createMessageActions(set, get);
  const callActions = createCallActions(set, get);
  
  // Combine all actions into a single object
  return {
    ...connectionActions,
    ...conversationActions,
    ...messageActions,
    ...callActions
  };
};
/**
 * Action creators for testing and internal use
 */
export const actionCreators: ActionCreators = {
  createConnectionActions,
  createConversationActions,
  createMessageActions,
  createCallActions
};
// Export individual action creators for selective imports
export {
  createConnectionActions,
  createConversationActions,
  createMessageActions,
  createCallActions
};