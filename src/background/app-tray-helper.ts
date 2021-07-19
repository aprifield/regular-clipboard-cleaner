import { app, Menu, Tray, nativeImage, ipcMain } from 'electron';
import path from 'path';

// https://www.electronjs.org/docs/faq#my-apps-tray-disappeared-after-a-few-minutes
let tray = null;

app.whenReady().then(() => {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'History',
      click: () => {
        ipcMain.emit('app-tray-history-click');
      }
    },
    {
      label: 'Settings',
      click: () => {
        ipcMain.emit('app-tray-settings-click');
      }
    },
    {
      label: 'Exit',
      click: () => {
        ipcMain.emit('app-tray-exit-click');
      }
    }
  ]);

  tray = new Tray(
    nativeImage.createFromPath(path.join(__static, 'icon-16x16.png'))
  );
  tray.setContextMenu(contextMenu);
  tray.setToolTip(app.getName());
  tray.on('click', function() {
    ipcMain.emit('app-tray-icon-click');
  });
});
