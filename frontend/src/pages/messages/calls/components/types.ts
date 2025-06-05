export interface CallUser {
  userId: string
  username: string
  fullName: string
  profilePhotoUrl?: string
}

export type CallType = 'video' | 'audio'

export interface VideoCallProps {
  callId: string
  isIncoming: boolean
  otherParty: CallUser
  callType: CallType
  onCallEnd: () => void
}

export interface RTCConfig {
  iceServers: Array<{
    urls: string | string[]
    username?: string
    credential?: string
  }>
}

export interface CallControlsProps {
  isMuted: boolean
  isVideoOff: boolean
  callType: CallType
  onToggleMute: () => void
  onToggleVideo: () => void
  onEndCall: () => void
}

export interface CallStatusProps {
  callType: CallType
  isCallActive: boolean
  callDuration: number
  otherParty: CallUser
}

export interface MediaStreamsProps {
  localVideoRef: React.RefObject<HTMLVideoElement>
  remoteVideoRef: React.RefObject<HTMLVideoElement>
  isVideoOff: boolean
  callType: CallType
  otherParty: CallUser
}
