import { app } from 'electron';
import { getSettings } from '@/background/electron-store-helper';
const isDevelopment = process.env.NODE_ENV !== 'production';

export function setOpenAtLogin() {
  if (isDevelopment) {
    return;
  }

  const settings = getSettings();

  app.setLoginItemSettings({
    openAtLogin: settings.startAtLogin
  });
}

setOpenAtLogin();
