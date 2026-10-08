const googleSignInPlugin = '@react-native-google-signin/google-signin';

module.exports = ({ config }) => {
  const androidPackage = process.env.ANDROID_PACKAGE?.trim() || config.android?.package || 'com.librareserve.app';
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
  const iosUrlScheme = iosClientId
    ? `com.googleusercontent.apps.${iosClientId.split('.')[0]}`
    : undefined;

  return {
    ...config,
    android: { ...config.android, ...(androidPackage ? { package: androidPackage } : {}) },
    // Android without Firebase uses native autolinking. The non-Firebase
    // Google plugin only adds the iOS URL scheme and requires an iOS client ID.
    plugins: [
      ...(config.plugins || []).filter(plugin => (Array.isArray(plugin) ? plugin[0] : plugin) !== googleSignInPlugin),
      ...(iosUrlScheme ? [[googleSignInPlugin, { iosUrlScheme }]] : []),
    ],
  };
};
