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

// 定义 MediaDeviceInfo 类型
interface MediaDeviceInfo {
  deviceId: string;
  kind: 'audioinput' | 'audiooutput' | 'videoinput';
  label: string;
  groupId: string;
  facing: string;
}

const CallView: React.FC<IProps> = ({ roomId, setView }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [cachedLocalPC, setCachedLocalPC] = useState<any>(null);

  const [isOffCam, setIsOffCam] = useState(false);

  useEffect(() => {
    startLocalStream();
  }, []);

  useEffect(() => {
    if (localStream && roomId) {
      startCall(roomId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream, roomId]);

  //End call button
  async function endCall() {
    if (cachedLocalPC) {
      const senders = cachedLocalPC.getSenders();
      senders.forEach((sender: any) => {
        cachedLocalPC.removeTrack(sender);
      });
      cachedLocalPC.close();
    }

    const roomRef = doc(db, 'room', roomId);
    await updateDoc(roomRef, { answer: deleteField() });

    setLocalStream(null);
    setRemoteStream(null); // set remoteStream to null or empty when callee leaves the call
    setCachedLocalPC(null);
    // cleanup
    setView(Constants.ViewType.INIT); //go back to room screen
  }

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

  const startCall = async (id: any) => {
    if (!localStream) {
      return;
    }
    const localPC: any = new RTCPeerConnection(Constants.WebRTCConfig);
    localStream.getTracks().forEach((track) => {
      localPC.addTrack(track, localStream);
    });

    const roomRef = doc(db, 'room', id);
    const callerCandidatesCollection = collection(roomRef, 'callerCandidates');
    const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');

    localPC.addEventListener('icecandidate', (e: any) => {
      if (!e.candidate) {
        console.log('Got final candidate!');
        return;
      }
      addDoc(callerCandidatesCollection, e.candidate.toJSON());
    });

    localPC.ontrack = (event: any) => {
      const newStream = new MediaStream(null);
      event.streams[0].getTracks().forEach((track: any) => {
        newStream.addTrack(track);
      });
      setRemoteStream(newStream);
    };

    const offer: any = await localPC.createOffer({});
    await localPC.setLocalDescription(offer);

    await setDoc(roomRef, { offer, connected: false }, { merge: true });

    // Listen for remote answer
    onSnapshot(roomRef, (doc) => {
      const data = doc.data();
      if (!localPC.currentRemoteDescription && data.answer) {
        const rtcSessionDescription = new RTCSessionDescription(data.answer);
        localPC.setRemoteDescription(rtcSessionDescription);
      } else {
        setRemoteStream(null);
      }
    });

    // when answered, add candidate to peer connection
    onSnapshot(calleeCandidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          let data = change.doc.data();
          localPC.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });

    setCachedLocalPC(localPC);
  };

  const switchCamera = () => {
    if (!localStream) {
      return;
    }
    localStream.getVideoTracks().forEach((track: any) => track._switchCamera());
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
    <View className="flex-1 bg-red-600">
      {!remoteStream && (
        <RTCView
          className="flex-1"
          streamURL={localStream && localStream.toURL()}
          objectFit={'cover'}
        />
      )}

      {remoteStream && (
        <>
          <RTCView
            className="flex-1"
            streamURL={remoteStream && remoteStream.toURL()}
            objectFit={'cover'}
          />
          {!isOffCam && (
            <RTCView
              className="w-32 h-48 absolute right-6 top-8"
              streamURL={localStream && localStream.toURL()}
            />
          )}
        </>
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

export default CallView;
