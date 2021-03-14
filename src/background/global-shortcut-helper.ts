import { globalShortcut, ipcMain } from 'electron';

export function registerShortcut() {
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    ipcMain.emit('global-shortcut-focus');
  });
}
