import React, { useState } from 'react';
import { Text, SafeAreaView } from 'react-native';
import Constants from './utils/Constants.ts';
import InitView from './components/InitView.tsx';
import CallView from './components/CallView.tsx';
import JoinView from './components/JoinView.tsx';

export default function RoomPage() {
  const [view, setView] = useState(Constants.ViewType.INIT);
  const [roomId, setRoomId] = useState('');

  let content;

  switch (view) {
    case Constants.ViewType.INIT:
      content = (
        <InitView
          roomId={roomId}
          setRoomId={setRoomId}
          setView={setView}
        />
      );
      break;

    case Constants.ViewType.CALL:
      content = (
        <CallView roomId={roomId} setView={setView} />
      );
      break;

    case Constants.ViewType.JOIN:
      content = (
        <JoinView roomId={roomId} setView={setView} />
      );
      break;

    default:
      content = <Text>Wrong View</Text>;
  }

  return (
    <SafeAreaView className="flex-1 justify-center ">{content}</SafeAreaView>
  );
}
