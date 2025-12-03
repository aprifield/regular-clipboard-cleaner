import type { MenuItemConstructorOptions } from 'electron';
import { app, ipcMain, Menu, shell } from 'electron';
import { translate as __, loadDictionary } from '@/util/i18n';

// https://www.electronjs.org/docs/api/menu

app.whenReady().then(() => {
  loadDictionary(app.getLocale());

  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about', label: __('menu.about', app.getName()) },
              { type: 'separator' },
              {
                label: __('menu.settings'),
                click: () => {
                  ipcMain.emit('native:click:menu-settings');
                },
              },
              { type: 'separator' },
              { role: 'services', label: __('menu.services') },
              { type: 'separator' },
              { role: 'hide', label: __('menu.hide', app.getName()) },
              { role: 'hideothers', label: __('menu.hideothers') },
              { role: 'unhide', label: __('menu.unhide') },
              { type: 'separator' },
              { role: 'quit', label: __('menu.quitForMac', app.getName()) },
            ],
          },
        ]
      : []),
    {
      role: 'fileMenu',
      label: __('menu.fileMenu'),
      submenu: isMac
        ? [{ role: 'close', label: __('menu.close') }]
        : [
            {
              label: __('menu.settings'),
              click: () => ipcMain.emit('native:click:menu-settings'),
            },
            { type: 'separator' },
            { role: 'quit', label: __('menu.quit') },
          ],
    },
    {
      role: 'editMenu',
      label: __('menu.editMenu'),
      submenu: [
        {
          label: __('menu.deleteAllHistory'),
          click: () => ipcMain.emit('native:click:menu-delete-all-history'),
        },
      ],
    },
    {
      role: 'viewMenu',
      label: __('menu.viewMenu'),
      submenu: [
        { role: 'reload', label: __('menu.reload') },
        { role: 'forceReload', label: __('menu.forceReload') },
        { type: 'separator' },
        { role: 'resetZoom', label: __('menu.resetZoom') },
        { role: 'zoomIn', label: __('menu.zoomIn') },
        { role: 'zoomOut', label: __('menu.zoomOut') },
        { type: 'separator' },
        { role: 'togglefullscreen', label: __('menu.togglefullscreen') },
      ],
    },
    {
      role: 'windowMenu',
      label: __('menu.windowMenu'),
      submenu: [
        { role: 'minimize', label: __('menu.minimize') },
        ...(isMac //
          ? [{ role: 'zoom', label: __('menu.zoom') }]
          : [{ role: 'close', label: __('menu.close') }]),
      ],
    },
    {
      role: 'help',
      label: __('menu.help'),
      submenu: [
        {
          label: __('menu.learnMore'),
          click: async () => {
            await shell.openExternal(
              'https://github.com/aprifield/regular-clipboard-cleaner'
            );
          },
        },
      ],
    },
  ] as MenuItemConstructorOptions[];

  const menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu);
});
