This is a [**React Native**](https://reactnative.dev) application for multi-party meetings.

### tech stack
react-native + webrtc + graphql + graphql-subscriptions


>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

> environment: node 20+, npm 8+

# 1. Server

First, you will need to start **Server**

To start Server, run the following command from the _root_ of your server project:

## install dependencies

```bash
# server root
cd server

# using yarn
yarn
```

## get started

```bash
# using yarn
yarn start
```

# 2. Client

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

### install dependencies

```bash
# using yarn
yarn
```

### get started
```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.


