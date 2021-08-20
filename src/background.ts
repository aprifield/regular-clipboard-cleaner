'use strict';

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  nativeTheme,
  clipboard,
  dialog
} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { exec, ExecException } from 'child_process';
import path from 'path';
import {
  getHistoryItems,
  getSettings,
  getWindowSettings,
  setSettings,
  setWindowSettings
} from '@/background/electron-store-helper';
import '@/background/app-tray-helper';
import '@/background/app-menu-helper';
import { setOpenAtLogin } from '@/background/app-login-helper';
import { registerShortcut } from '@/background/global-shortcut-helper';
import '@/background/clipboard-cleaner';
import {
  deleteAllHistory,
  deleteHistory,
  restartMonitoring
} from '@/background/clipboard-cleaner';
import { Settings } from '@/types/settings';
const isDevelopment = process.env.NODE_ENV !== 'production';
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    showOrCreateWindow('history');
  });
}

let historyWin: BrowserWindow | null;
let settingsWin: BrowserWindow | null;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
]);

async function createWindow(mode: 'history' | 'settings') {
  // Create the browser window.
  const win = new BrowserWindow({
    icon: path.join(__static, 'icon.png'),
    show: false,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: (process.env
      //   .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  if (mode === 'settings') {
    settingsWin = win;
  } else {
    historyWin = win;
  }

  const params = `mode=${mode}&platform=${process.platform}&shouldUseDarkColors=${nativeTheme.shouldUseDarkColors}`;
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

  const _setWindowSettings = () => {
    setWindowSettings(mode, {
      ...(win.isMaximized()
        ? {
            maximized: win.isMaximized()
          }
        : {
            position: win.getPosition(),
            size: win.getSize(),
            maximized: win.isMaximized()
          })
    });
  };

  win.on('closed', () => {
    if (mode === 'settings') {
      settingsWin = null;
    } else {
      historyWin = null;
    }
  });

  win.on('moved', () => {
    _setWindowSettings();
  });

  win.on('resized', () => {
    _setWindowSettings();
  });

  win.on('maximize', () => {
    _setWindowSettings();
  });

  win.on('unmaximize', () => {
    _setWindowSettings();
  });
}

async function showOrCreateWindow(mode: 'history' | 'settings') {
  const win = mode === 'settings' ? settingsWin : historyWin;
  if (win) {
    const windowSettings = getWindowSettings(mode);
    if (windowSettings && windowSettings.maximized) {
      win.maximize();
    }
    win.show();
    if (windowSettings && windowSettings.size && windowSettings.position) {
      win.setBounds({
        width: windowSettings.size[0] || 800,
        height: windowSettings.size[1] || 600,
        x: windowSettings.position[0] || 0,
        y: windowSettings.position[1] || 0
      });
    }
    win.setOpacity(1);
  } else {
    createWindow(mode);
  }
}

async function hideWindow(mode: 'history' | 'settings') {
  const win = mode === 'settings' ? settingsWin : historyWin;
  if (win) {
    win.setOpacity(0);
    win.minimize();
    win.hide();
  }
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

const copyTextAndExecCommand = (text: string) => {
  clipboard.writeText(text);
  const settings = getSettings();
  if (settings.command) {
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      exec(settings.command!, (error: ExecException | null) => {
        if (error) {
          dialog.showErrorBox(
            'Command Error',
            `The command [${settings.command}] failed.`
          );
        }
      });
    }, settings.commandTimeout || 200);
  }
};

ipcMain
  .on('web-app-created', () => {
    sendToWebContents();
  })
  .on(
    'web-app-mounted',
    (event, [{ mode }]: [{ mode: 'history' | 'settings' }]) => {
      showOrCreateWindow(mode);
    }
  )
  .on('web-copy-click', (event, [text]: [string]) => {
    copyTextAndExecCommand(text);
    if (getSettings().closeAfterCopy) {
      if (historyWin) {
        hideWindow('history');
      }
    }
  })
  .on('web-enter-keydown', (event, [text]: [string]) => {
    copyTextAndExecCommand(text);
    if (getSettings().closeAfterCopy) {
      if (historyWin) {
        hideWindow('history');
      }
    }
  })
  .on('web-escape-keydown', () => {
    if (historyWin) {
      hideWindow('history');
    }
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
    showOrCreateWindow('settings');
  })
  .on('app-menu-delete-all-history-click', () => {
    deleteAllHistory();
    sendToWebContents();
  })
  .on('app-tray-history-click', () => {
    showOrCreateWindow('history');
  })
  .on('app-tray-settings-click', () => {
    showOrCreateWindow('settings');
  })
  .on('app-tray-exit-click', () => {
    app.quit();
  })
  .on('global-shortcut-focus', () => {
    showOrCreateWindow('history');
  })
  .on('clipboard-history-change', () => {
    sendToWebContents();
  });
