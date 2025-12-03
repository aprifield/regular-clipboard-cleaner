import type { BrowserWindow } from 'electron';
import { getSettings } from './electron-store-helper';

export function switchTaskbarIcon(win: BrowserWindow | null) {
  if (process.platform === 'darwin') {
    return;
  }
  if (!win) {
    return;
  }

  const settings = getSettings();
  win.setSkipTaskbar(!settings.showTaskbarIcon);
}
