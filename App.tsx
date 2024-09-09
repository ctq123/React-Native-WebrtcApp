/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
} from 'react-native';

// import RoomPage from './src/RoomPage';
import ExamplePage from './src/example/ExamplePage';

function App(): React.JSX.Element {

  return (
    <SafeAreaView>
      {/* <RoomPage /> */}
      <ExamplePage />
    </SafeAreaView>
  );
}

export default App;
