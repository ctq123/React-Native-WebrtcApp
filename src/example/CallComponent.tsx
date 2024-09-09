import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import { mediaDevices, RTCView, MediaStream } from 'react-native-webrtc';
import { useSubscription } from '@apollo/client';
import { usePeerConnection } from './usePeerConnection.ts';
import { ROOM_UPDATED } from './graphqlQueries.ts';

interface CallComponentProps {
  roomId: string;
  userId: string;
}


const CallComponent: React.FC<CallComponentProps> = ({ roomId, userId }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isCalling, setIsCalling] = useState<boolean>(false);

  // In CallComponent or similar
  const { data, error } = useSubscription(ROOM_UPDATED, {
    variables: { roomId },
  });

  const {
    // peerConnections,
    handleIncomingMessage,
    createRoom,
    joinRoom,
    startCall,
    endCall,
  } = usePeerConnection({
    roomId,
    userId,
    localStream,
    setLocalStream,
    setRemoteStreams,
  });

  useEffect(() => {
    // Initialize local media stream and handle incoming messages
    mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
      })
      .catch((e) => {
        console.error('Error accessing media devices:', e);
      });

    // Handle new remote streams
    return () => {
      // Clean up media stream on component unmount
      localStream?.getTracks().forEach((track: any) => track.stop());
    };
  }, [localStream]);

  useEffect(() => {
    if (data) {
      handleIncomingMessage(data.roomUpdated);
    }
    if (error) {
      console.error(error);
      Alert.alert('Something went wrong.');
    }
  }, [data, error, handleIncomingMessage]);

  return (
    <View style={styles.container}>
      <View style={styles.localVideoContainer}>
        {localStream && <RTCView style={styles.localVideo} streamURL={localStream.toURL()} />}
      </View>
      <View style={styles.remoteVideosContainer}>
        {Array.from(remoteStreams.values()).map((stream, index) => (
          <RTCView key={index} style={styles.remoteVideo} streamURL={stream.toURL()} />
        ))}
      </View>
      <View style={styles.buttonContainer}>
        {!isCalling ? (
          <>
            <Button title="Create Room" onPress={() => createRoom(() => setIsCalling(true))} />
            <Button title="Join Room" onPress={() => joinRoom(() => setIsCalling(true))} />
          </>
        ) : (
          <>
            <Button title="Start Call" onPress={() => startCall(() => {})} />
            <Button title="End Call" onPress={() => endCall(() => setIsCalling(false))} />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideo: {
    width: 100,
    height: 150,
  },
  remoteVideosContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  remoteVideo: {
    width: 100,
    height: 150,
    margin: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 20,
  },
});


export default CallComponent;
