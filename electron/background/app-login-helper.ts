import { app } from 'electron';
import { getSettings } from './electron-store-helper';

const isDevelopment = process.env.NODE_ENV === 'development';

export function setOpenAtLogin() {
  if (isDevelopment) {
    return;
  }

  const settings = getSettings();

  app.setLoginItemSettings({
    openAtLogin: settings.startAtLogin,
  });
}

setOpenAtLogin();
