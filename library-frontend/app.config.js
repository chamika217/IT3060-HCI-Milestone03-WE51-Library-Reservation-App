const googleSignInPlugin = '@react-native-google-signin/google-signin';

module.exports = ({ config }) => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
  const iosUrlScheme = iosClientId
    ? `com.googleusercontent.apps.${iosClientId.split('.')[0]}`
    : undefined;

  return {
    ...config,
    plugins: (config.plugins || []).map(plugin => {
      const name = Array.isArray(plugin) ? plugin[0] : plugin;
      if (name !== googleSignInPlugin || !iosUrlScheme) return plugin;
      const options = Array.isArray(plugin) ? plugin[1] || {} : {};
      return [googleSignInPlugin, { ...options, iosUrlScheme }];
    }),
  };
};
