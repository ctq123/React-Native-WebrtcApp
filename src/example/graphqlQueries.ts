import { gql } from '@apollo/client';

export const CREATE_ROOM_MUTATION = gql`
  mutation CreateRoom($roomId: String!) {
    createRoom(roomId: $roomId)
  }
`;

export const JOIN_ROOM_MUTATION = gql`
  mutation JoinRoom($roomId: String!, $userId: String!) {
    joinRoom(roomId: $roomId, userId: $userId)
  }
`;

export const SEND_OFFER_MUTATION = gql`
  mutation SendOffer($roomId: String!, $userId: String!, $sdp: String!) {
    sendOffer(roomId: $roomId, userId: $userId, sdp: $sdp)
  }
`;

export const SEND_ANSWER_MUTATION = gql`
  mutation SendAnswer($roomId: String!, $userId: String!, $sdp: String!) {
    sendAnswer(roomId: $roomId, userId: $userId, sdp: $sdp)
  }
`;

export const SEND_ICE_CANDIDATE_MUTATION = gql`
  mutation SendIceCandidate($roomId: String!, $userId: String!, $candidate: String!) {
    sendIceCandidate(roomId: $roomId, userId: $userId, candidate: $candidate)
  }
`;

export const ROOM_UPDATED = gql`
subscription OnRoomUpdated($roomId: String!) {
  roomUpdated(roomId: $roomId) {
    type
    roomId
    userId
    sdp
    iceCandidates
  }
}
`;
