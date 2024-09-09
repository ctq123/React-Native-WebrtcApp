/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  Platform,
  Text,
} from 'react-native';

// import RoomPage from './src/RoomPage';
import ExamplePage from './src/example/ExamplePage';

export default function App() {

  return (
    <SafeAreaView>
      <Text>{Platform.OS === 'web' ? 'This is Web.' : 'This is Mobile.'}</Text>
      {/* <RoomPage /> */}
      <ExamplePage />
    </SafeAreaView>
  );
}
