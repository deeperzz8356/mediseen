import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mediseen.app',
  appName: 'Explainable-Med',
  webDir: 'out',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuthentication: false,
      providers: ['google.com', 'email']
    },
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;
