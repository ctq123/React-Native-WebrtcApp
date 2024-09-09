import React, { useState, useEffect } from 'react';
import { View } from 'react-native';

import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
} from 'react-native-webrtc';
import CallAction from './CallAction';

import Constants from '../utils/Constants';

interface IProps {
  setView: (v: any) => void;
  roomId: string;
}

interface MediaDeviceInfo {
  deviceId: string;
  kind: 'audioinput' | 'audiooutput' | 'videoinput';
  label: string;
  groupId: string;
  facing: string;
}

const JoinView: React.FC<IProps> = ({ roomId, setView }) => {

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [cachedLocalPC, setCachedLocalPC] = useState<any>(null);

  const [isOffCam, setIsOffCam] = useState(false);

  //Automatically start stream
  useEffect(() => {
    startLocalStream();
  }, []);

  useEffect(() => {
    if (localStream) {
      joinCall(roomId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream]);

  //End call button
  const endCall = async () => {
    if (cachedLocalPC) {
      const senders = cachedLocalPC.getSenders();
      senders.forEach((sender: any) => {
        cachedLocalPC.removeTrack(sender);
      });
      cachedLocalPC.close();
    }

    const roomRef = doc(db, 'room', roomId);
    await updateDoc(roomRef, { answer: deleteField(), connected: false });

    setLocalStream(null);
    setRemoteStream(null); // set remoteStream to null or empty when callee leaves the call
    setCachedLocalPC(null);
    // cleanup
    setView(Constants.ViewType.INIT); //go back to room screen
  };

  //start local webcam on your device
  const startLocalStream = async () => {
    // isFront will determine if the initial camera should face user or environment
    const isFront = true;
    const devices = await mediaDevices.enumerateDevices() as MediaDeviceInfo[];

    const facing = isFront ? 'front' : 'environment';
    const videoSourceId = devices.find(
      (device) => device.kind === 'videoinput' && device.facing === facing
    );
    const facingMode = isFront ? 'user' : 'environment';
    const constraints = {
      audio: true,
      video: {
        mandatory: {
          minWidth: 500, // Provide your own width, height and frame rate here
          minHeight: 300,
          minFrameRate: 30,
        },
        facingMode,
        optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
      },
    };
    const newStream = await mediaDevices.getUserMedia(constraints);
    setLocalStream(newStream);
  };

  //join call function
  const joinCall = async (id: any) => {
    if (!localStream) {
      return;
    }
    const roomRef = doc(db, 'room', id);
    const roomSnapshot = await getDoc(roomRef);

    if (!roomSnapshot.exists) {
      return;
    }
    const localPC: any = new RTCPeerConnection(Constants.WebRTCConfig);
    localStream.getTracks().forEach((track) => {
      localPC.addTrack(track, localStream);
    });

    const callerCandidatesCollection = collection(roomRef, 'callerCandidates');
    const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');

    localPC.addEventListener('icecandidate', (e) => {
      if (!e.candidate) {
        console.log('Got final candidate!');
        return;
      }
      addDoc(calleeCandidatesCollection, e.candidate.toJSON());
    });

    localPC.ontrack = (e: any) => {
      const newStream = new MediaStream(null);
      e.streams[0].getTracks().forEach((track: any) => {
        newStream.addTrack(track);
      });
      setRemoteStream(newStream);
    };

    const offer = roomSnapshot.data().offer;
    await localPC.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await localPC.createAnswer();
    await localPC.setLocalDescription(answer);

    await updateDoc(roomRef, { answer, connected: true }, { merge: true });

    onSnapshot(callerCandidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          let data = change.doc.data();
          localPC.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });

    onSnapshot(roomRef, (doc) => {
      const data = doc.data();
      if (!data.answer) {
        setView(Constants.ViewType.INIT);
      }
    });

    setCachedLocalPC(localPC);
  };

  const switchCamera = () => {
    if (!localStream) {
      return;
    }
    localStream.getVideoTracks().forEach((track) => track._switchCamera());
  };

  // Mutes the local's outgoing audio
  const toggleMute = () => {
    if (!localStream || !remoteStream) {
      return;
    }
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
  };

  const toggleCamera = () => {
    if (!localStream) {
      return;
    }
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsOffCam(!isOffCam);
    });
  };

  return (
    <View className="flex-1">
      <RTCView
        className="flex-1"
        streamURL={remoteStream && remoteStream.toURL()}
        objectFit={'cover'}
      />

      {remoteStream && !isOffCam && (
        <RTCView
          className="w-32 h-48 absolute right-6 top-8"
          streamURL={localStream && localStream.toURL()}
        />
      )}
      <View className="absolute bottom-0 w-full">
        <CallAction
          switchCamera={switchCamera}
          toggleMute={toggleMute}
          toggleCamera={toggleCamera}
          endCall={endCall}
        />
      </View>
    </View>
  );
};

export default JoinView;
