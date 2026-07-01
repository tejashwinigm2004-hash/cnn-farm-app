import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Detect Expo Go — push notifications aren't supported there since SDK 53
const isExpoGo = Constants.executionEnvironment === 'storeClient';

let Notifications;
let Device;

if (!isExpoGo) {
  // Use require (not import) so this only executes when NOT in Expo Go.
  // A static `import` at the top of the file would run immediately regardless.
  Notifications = require('expo-notifications');
  Device = require('expo-device');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function registerForPushNotificationsAsync() {
  if (isExpoGo) {
    console.log('Push notifications need a development build (not supported in Expo Go on SDK 53+).');
    return null;
  }

  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#39d353',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token - permission not granted');
      return null;
    }

    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      const pushTokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      token = pushTokenData.data;
      console.log('Push token obtained:', token);
    } catch (e) {
      console.log('Error getting push token:', e);
      return null;
    }
  } else {
    console.log('Must use physical device for push notifications');
  }

  return token;
}