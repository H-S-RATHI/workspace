export interface MobileConversationListProps {
    onSelectConversation: () => void;
  }
  export interface SearchResult {
    userId: string;
    fullName?: string;
    username?: string;
    profilePhotoUrl?: string;
  }
  export interface ConversationMember {
    userId: string;
    fullName?: string;
    username?: string;
    profilePhotoUrl?: string;
  }
  export interface LastMessage {
    contentText?: string;
  }
  export interface Conversation {
    convoId: string;
    displayName?: string;
    isGroup: boolean;
    members?: ConversationMember[];
    lastMessage?: LastMessage;
    lastMessageAt: string;
    unreadCount: number;
  }
  export interface CreateConversationParams {
    participantIds: string[];
    isGroup: boolean;
  }

  import type { Message } from '../../../../../../types/chat';
export interface MobileChatWindowProps {
  onBack: () => void;
}
export interface DateHeaderProps {
  date: string;
}
export interface GroupedMessages {
  [dateKey: string]: Message[];
}
export interface CallHandling {
  handleCallStart: (type: 'audio' | 'video') => Promise<void>;
  handleEndCall: () => void;
  handleCallButtonClick: () => void;
  isCallDialogOpen: boolean;
  setIsCallDialogOpen: (open: boolean) => void;
}
export interface MessageHandling {
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  isSending: boolean;
}
export interface ScrollManagement {
  messagesEndRef: React.RefObject<HTMLDivElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  handleScroll: () => void;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}
export type CallType = 'audio' | 'video';