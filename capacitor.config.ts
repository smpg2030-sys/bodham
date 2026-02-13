import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bodham.app',
  appName: 'Bodham',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
