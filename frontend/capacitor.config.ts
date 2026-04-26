import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mediseen.app',
  appName: 'Explainable-Med',
  webDir: 'out',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com', 'email']
    },
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;
