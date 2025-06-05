import React, { useEffect, useRef, useState } from 'react'
import { useSocketStore } from '../../../../store/socketStore'
import Button from '../../../../components/ui/Button'

interface VideoCallProps {
  callId: string
  isIncoming: boolean
  otherParty: {
    userId: string
    username: string
    fullName: string
    profilePhotoUrl?: string
  }
  callType: 'video' | 'audio'
  onCallEnd: () => void
}

const VideoCall: React.FC<VideoCallProps> = ({
  callId,
  isIncoming,
  otherParty,
  callType,
  onCallEnd
}) => {
  const { socket, answerCall, rejectCall, endCall } = useSocketStore()
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio')
  const [callDuration, setCallDuration] = useState(0)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const callStartTimeRef = useRef<number | null>(null)

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }

  useEffect(() => {
    if (socket) {
      // Listen for call events
      socket.on('call_answered', handleCallAnswered)
      socket.on('call_rejected', handleCallRejected)
      socket.on('call_ended', handleCallEnded)
      socket.on('ice_candidate', handleIceCandidate)

      return () => {
        socket.off('call_answered', handleCallAnswered)
        socket.off('call_rejected', handleCallRejected)
        socket.off('call_ended', handleCallEnded)
        socket.off('ice_candidate', handleIceCandidate)
      }
    }
  }, [socket])

  useEffect(() => {
    // Start call duration timer when call becomes active
    if (isCallActive && !callStartTimeRef.current) {
      callStartTimeRef.current = Date.now()
      const interval = setInterval(() => {
        if (callStartTimeRef.current) {
          setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000))
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isCallActive])

  const initializeMedia = async () => {
    try {
      const constraints = {
        video: callType === 'video' && !isVideoOff,
        audio: true
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      localStreamRef.current = stream

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      return stream
    } catch (error) {
      console.error('Error accessing media devices:', error)
      throw error
    }
  }

  const createPeerConnection = () => {
    const peerConnection = new RTCPeerConnection(rtcConfig)
    peerConnectionRef.current = peerConnection

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current!)
      })
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams
      remoteStreamRef.current = remoteStream
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
      }
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice_candidate', {
          targetUserId: otherParty.userId,
          candidate: event.candidate
        })
      }
    }

    return peerConnection
  }

  const handleAnswerCall = async () => {
    try {
      await initializeMedia()
      const peerConnection = createPeerConnection()

      // Create answer
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

      answerCall(callId, answer)
      setIsCallActive(true)
    } catch (error) {
      console.error('Error answering call:', error)
      handleRejectCall()
    }
  }

  const handleRejectCall = () => {
    rejectCall(callId)
    onCallEnd()
  }

  const handleEndCall = () => {
    endCall(callId)
    cleanup()
    onCallEnd()
  }

  const handleCallAnswered = async (data: { callId: string, answer: any }) => {
    if (data.callId === callId && peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(data.answer)
      setIsCallActive(true)
    }
  }

  const handleCallRejected = () => {
    cleanup()
    onCallEnd()
  }

  const handleCallEnded = () => {
    cleanup()
    onCallEnd()
  }

  const handleIceCandidate = async (data: { fromUserId: string, candidate: any }) => {
    if (data.fromUserId === otherParty.userId && peerConnectionRef.current) {
      await peerConnectionRef.current.addIceCandidate(data.candidate)
    }
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = isMuted
        setIsMuted(!isMuted)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current && callType === 'video') {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = isVideoOff
        setIsVideoOff(!isVideoOff)
      }
    }
  }

  const cleanup = () => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Initialize call for outgoing calls
  useEffect(() => {
    if (!isIncoming) {
      initializeMedia().then(() => {
        createPeerConnection()
      }).catch(console.error)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {otherParty.profilePhotoUrl ? (
              <img 
                src={otherParty.profilePhotoUrl} 
                alt={otherParty.fullName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-sm">
                {otherParty.fullName.split(' ').map(n => n[0]).join('')}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{otherParty.fullName}</h3>
            <p className="text-sm text-gray-300">
              {isCallActive ? formatDuration(callDuration) : 
               isIncoming ? 'Incoming call...' : 'Calling...'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300 capitalize">{callType} call</span>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-gray-900">
        {callType === 'video' && (
          <>
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </>
        )}

        {/* Audio-only or video-off display */}
        {(callType === 'audio' || isVideoOff) && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {otherParty.profilePhotoUrl ? (
                  <img 
                    src={otherParty.profilePhotoUrl} 
                    alt={otherParty.fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-4xl">
                    {otherParty.fullName.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-semibold mb-2">{otherParty.fullName}</h3>
              <p className="text-gray-300">
                {isCallActive ? formatDuration(callDuration) : 
                 isIncoming ? 'Incoming call...' : 'Calling...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-6">
        <div className="flex items-center justify-center space-x-6">
          {/* Incoming call controls */}
          {isIncoming && !isCallActive && (
            <>
              <Button
                onClick={handleRejectCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center"
              >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14z"/>
                  <path d="M16.707 2.293a1 1 0 010 1.414l-14 14a1 1 0 01-1.414-1.414l14-14a1 1 0 011.414 0z"/>
                </svg>
              </Button>
              <Button
                onClick={handleAnswerCall}
                className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center"
              >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
              </Button>
            </>
          )}

          {/* Active call controls */}
          {isCallActive && (
            <>
              <Button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  {isMuted ? (
                    <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.828 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.828l3.555-3.793a1 1 0 011.617.793zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"/>
                  ) : (
                    <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.828 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.828l3.555-3.793a1 1 0 011.617.793zM12 8a1 1 0 012 0v4a1 1 0 11-2 0V8zM14 7a1 1 0 012 0v6a1 1 0 11-2 0V7z"/>
                  )}
                </svg>
              </Button>

              {callType === 'video' && (
                <Button
                  onClick={toggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    {isVideoOff ? (
                      <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14z"/>
                    ) : (
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                    )}
                  </svg>
                </Button>
              )}

              <Button
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center"
              >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14z"/>
                  <path d="M16.707 2.293a1 1 0 010 1.414l-14 14a1 1 0 01-1.414-1.414l14-14a1 1 0 011.414 0z"/>
                </svg>
              </Button>
            </>
          )}

          {/* Outgoing call controls */}
          {!isIncoming && !isCallActive && (
            <Button
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14z"/>
                <path d="M16.707 2.293a1 1 0 010 1.414l-14 14a1 1 0 01-1.414-1.414l14-14a1 1 0 011.414 0z"/>
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoCall