import { useEffect, useRef, useCallback } from 'react';
import { useSocketStore } from '../../../../../store/socketStore';
import { CallUser, RTCConfig } from '../types';

const RTC_CONFIG: RTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export const useWebRTC = (
  callId: string,
  otherParty: CallUser,
  localStream: MediaStream | null,
  onRemoteStream: (stream: MediaStream) => void,
  onCallActive: () => void
) => {
  const { socket, answerCall, rejectCall, endCall } = useSocketStore();
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const createPeerConnection = useCallback(() => {
    const peerConnection = new RTCPeerConnection(RTC_CONFIG);
    peerConnectionRef.current = peerConnection;

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      remoteStreamRef.current = remoteStream;
      onRemoteStream(remoteStream);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice_candidate', {
          targetUserId: otherParty.userId,
          callId,
          candidate: event.candidate
        });
      }
    };

    return peerConnection;
  }, [localStream, socket, callId, otherParty.userId, onRemoteStream]);

  const handleIceCandidate = useCallback(async (data: { fromUserId: string, candidate: RTCIceCandidateInit }) => {
    if (data.fromUserId === otherParty.userId && peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.addIceCandidate(data.candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  }, [otherParty.userId]);

  const cleanup = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => track.stop());
      remoteStreamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleCallAnswered = async (data: { callId: string, answer: RTCSessionDescriptionInit }) => {
      if (data.callId === callId && peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(data.answer);
          onCallActive();
        } catch (error) {
          console.error('Error setting remote description:', error);
        }
      }
    };

    socket.on('call_answered', handleCallAnswered);
    socket.on('ice_candidate', handleIceCandidate);

    return () => {
      socket.off('call_answered', handleCallAnswered);
      socket.off('ice_candidate', handleIceCandidate);
      cleanup();
    };
  }, [socket, callId, handleIceCandidate, cleanup, onCallActive]);

  const handleAnswerCall = async () => {
    try {
      const peerConnection = createPeerConnection();
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      if (socket) {
        answerCall(callId, answer);
        onCallActive();
      }
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  };

  const handleRejectCall = () => {
    if (socket) {
      rejectCall(callId);
    }
    cleanup();
  };

  const endCurrentCall = () => {
    if (socket) {
      endCall(callId);
    }
    cleanup();
  };

  return {
    peerConnection: peerConnectionRef.current,
    answerCall: handleAnswerCall,
    rejectCall: handleRejectCall,
    endCall: endCurrentCall,
    cleanup
  };
};

export default useWebRTC;
