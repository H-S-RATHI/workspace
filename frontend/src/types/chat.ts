export interface Message {
  id: string; // Unique message ID (same as messageId for backward compatibility)
  messageId: string
  convoId: string
  senderId: string
  senderUsername: string
  senderPhoto?: string
  msgType: 'TEXT' | 'IMAGE' | 'VOICE' | 'LOCATION' | 'PAYMENT'
  contentText?: string
  contentUrl?: string
  longitude?: number
  latitude?: number
  paymentTxnId?: string
  timestamp: string
  status: 'SENT' | 'DELIVERED' | 'READ'
}

export interface Conversation {
  convoId: string
  isGroup: boolean
  groupName?: string
  groupPhotoUrl?: string
  displayName: string
  displayPhoto?: string
  lastMessage?: Message
  lastMessageAt: string
  unreadCount: number
  members: ConversationMember[]
  createdAt: string
  // For direct conversations (isGroup = false), this is the ID of the other user
  userId?: string
}

export interface ConversationMember {
  userId: string
  username: string
  fullName: string
  profilePhotoUrl?: string
  role: 'ADMIN' | 'MEMBER'
  joinedAt: string
}

export interface Call {
  callId: string
  callType: 'video' | 'audio'
  status: 'RINGING' | 'ACTIVE' | 'ENDED' | 'REJECTED'
  startedAt: string
  endedAt?: string
  duration?: number
  isIncoming: boolean
  otherParty: {
    userId: string
    username: string
    fullName: string
    profilePhotoUrl?: string
  }
}

export interface CreateConversationData {
  participantIds: string[]
  isGroup?: boolean
  groupName?: string
}

export interface SendMessageData {
  message?: string
  messageType?: 'TEXT' | 'IMAGE' | 'VOICE' | 'LOCATION' | 'PAYMENT'
  contentUrl?: string
}