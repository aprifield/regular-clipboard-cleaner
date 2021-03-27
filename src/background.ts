'use strict';

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  nativeTheme,
  clipboard
} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import path from 'path';
import {
  getHistoryItems,
  getSettings,
  setSettings
} from '@/background/electron-store-helper';
import '@/background/app-tray-helper';
import '@/background/app-menu-helper';
import { registerShortcut } from '@/background/global-shortcut-helper';
import '@/background/clipboard-cleaner';
import {
  deleteAllHistory,
  deleteHistory,
  restartMonitoring
} from '@/background/clipboard-cleaner';
import { Settings } from '@/types/settings';
import { setOpenAtLogin } from './background/app-login-helper';
const isDevelopment = process.env.NODE_ENV !== 'production';
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

app.setName('Regular Clipboard Cleaner');

let historyWin: BrowserWindow | null;
let settingsWin: BrowserWindow | null;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
]);

async function createWindow(mode: 'history' | 'settings') {
  const settings = {
    position: [undefined, undefined],
    size: [800, 600],
    ...(mode === 'settings'
      ? getSettings().settingsWin || {}
      : getSettings().historyWin || {})
  };

  // Create the browser window.
  const win = new BrowserWindow({
    width: settings.size[0],
    height: settings.size[1],
    x: settings.position[0],
    y: settings.position[1],
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: (process.env
      //   .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__static, 'icon.png')
  });
  if (settings.maximized) {
    win.maximize();
  }
  if (mode === 'settings') {
    settingsWin = win;
  } else {
    historyWin = win;
  }

  const params = `mode=${mode}&shouldUseDarkColors=${nativeTheme.shouldUseDarkColors}`;
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(
      `${process.env.WEBPACK_DEV_SERVER_URL as string}?${params}`
    );
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL(`app://./index.html?${params}`);
  }

  win.on('close', () => {
    const settings = {
      ...getSettings(),
      [mode === 'settings' ? 'settingsWin' : 'historyWin']: {
        position: win.isMaximized() ? undefined : win.getPosition(),
        size: win.isMaximized() ? undefined : win.getSize(),
        maximized: win.isMaximized()
      }
    };
    setSettings(settings);
  });

  win.on('closed', () => {
    if (mode === 'settings') {
      settingsWin = null;
    } else {
      historyWin = null;
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
  if (BrowserWindow.getAllWindows().length === 0) createWindow('history');
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

const sendToWebContents = () => {
  const historyItems = getHistoryItems();
  const settings = getSettings();
  if (historyWin) {
    historyWin.webContents.send('init-history', historyItems);
    historyWin.webContents.send('init-settings', settings);
  }
  if (settingsWin) {
    settingsWin.webContents.send('init-history', historyItems);
    settingsWin.webContents.send('init-settings', settings);
  }
};

ipcMain
  .on('web-app-created', () => {
    sendToWebContents();
  })
  .on('web-copy-click', (event, [text]: [string]) => {
    clipboard.writeText(text);
  })
  .on('web-delete-click', (event, [text]: [string]) => {
    deleteHistory(text);
    sendToWebContents();
  })
  .on('web-settings-change', (event, [settings]: [Settings]) => {
    setSettings(settings);
    restartMonitoring();
    registerShortcut();
    setOpenAtLogin();
    sendToWebContents();
  })
  .on('app-menu-settings-click', () => {
    if (settingsWin) {
      settingsWin.focus();
    } else {
      createWindow('settings');
    }
  })
  .on('app-menu-delete-all-history-click', () => {
    deleteAllHistory();
    sendToWebContents();
  })
  .on('app-tray-icon-click', () => {
    if (historyWin) {
      historyWin.focus();
    } else {
      createWindow('history');
    }
  })
  .on('app-tray-history-click', () => {
    if (historyWin) {
      historyWin.focus();
    } else {
      createWindow('history');
    }
  })
  .on('app-tray-settings-click', () => {
    if (settingsWin) {
      settingsWin.focus();
    } else {
      createWindow('settings');
    }
  })
  .on('app-tray-exit-click', () => {
    app.quit();
  })
  .on('global-shortcut-focus', () => {
    if (historyWin) {
      historyWin.focus();
    } else {
      createWindow('history');
    }
  })
  .on('clipboard-history-change', () => {
    sendToWebContents();
  });
