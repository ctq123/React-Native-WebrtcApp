// // index.web.js
// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './App';
// import 'tailwindcss';

// ReactDOM.render(
//   <App />,
//   document.getElementById('root') // 确保 index.html 中有 id 为 root 的元素
// );

import App from './App';
import { AppRegistry } from 'react-native';

// register the app
AppRegistry.registerComponent('App', () => App);

// web enterance
AppRegistry.runApplication('App', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
