const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { withFilter, PubSub } = require('graphql-subscriptions');
const { WebSocketServer } = require('ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { useServer } = require('graphql-ws/lib/use/ws');
const http = require('http');

// In-memory room management (use a database in production)
const rooms = {};

// GraphQL schema
const typeDefs = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    createRoom(roomId: String!): Boolean
    joinRoom(roomId: String!, userId: String!): Boolean
    sendOffer(roomId: String!, userId: String!, sdp: String!): Boolean
    sendAnswer(roomId: String!, userId: String!, sdp: String!): Boolean
    sendIceCandidate(roomId: String!, userId: String!, candidate: String!): Boolean
  }

  type Subscription {
    roomUpdated(roomId: String!): RoomUpdate
  }

  type RoomUpdate {
    type: String!
    roomId: String
    userId: String
    sdp: String
    iceCandidates: [String]
  }
`;

// Resolver functions
const resolvers = {
  Mutation: {
    createRoom: (_, { roomId }) => {
      // Logic to create a room
      if (rooms[roomId]) return false; // Room already exists
      rooms[roomId] = [];
      return true;
    },
    joinRoom: (_, { roomId, userId }) => {
      // Logic to join a room
      if (!rooms[roomId]) return false; // Room does not exist
      if (rooms[roomId].includes(userId)) return false; // User already in room
      rooms[roomId].push(userId);
      return true;
    },
    sendOffer: (_, { roomId, userId, sdp }, { pubsub }) => {
      if (!rooms[roomId]) return false;
      pubsub.publish('ROOM_UPDATED', {
        roomUpdated: {
          type: 'offer',
          roomId,
          userId,
          sdp,
        },
        roomId,
      });
      return true;
    },
    sendAnswer: (_, { roomId, userId, sdp }, { pubsub }) => {
      if (!rooms[roomId]) return false;
      pubsub.publish('ROOM_UPDATED', {
        roomUpdated: {
          type: 'answer',
          roomId,
          userId,
          sdp,
        },
        roomId,
      });
      return true;
    },
    sendIceCandidate: (_, { roomId, userId, candidate }, { pubsub }) => {
      if (!rooms[roomId]) return false;
      pubsub.publish('ROOM_UPDATED', {
        roomUpdated: {
          type: 'ice-candidate',
          roomId,
          userId,
          iceCandidates: [candidate],
        },
        roomId,
      });
      return true;
    },
  },
  Subscription: {
    roomUpdated: {
      subscribe: withFilter(
        (_, { roomId }, { pubsub }) => {
          // Subscribe to the ROOM_UPDATED topic
          return pubsub.asyncIterator('ROOM_UPDATED');
        },
        (payload, variables) => {
          // Filter the events to ensure the correct roomId
          return payload.roomId === variables.roomId;
        }
      ),
    },
  },
};

const app = express();

// Initialize PubSub
const pubsub = new PubSub();

// Create GraphQL schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create an ApolloServer instance
const server = new ApolloServer({
  schema,
  graphqlPath: '/graphql',
  context: { pubsub },
});


server.start().then(() => {
  server.applyMiddleware({ app });

  // Create an HTTP server
  const httpServer = http.createServer(app);

  // Create a WebSocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: server.graphqlPath,
  });

  // Use graphql-ws to handle WebSocket connections
  useServer({ schema }, wsServer); // This is NOT a React hook, it should be used at the top level in server code

  // Start the HTTP server with WebSocket support
  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(`Server is now running on http://localhost:${PORT}/graphql`);
    console.log(`WebSocket is now running on ws://localhost:${PORT}/graphql`);
  });
});
