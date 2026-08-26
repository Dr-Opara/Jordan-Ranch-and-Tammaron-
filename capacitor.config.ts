import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'community.jrt.app',
  appName: 'JRT.Community',
  webDir: 'out',
  server: {
    url: 'https://jrt.community',
    cleartext: false,
    allowNavigation: ['jrt.community', '*.jrt.community'],
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
