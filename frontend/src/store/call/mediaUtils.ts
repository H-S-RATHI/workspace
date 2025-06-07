/**
 * Utility functions for handling media streams and user media permissions
 */
export const requestUserMedia = async (callType: 'video' | 'audio'): Promise<MediaStream> => {
    const constraints = {
      video: callType === 'video',
      audio: true,
    };
    
    console.log('[MediaUtils] Requesting media with constraints:', constraints);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('[MediaUtils] Successfully acquired media stream');
      return stream;
    } catch (mediaError) {
      console.error('[MediaUtils] Error getting user media:', mediaError);
      throw new Error('Could not access camera/microphone. Please check your permissions.');
    }
  };
  export const stopMediaStream = (stream: MediaStream | null): void => {
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      console.log('[MediaUtils] Media stream stopped');
    }
  };
  export const addTracksToConnection = (
    peerConnection: RTCPeerConnection,
    stream: MediaStream
  ): void => {
    stream.getTracks().forEach((track) => {
      console.log(`[MediaUtils] Adding track to peer connection: ${track.kind} (${track.id})`);
      peerConnection.addTrack(track, stream);
    });
  };
  export const logTransceivers = (peerConnection: RTCPeerConnection): void => {
    peerConnection.getTransceivers().forEach((transceiver, index) => {
      console.log(`[MediaUtils] Transceiver ${index}:`, {
        mid: transceiver.mid,
        direction: transceiver.direction,
        currentDirection: transceiver.currentDirection,
        receiverTrack: transceiver.receiver.track?.kind,
        senderTrack: transceiver.sender.track?.kind,
      });
    });
  };