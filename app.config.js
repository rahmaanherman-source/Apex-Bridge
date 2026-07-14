const appName = 'Apex Bridge';
const slug = 'apex-bridge';
const scheme = 'apex-bridge';

module.exports = {
  expo: {
    name: appName,
    slug,
    scheme,
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#1a1f3a',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.apexbridge.app',
      infoPlist: {
        NSFaceIDUsageDescription: 'Used to secure your credential vault',
        NSCameraUsageDescription: 'Used for scanning QR codes during authentication',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#1a1f3a',
      },
      package: 'com.apexbridge.app',
      permissions: ['USE_BIOMETRIC', 'USE_FINGERPRINT'],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-secure-store',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#1a1f3a',
          image: './assets/splash.png',
          dark: {
            image: './assets/splash.png',
            backgroundColor: '#1a1f3a',
          },
          imageWidth: 200,
        },
      ],
    ],
    extra: {
      // Only public OAuth metadata belongs in Expo config.
      githubClientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID ?? '',
      githubRedirectUri:
        process.env.EXPO_PUBLIC_GITHUB_REDIRECT_URI ?? `${scheme}://oauth`,
    },
  },
};
