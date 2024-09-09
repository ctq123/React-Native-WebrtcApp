import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, MediaStream } from 'react-native-webrtc';
import { useMutation } from '@apollo/client';
import { SEND_OFFER_MUTATION, SEND_ANSWER_MUTATION, SEND_ICE_CANDIDATE_MUTATION, CREATE_ROOM_MUTATION, JOIN_ROOM_MUTATION } from './graphqlQueries.ts';

interface UsePeerConnectionProps {
  roomId: string;
  userId: string;
  localStream: MediaStream | null;
  setLocalStream?: React.Dispatch<React.SetStateAction<MediaStream | null>>;
  setRemoteStreams: React.Dispatch<React.SetStateAction<Map<string, MediaStream>>>;
}

export const usePeerConnection = ({
  roomId,
  userId,
  localStream,
  // setLocalStream,
  setRemoteStreams,
}: UsePeerConnectionProps) => {
  const [peerConnections, setPeerConnections] = useState<Map<string, RTCPeerConnection>>(new Map());
  const [sendOffer] = useMutation(SEND_OFFER_MUTATION);
  const [sendAnswer] = useMutation(SEND_ANSWER_MUTATION);
  const [sendIceCandidate] = useMutation(SEND_ICE_CANDIDATE_MUTATION);
  const [createRoomMutation] = useMutation(CREATE_ROOM_MUTATION);
  const [joinRoomMutation] = useMutation(JOIN_ROOM_MUTATION);

  // useEffect(() => {
  //   // Initialize peer connections when room updates or local stream changes
  //   if (localStream) {
  //     const newPeerConnections = new Map<string, RTCPeerConnection>();

  //     // Create peer connection for each remote user
  //     // The implementation of user IDs and peer connection setup depends on your application logic

  //     setPeerConnections(newPeerConnections);
  //   }
  // }, [localStream]);

  // useEffect(() => {
  //   if (roomUpdates) {
  //     const { remoteSdp, iceCandidates } = roomUpdates.roomUpdates;
  //     if (remoteSdp && remoteSdp.sdp) {
  //       const sdp = JSON.parse(remoteSdp.sdp);
  //       peerConnections.forEach(pc => {
  //         pc.setRemoteDescription(new RTCSessionDescription(sdp));
  //         sendAnswer({ variables: { roomId, sdp: JSON.stringify(pc.localDescription) } });
  //       });
  //     }
  //     if (iceCandidates) {
  //       iceCandidates.forEach(({ candidate }: any) => {
  //         if (!candidate) {
  //           return;
  //         }
  //         const iceCandidate = JSON.parse(candidate);
  //         peerConnections.forEach(pc => {
  //           pc.addIceCandidate(new RTCIceCandidate(iceCandidate));
  //         });
  //       });
  //     }
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [roomUpdates, peerConnections, sendAnswer]);

  const createRoom = useCallback(async (callback: Function) => {
    const result = await createRoomMutation({ variables: { roomId } });
    if (result && callback) {
      callback();
    }
  }, [createRoomMutation, roomId]);

  const joinRoom = useCallback(async (callback: Function) => {
    const result = await joinRoomMutation({ variables: { roomId, userId } });
    if (result && callback) {
      callback();
    }
  }, [joinRoomMutation, roomId, userId]);

  const startCall = useCallback(async (callback: Function) => {
    if (!localStream) {
      // console.error('Local stream is not available');
      Alert.alert('Local stream is not available');
      return;
    }

    // Create a new peer connection
    const newPeerConnections = new Map<string, RTCPeerConnection>();

    peerConnections.forEach((pc: any, userId) => {
      pc.addStream(localStream);

      pc.onicecandidate = (event: any) => {
        if (event.candidate) {
          sendIceCandidate({ variables: { roomId, candidate: JSON.stringify(event.candidate) } });
        }
      };

      pc.ontrack = (event: any) => {
        setRemoteStreams(prev => new Map(prev).set(userId, event.streams[0]));
      };

      // Create and send an offer to each peer
      pc.createOffer({})
        .then(async (offerSdp: any) => {
          await pc.setLocalDescription(offerSdp);
          await sendOffer({ variables: { roomId, sdp: JSON.stringify(offerSdp) } });
        })
        .catch((error: any) => {
          console.error('Error creating offer', error);
        });

      newPeerConnections.set(userId, pc);
    });

    setPeerConnections(newPeerConnections);

    callback();
  }, [localStream, peerConnections, sendOffer, sendIceCandidate, roomId, setRemoteStreams]);


  // const endCall = useCallback(() => {
  //   // Logic for ending a call
  //   setIsCalling(false);
  // }, []);

  const endCall = useCallback(async (callback: Function)  => {
    // Close all peer connections
    peerConnections.forEach(pc => {
      pc.close();
    });

    // Clear peer connections and remote streams
    setPeerConnections(new Map());
    setRemoteStreams(new Map());

    callback();
  }, [peerConnections, setRemoteStreams]);


  const handleIncomingMessage = useCallback(async (message: any) => {
    const { userId, type, sdp, iceCandidates } = message;

    switch (type) {
      case 'offer':
        const configuration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }, // 示例 STUN 服务器
          ],
        };
        // Create a new peer connection for the incoming offer
        const offerPc: any = new RTCPeerConnection(configuration);
        offerPc.ontrack = (event: any) => {
          setRemoteStreams(prev => new Map(prev).set(userId, event.streams[0]));
        };
        offerPc.onicecandidate = (event: any) => {
          if (event.candidate) {
            sendIceCandidate({ variables: { roomId, candidate: JSON.stringify(event.candidate) } });
          }
        };

        // Set the remote description and create an answer
        await offerPc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answerSdp = await offerPc.createAnswer();
        await offerPc.setLocalDescription(answerSdp);

        // Send the answer back
        await sendAnswer({ variables: { roomId, sdp: JSON.stringify(answerSdp) } });

        // Add the peer connection to the map
        setPeerConnections(prev => new Map(prev).set(userId, offerPc));
        break;

      case 'answer':
        // Set the remote description on the existing peer connection
        const answerPc = peerConnections.get(userId);
        if (answerPc) {
          await answerPc.setRemoteDescription(new RTCSessionDescription(sdp));
        }
        break;

      case 'ice-candidate':
        // Add the ICE candidates to the existing peer connections
        iceCandidates.forEach(async (candidate: any) => {
          const iceCandidate = JSON.parse(candidate);
          const pc = peerConnections.get(userId);
          if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(iceCandidate));
          }
        });
        break;
    }
  }, [peerConnections, sendAnswer, sendIceCandidate, roomId, setRemoteStreams]);


  return {
    peerConnections,
    handleIncomingMessage,
    createRoom,
    joinRoom,
    startCall,
    endCall,
  };
};
