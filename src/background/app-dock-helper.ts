import { app } from 'electron';
import { getSettings } from '@/background/electron-store-helper';

export function showDockIcon() {
  if (process.platform !== 'darwin') {
    return;
  }

  app.dock.show();
}

export function switchDockIcon() {
  if (process.platform !== 'darwin') {
    return;
  }

  const settings = getSettings();
  if (settings.showDockIcon) {
    app.dock.show();
  } else {
    app.dock.hide();
  }
}

switchDockIcon();
