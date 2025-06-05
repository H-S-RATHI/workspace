import { useState, useRef, useEffect } from 'react';
import { CallType } from '../types';

export const useMediaStreams = (callType: CallType) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [isMuted, setIsMuted] = useState(false);

  const initializeMedia = async () => {
    try {
      const constraints = {
        video: callType === 'video' && !isVideoOff,
        audio: true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream && callType === 'video') {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOff;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  const stopAllMediaTracks = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    return () => {
      stopAllMediaTracks();
    };
  }, []);

  return {
    localVideoRef,
    localStream,
    isVideoOff,
    isMuted,
    initializeMedia,
    toggleMute,
    toggleVideo,
    stopAllMediaTracks,
  };
};

export default useMediaStreams;
