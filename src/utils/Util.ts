/**
 * 生成房间号
 * @param len 房间号长度
 * @returns
 */
export const generateRoomId = (len: number = 6) => {
  return Math.random().toString().slice(-len);
};
