
/** 视图类型 */
enum ViewType {
  /** 房间初始化 */
  INIT = 'INIT',
  /** 呼叫 */
  CALL = 'CALL',
  /** 加入 */
  JOIN = 'JOIN',
}

/** webrtc连接配置 */
const WebRTCConfig = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export default class Constants {

  // room
  static ViewType = ViewType; // 房间视图类型

  // config
  static WebRTCConfig = WebRTCConfig;// RTCPeerConnection配置

}
