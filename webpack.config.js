const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development', // 设置为 'development' 或 'production'
  entry: path.resolve(__dirname, './index.web.js'), // 入口文件
  output: {
    path: path.resolve(__dirname, 'dist'), // 输出的路径
    filename: 'bundle.js',  // 打包后文件
    publicPath: '/',
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
          options: {}
        },
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            // name: 'images/[name].[ext]'
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './web/index.html',
    }),
  ],
  devServer: {
    open: true,
    port: 3000,
  },
};
