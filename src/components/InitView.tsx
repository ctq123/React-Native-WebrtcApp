// import React, { useEffect } from 'react';
// import { Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
// import Constants from '../utils/Constants';
// import { generateRoomId } from '../utils/Util';

// // 定义函数类型
// interface IProps {
//   setView: (v: any) => void;
//   setRoomId: (v: any) => void;
//   roomId: string;
// }

// const InitView: React.FC<IProps> = ({ setView, setRoomId, roomId }) => {
//   const onCallOrJoin = (view: string) => {
//     if (roomId.length > 0) {
//       setView(view);
//     }
//   };

//   //generate random room id
//   useEffect(() => {
//     setRoomId(generateRoomId());
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   //checks if room is existing
//   const checkMeeting = async () => {
//     if (!roomId) {
//       return Alert.alert('请提供房间号.');
//     }

//     const roomRef = doc(db, 'room', roomId);
//     const roomSnapshot = await getDoc(roomRef);

//     // console.log(roomSnapshot.data());

//     if (!roomSnapshot.exists()) {
//       return Alert.alert('Wait for your instructor to start the meeting.');
//     } else {
//       onCallOrJoin(Constants.ViewType.JOIN);
//     }
//   };

//   const roomIdText = roomId ? roomId.replace(/(.{3})(?=.)/g, '$1 ') : roomId;

//   return (
//     <View>
//       <Text className="text-2xl font-bold text-center">Enter Room ID:</Text>
//       <TextInput
//         className="bg-white border-sky-600 border-2 mx-5 my-3 p-2 rounded-md"
//         value={roomIdText}
//         onChangeText={(v) => setRoomId(v.replace(/\s+/g, ''))}
//       />
//       <View className="gap-y-3 mx-5 mt-2">
//         <TouchableOpacity
//           className="bg-sky-300 p-2  rounded-md"
//           onPress={() => onCallOrJoin(Constants.ViewType.CALL)}
//         >
//           <Text className="color-black text-center text-xl font-bold ">
//             Start meeting
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           className="bg-sky-300 p-2 rounded-md"
//           onPress={() => checkMeeting()}
//         >
//           <Text className="color-black text-center text-xl font-bold ">
//             Join meeting
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default InitView;
