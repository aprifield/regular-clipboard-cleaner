'use strict';

import { app, protocol, BrowserWindow, ipcMain, Menu } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import path from 'path';
import {
  getHistoryItems,
  setHistoryItems
} from '@/background/electron-store-helper';
import '@/background/app-tray-helper';
import { registerShortcut } from '@/background/global-shortcut-helper';
import '@/background/clipboard-cleaner';
import { restart } from '@/background/clipboard-cleaner';
const isDevelopment = process.env.NODE_ENV !== 'production';
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

app.setName('Clipboard Cleaner');

let win: BrowserWindow | null;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
]);

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: (process.env
      //   .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    skipTaskbar: true,
    icon: path.join(__static, 'icon.png'),
    title: 'Clipboard Cleaner'
  });

  // win.setMenu(null);
  // win.setMenuBarVisibility(false);
  // win.removeMenu();
  Menu.setApplicationMenu(null);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }

  win.on('closed', () => {
    win = null;
  });

  win.on('blur', () => {
    if (isDevelopment) {
      if (win) {
        win.close();
      }
      win = null;
    }
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    // app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  registerShortcut();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

if (!isDevelopment) {
  app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath('exe')
  });
}

ipcMain
  .on('app-created', () => {
    if (win) {
      win.webContents.send('init-history', getHistoryItems());
    }
  })
  .on('app-clipboard-trash-clicked', (event, [text]) => {
    let historyItems = getHistoryItems();
    historyItems = historyItems.filter(item => item.text !== text);
    setHistoryItems(historyItems);
    restart();
    if (win) {
      win.webContents.send('init-history', historyItems);
    }
  })
  .on('clipboard-read', event => {
    if (win) {
      win.webContents.send('init-history', event);
    }
  })
  .on('app-tray-open-click', () => {
    if (win) {
      win.focus();
    } else {
      createWindow();
    }
  })
  .on('app-tray-exit-click', () => {
    app.quit();
  })
  .on('global-shortcut-focus', () => {
    if (win) {
      win.focus();
    } else {
      createWindow();
    }
  });
