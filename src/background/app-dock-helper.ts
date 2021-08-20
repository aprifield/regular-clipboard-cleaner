import { app } from 'electron';
import { getSettings } from '@/background/electron-store-helper';

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
