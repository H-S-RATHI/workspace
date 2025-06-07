/**
 * Utility functions for managing RTCPeerConnection
 */
export const createPeerConnection = (): RTCPeerConnection => {
    console.log('[PeerConnectionUtils] Creating RTCPeerConnection');
    
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
    // Set up basic event listeners
    peerConnection.oniceconnectionstatechange = () => {
      console.log('[PeerConnectionUtils] ICE connection state:', peerConnection.iceConnectionState);
    };
    return peerConnection;
  };
  export const setupIceCandidateHandler = (
    peerConnection: RTCPeerConnection,
    get: any,
    useSocketStore: any
  ): void => {
    peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      console.log('[PeerConnectionUtils] ICE candidate:', event.candidate);
      
      if (event.candidate) {
        const { activeCall } = get();
        if (!activeCall) {
          console.warn('[PeerConnectionUtils] No active call when trying to send ICE candidate');
          return;
        }
        
        const { sendIceCandidate } = useSocketStore.getState();
        sendIceCandidate(
          activeCall.otherParty.userId,
          activeCall.callId,
          event.candidate
        );
      } else {
        console.log('[PeerConnectionUtils] All ICE candidates have been gathered');
      }
    };
  };
  export const createOffer = async (
    peerConnection: RTCPeerConnection,
    callType: 'video' | 'audio'
  ): Promise<RTCSessionDescriptionInit> => {
    console.log('[PeerConnectionUtils] Creating offer');
    
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: callType === 'video',
    });
    
    console.log('[PeerConnectionUtils] Setting local description');
    await peerConnection.setLocalDescription(offer);
    
    return offer;
  };
  export const createAnswer = async (
    peerConnection: RTCPeerConnection,
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> => {
    console.log('[PeerConnectionUtils] Setting remote description with offer');
    
    const sessionDescription = new RTCSessionDescription(offer);
    await peerConnection.setRemoteDescription(sessionDescription);
    
    console.log('[PeerConnectionUtils] Creating answer');
    const answer = await peerConnection.createAnswer();
    
    console.log('[PeerConnectionUtils] Setting local description with answer');
    await peerConnection.setLocalDescription(answer);
    
    return answer;
  };
  export const setRemoteAnswer = async (
    peerConnection: RTCPeerConnection,
    answer: RTCSessionDescriptionInit
  ): Promise<void> => {
    console.log('[PeerConnectionUtils] Setting remote description with answer');
    const sessionDescription = new RTCSessionDescription(answer);
    await peerConnection.setRemoteDescription(sessionDescription);
  };
  export const closePeerConnection = (peerConnection: RTCPeerConnection | null): void => {
    if (peerConnection) {
      console.log('[PeerConnectionUtils] Closing peer connection');
      peerConnection.close();
    }
  };