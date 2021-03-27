import {
  app,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  shell
} from 'electron';

// https://www.electronjs.org/docs/api/menu

app.whenReady().then(() => {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              {
                label: 'Settings',
                click: () => {
                  ipcMain.emit('app-menu-settings-click');
                }
              },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideothers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          }
        ]
      : []),
    {
      role: 'fileMenu',
      submenu: isMac
        ? [{ role: 'close' }]
        : [
            {
              label: 'Settings',
              click: () => ipcMain.emit('app-menu-settings-click')
            },
            { type: 'separator' },
            { role: 'quit' }
          ]
    },
    {
      role: 'editMenu',
      submenu: [
        {
          label: 'Delete All History',
          click: () => ipcMain.emit('app-menu-delete-all-history-click')
        }
      ]
    },
    {
      role: 'viewMenu',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      role: 'windowMenu',
      submenu: [
        { role: 'minimize' },
        ...(isMac //
          ? [{ role: 'zoom' }]
          : [{ role: 'close' }])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal(
              'https://github.com/aprifield/clipboard-cleaner'
            );
          }
        }
      ]
    }
  ] as MenuItemConstructorOptions[];

  const menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu);
});
