import { create } from 'zustand'
import { chatAPI, usersAPI } from '../services/api'
import { useSocketStore } from './socketStore'
import type { Conversation, Message, CreateConversationData, SendMessageData } from '../types/chat'

interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  isSending: boolean
  error: string | null
}

interface ChatActions {
  // Conversations
  fetchConversations: () => Promise<void>
  createConversation: (data: CreateConversationData) => Promise<Conversation | null>
  selectConversation: (conversationId: string) => Promise<void>
  
  // Messages
  sendMessage: (content: string, messageType?: string) => Promise<void>
  loadMoreMessages: () => Promise<void>
  
  // Search
  searchUsers: (query: string) => Promise<any[]>
  
  // Reset
  reset: () => void
}

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  ...initialState,

  // Fetch all conversations for the current user
  fetchConversations: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await chatAPI.getConversations()
      if (response.success) {
        set({ conversations: response.conversations })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to load conversations' })
      console.error('Error fetching conversations:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  // Create a new conversation
  createConversation: async (data: CreateConversationData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await chatAPI.createConversation(data)
      if (response.success) {
        // Add the new conversation to the list
        set(state => ({
          conversations: [response.conversation, ...state.conversations],
          currentConversation: response.conversation
        }))
        return response.conversation
      }
      return null
    } catch (error: any) {
      set({ error: error.message || 'Failed to create conversation' })
      console.error('Error creating conversation:', error)
      return null
    } finally {
      set({ isLoading: false })
    }
  },

  // Select a conversation and load its messages
  selectConversation: async (conversationId: string) => {
    set({ isLoading: true, error: null })
    try {
      // Find the conversation in the list
      const conversation = get().conversations.find(c => c.convoId === conversationId)
      if (conversation) {
        set({ currentConversation: conversation })
        
        // Join the conversation room for real-time updates
        const socket = useSocketStore.getState().socket
        if (socket) {
          socket.emit('join_conversation', { conversationId })
        }
        
        // Load messages
        const response = await chatAPI.getMessages(conversationId)
        if (response.success) {
          set({ messages: response.messages })
        }
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to load conversation' })
      console.error('Error selecting conversation:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  // Send a message in the current conversation
  sendMessage: async (content: string, messageType: string = 'TEXT') => {
    const { currentConversation, messages } = get()
    if (!currentConversation) return
    
    set({ isSending: true, error: null })
    
    try {
      const socket = useSocketStore.getState().socket
      const messageData: SendMessageData = { message: content, messageType }
      
      // Optimistically add the message to the UI
      const tempMessage: Message = {
        messageId: `temp-${Date.now()}`,
        convoId: currentConversation.convoId,
        senderId: 'current-user', // This will be replaced by the actual user ID from the backend
        senderUsername: 'You',
        msgType: messageType as any,
        contentText: content,
        timestamp: new Date().toISOString(),
        status: 'SENT'
      }
      
      set(state => ({
        messages: [...state.messages, tempMessage],
        conversations: state.conversations.map(conv => 
          conv.convoId === currentConversation.convoId 
            ? { ...conv, lastMessage: tempMessage, lastMessageAt: tempMessage.timestamp }
            : conv
        ).sort((a, b) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        )
      }))
      
      // Send the message via WebSocket for real-time delivery
      if (socket) {
        socket.emit('send_message', {
          conversationId: currentConversation.convoId,
          content,
          messageType
        })
      }
      
      // Also send via HTTP for persistence
      const response = await chatAPI.sendMessage(currentConversation.convoId, messageData)
      
      if (response.success) {
        // Replace the temporary message with the actual one from the server
        set(state => ({
          messages: state.messages.map(msg => 
            msg.messageId === tempMessage.messageId 
              ? response.message 
              : msg
          )
        }))
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to send message' })
      console.error('Error sending message:', error)
      
      // Mark the message as failed
      set(state => ({
        messages: state.messages.map(msg => 
          msg.messageId === tempMessage.messageId 
            ? { ...msg, status: 'FAILED' } 
            : msg
        )
      }))
    } finally {
      set({ isSending: false })
    }
  },

  // Load more messages for the current conversation (pagination)
  loadMoreMessages: async () => {
    const { currentConversation, messages } = get()
    if (!currentConversation || messages.length === 0) return
    
    set({ isLoading: true })
    
    try {
      const response = await chatAPI.getMessages(
        currentConversation.convoId, 
        Math.floor(messages.length / 50) + 1, // page number
        50 // limit
      )
      
      if (response.success && response.messages.length > 0) {
        set(state => ({
          messages: [...response.messages, ...state.messages],
          isLoading: false
        }))
      }
    } catch (error) {
      console.error('Error loading more messages:', error)
      set({ isLoading: false })
    }
  },

  // Search for users to start a new chat
  searchUsers: async (query: string) => {
    try {
      const response = await usersAPI.searchUsers(query)
      if (response.success) {
        return response.users
      }
      return []
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  },

  // Reset the store
  reset: () => set(initialState)
}))
