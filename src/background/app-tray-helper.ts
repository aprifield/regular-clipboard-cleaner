import { app, Menu, Tray, nativeImage, ipcMain } from 'electron';
import path from 'path';

// https://www.electronjs.org/docs/faq#my-apps-tray-disappeared-after-a-few-minutes
let tray = null;

app.whenReady().then(() => {
  tray = new Tray(nativeImage.createFromPath(path.join(__static, 'icon.png')));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
        ipcMain.emit('app-tray-open-click');
      }
    },
    {
      label: 'Exit',
      click: () => {
        ipcMain.emit('app-tray-exit-click');
      }
    }
  ]);
  tray.setContextMenu(contextMenu);

  tray.setToolTip(app.getName());

  tray.on('click', function() {
    ipcMain.emit('app-tray-icon-click');
  });
});
