import { app, Menu, Tray, nativeImage, ipcMain } from 'electron';
import path from 'path';
import { loadDictionary, translate as __ } from '@/util/i18n';

// https://www.electronjs.org/docs/faq#my-apps-tray-disappeared-after-a-few-minutes
let tray: Tray | null = null;

app.whenReady().then(() => {
  loadDictionary(app.getLocale());

  const contextMenu = Menu.buildFromTemplate([
    {
      label: __('tray.clipboardHistory'),
      click: () => ipcMain.emit('app-tray-history-click')
    },
    {
      label: __('tray.deleteAllHistory'),
      click: () => ipcMain.emit('app-tray-delete-all-history-click')
    },
    {
      label: __('tray.settings'),
      click: () => ipcMain.emit('app-tray-settings-click')
    },
    {
      label: __('tray.exit'),
      click: () => ipcMain.emit('app-tray-exit-click')
    }
  ]);

  tray = new Tray(
    path.join(
      __static,
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
