import path from 'node:path';
import { app, ipcMain, Menu, Tray } from 'electron';
import { translate as __, loadDictionary } from '@/util/i18n';

// https://www.electronjs.org/docs/faq#my-apps-tray-disappeared-after-a-few-minutes
let tray: Tray | null = null;

app.whenReady().then(() => {
  loadDictionary(app.getLocale());

  const contextMenu = Menu.buildFromTemplate([
    {
      label: __('tray.clipboardHistory'),
      click: () => ipcMain.emit('native:click:tray-history'),
    },
    {
      label: __('tray.deleteAllHistory'),
      click: () => ipcMain.emit('native:click:tray-delete-all-history'),
    },
    {
      label: __('tray.settings'),
      click: () => ipcMain.emit('native:click:tray-settings'),
    },
    {
      label: __('tray.exit'),
      click: () => ipcMain.emit('native:click:tray-exit'),
    },
  ]);

  tray = new Tray(
    path.join(
      process.env.VITE_PUBLIC,
      process.platform === 'win32' ? 'icon.ico' : 'icon-16x16.png'
    )
  );
  tray.setContextMenu(contextMenu);
  tray.setToolTip(app.getName());
  tray.on('click', () => {
    if (tray) {
      tray.popUpContextMenu();
    }
  });
});
