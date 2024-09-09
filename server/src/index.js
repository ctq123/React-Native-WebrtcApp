const { ApolloServer, gql, PubSub } = require('apollo-server');
const { withFilter } = require('graphql-subscriptions');
const { WebSocketServer } = require('ws');
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

// Initialize PubSub
const pubsub = new PubSub();

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  graphqlPath: '/graphql',
  context: { pubsub },
});

// Create HTTP server
const httpServer = http.createServer(server);

// Create WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: server.graphqlPath,
});

// Set up WebSocket server to handle subscriptions
server.installSubscriptionHandlers(wsServer);

// Start server
httpServer.listen(4000, () => {
  console.log(`Server is running on http://localhost:4000${server.graphqlPath}`);
});
