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
  if (settings.hideDockIcon) {
    app.dock.hide();
  } else {
    app.dock.show();
  }
}

switchDockIcon();
