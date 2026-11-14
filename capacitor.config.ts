import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.edu.tpe.contacerta',
  appName: 'ContaCerta',
  webDir: 'www/browser',
  server: { androidScheme: 'https' },
  android: { allowMixedContent: false },
};

export default config;
