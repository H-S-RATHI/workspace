const CHAT_STORAGE_KEY = 'whatsapp_clone_chat_data';
const MAX_CONVERSATIONS = 50; // Maximum number of conversations to store
const MAX_MESSAGES_PER_CONVERSATION = 100; // Maximum messages per conversation to store

type StoredConversation = {
  convoId: string;
  lastUpdated: string;
  messages: any[]; // Using any to avoid type complexity, will be properly typed in the store
};

// Get all stored conversations from localStorage
export const getStoredConversations = (): Record<string, StoredConversation> => {
  try {
    const data = localStorage.getItem(CHAT_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return {};
  }
};

// Get messages for a specific conversation
export const getStoredMessages = (conversationId: string): any[] => {
  const conversations = getStoredConversations();
  return conversations[conversationId]?.messages || [];
};

// Save messages for a conversation
export const saveMessages = (conversationId: string, messages: any[]) => {
  try {
    const conversations = getStoredConversations();
    
    // Limit the number of messages stored per conversation
    const messagesToStore = messages.slice(-MAX_MESSAGES_PER_CONVERSATION);
    
    // Update or create the conversation entry
    conversations[conversationId] = {
      convoId: conversationId,
      lastUpdated: new Date().toISOString(),
      messages: messagesToStore
    };
    
    // Clean up old conversations if we have too many
    const conversationList = Object.values(conversations);
    if (conversationList.length > MAX_CONVERSATIONS) {
      // Sort by lastUpdated (oldest first) and remove the oldest ones
      conversationList
        .sort((a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime())
        .slice(0, conversationList.length - MAX_CONVERSATIONS)
        .forEach(conv => {
          delete conversations[conv.convoId];
        });
    }
    
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Clear all chat data from localStorage
export const clearChatStorage = () => {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing chat storage:', error);
  }
};
