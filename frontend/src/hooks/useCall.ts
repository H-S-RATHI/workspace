import { useState, useEffect, useCallback } from 'react'
import { useSocketStore } from '../store/socketStore'
import type { Call } from '../types/chat'

interface UseCallReturn {
  activeCall: Call | null
  isCallModalOpen: boolean
  initiateCall: (targetUserId: string, callType: 'video' | 'audio') => void
  endCall: () => void
  answerCall: () => void
  rejectCall: () => void
}

export const useCall = (): UseCallReturn => {
  const { socket, sendCallOffer, answerCall: socketAnswerCall, rejectCall: socketRejectCall, endCall: socketEndCall } = useSocketStore()
  const [activeCall, setActiveCall] = useState<Call | null>(null)
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)

  const initiateCall = useCallback(async (targetUserId: string, callType: 'video' | 'audio') => {
    try {
      // Get user media first to ensure permissions
      const constraints = {
        video: callType === 'video',
        audio: true
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Create peer connection and offer
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      })

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream)
      })

      // Create offer
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      // Send offer through socket
      sendCallOffer(targetUserId, offer, callType)

      // Set up active call state
      setActiveCall({
        callId: '', // Will be set when call is created on backend
        callType,
        status: 'RINGING',
        startedAt: new Date().toISOString(),
        isIncoming: false,
        otherParty: {
          userId: targetUserId,
          username: '', // Will be populated from user data
          fullName: '',
          profilePhotoUrl: ''
        }
      })
      
      setIsCallModalOpen(true)
      
      // Clean up stream for now - will be re-initialized in VideoCall component
      stream.getTracks().forEach(track => track.stop())
      
    } catch (error) {
      console.error('Error initiating call:', error)
      alert('Failed to access camera/microphone. Please check permissions.')
    }
  }, [sendCallOffer])

  const endCall = useCallback(() => {
    if (activeCall) {
      socketEndCall(activeCall.callId)
    }
    setActiveCall(null)
    setIsCallModalOpen(false)
  }, [activeCall, socketEndCall])

  const answerCall = useCallback(() => {
    if (activeCall) {
      socketAnswerCall(activeCall.callId, {}) // Answer will be created in VideoCall component
      setActiveCall(prev => prev ? { ...prev, status: 'ACTIVE' } : null)
    }
  }, [activeCall, socketAnswerCall])

  const rejectCall = useCallback(() => {
    if (activeCall) {
      socketRejectCall(activeCall.callId)
    }
    setActiveCall(null)
    setIsCallModalOpen(false)
  }, [activeCall, socketRejectCall])

  // Listen for incoming calls
  useEffect(() => {
    if (socket) {
      const handleIncomingCall = (data: {
        callId: string
        callerId: string
        callerUsername: string
        offer: any
        callType: 'video' | 'audio'
      }) => {
        setActiveCall({
          callId: data.callId,
          callType: data.callType,
          status: 'RINGING',
          startedAt: new Date().toISOString(),
          isIncoming: true,
          otherParty: {
            userId: data.callerId,
            username: data.callerUsername,
            fullName: data.callerUsername, // Fallback to username
            profilePhotoUrl: ''
          }
        })
        setIsCallModalOpen(true)
      }

      const handleCallAnswered = (data: { callId: string, answer: any }) => {
        setActiveCall(prev => prev ? { ...prev, status: 'ACTIVE' } : null)
      }

      const handleCallRejected = (data: { callId: string }) => {
        setActiveCall(null)
        setIsCallModalOpen(false)
      }

      const handleCallEnded = (data: { callId: string }) => {
        setActiveCall(null)
        setIsCallModalOpen(false)
      }

      socket.on('incoming_call', handleIncomingCall)
      socket.on('call_answered', handleCallAnswered)
      socket.on('call_rejected', handleCallRejected)
      socket.on('call_ended', handleCallEnded)

      return () => {
        socket.off('incoming_call', handleIncomingCall)
        socket.off('call_answered', handleCallAnswered)
        socket.off('call_rejected', handleCallRejected)
        socket.off('call_ended', handleCallEnded)
      }
    }
  }, [socket])

  return {
    activeCall,
    isCallModalOpen,
    initiateCall,
    endCall,
    answerCall,
    rejectCall
  }
}