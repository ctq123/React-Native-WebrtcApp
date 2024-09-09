import React, { useState } from 'react';
import { View, Button, StyleSheet, TextInput } from 'react-native';
import { ApolloProvider, InMemoryCache, ApolloClient } from '@apollo/client';
import CallComponent from './CallComponent';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql', // 替换为你的 GraphQL 服务器地址
  cache: new InMemoryCache(),
});

const ExamplePage: React.FC = () => {
  const [roomId, setRoomId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [inCall, setInCall] = useState<boolean>(false);

  const handleInit = () => {
    if (!roomId || !roomId.trim()) {
      return;
    }
    if (!userId || !userId.trim()) {
      return;
    }
    setInCall(true);
  };
  
  return (
    <ApolloProvider client={client}>
      <View style={styles.container}>
      {!inCall ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Room ID"
            value={roomId}
            onChangeText={setRoomId}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter User ID"
            value={userId}
            onChangeText={setUserId}
          />
          <Button title="Start" onPress={handleInit} />
        </View>
      ) : (
        <CallComponent roomId={roomId} userId={userId} />
      )}
    </View>
    </ApolloProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  inputContainer: {
    width: '100%',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});

export default ExamplePage;
