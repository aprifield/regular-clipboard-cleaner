'use strict';

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  nativeTheme,
  clipboard,
  dialog,
  screen
} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { exec, ExecException } from 'child_process';
import path from 'path';
import robot from 'robotjs';
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
import { switchTaskbarIcon } from '@/background/app-taskbar-helper';
import { showDockIcon, switchDockIcon } from '@/background/app-dock-helper';
import { registerShortcut } from '@/background/global-shortcut-helper';
import '@/background/clipboard-cleaner';
import {
  deleteAllHistory,
  deleteHistory,
  restartMonitoring
} from '@/background/clipboard-cleaner';
import rules from '@/util/rules';
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
  const settings = getSettings();
  // Create the browser window.
  const win = new BrowserWindow({
    icon: path.join(__static, 'icon.png'),
    frame: mode === 'settings' || settings.showFrame,
    maximizable: false,
    show: false,
    skipTaskbar: mode === 'history' && !settings.showTaskbarIcon,
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
    showDockIcon();
  } else {
    historyWin = win;
  }

  const params = [
    `mode=${mode}`,
    `locale=${app.getLocale()}`,
    `platform=${process.platform}`
  ].join('&');
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
    setWindowSettings(mode, win.getBounds());
  };

  win.on('closed', () => {
    if (mode === 'settings') {
      settingsWin = null;
      switchDockIcon();
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
}

async function showOrCreateWindow(mode: 'history' | 'settings') {
  const win = mode === 'settings' ? settingsWin : historyWin;
  if (win) {
    const settings = getSettings();
    const windowSettings = getWindowSettings(mode);

    const bounds = {
      ...win.getBounds(),
      ...windowSettings
    };

    if (mode === 'history' && settings.showNearCursor) {
      const point = screen.getCursorScreenPoint();
      bounds.x = point.x;
      bounds.y = point.y;
    }

    const display = screen.getDisplayNearestPoint(bounds);
    const displayLeft = display.workArea.x;
    const displayRight = display.workArea.x + display.workArea.width;
    const displayTop = display.workArea.y;
    const displayBottom = display.workArea.y + display.workArea.height;

    if (displayRight < bounds.x + bounds.width) {
      bounds.x -= bounds.x + bounds.width - displayRight;
    }
    if (bounds.x < displayLeft) {
      bounds.x = displayLeft;
    }
    if (displayBottom < bounds.y + bounds.height) {
      bounds.y -= bounds.y + bounds.height - displayBottom;
    }
    if (bounds.y < displayTop) {
      bounds.y = displayTop;
    }

    win.setOpacity(0);
    win.show(); // When minimized, show must be run before setBounds
    const setBounds: 'setBounds' | 'setContentBounds' =
      mode === 'history' && settings.showNearCursor
        ? 'setContentBounds'
        : 'setBounds';
    win[setBounds](bounds);
    win[setBounds](bounds); // When using multiple displays, a single position adjustment will not display the correct position
    setTimeout(() => {
      win.setOpacity(1);
    });
  } else {
    createWindow(mode);
  }
}

async function hideWindow(mode: 'history' | 'settings') {
  const win = mode === 'settings' ? settingsWin : historyWin;
  if (win) {
    if (process.platform === 'darwin') {
      win.close();
    } else {
      win.setOpacity(0); // Disable minimization animation
      win.minimize();
      setTimeout(() => {
        win.setOpacity(1);
      });
    }
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
      console.error('Vue Devtools failed to install:', e);
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
  if (settings.darkTheme === undefined) {
    settings.darkTheme = nativeTheme.shouldUseDarkColors;
    setSettings(settings);
  }
  if (historyWin) {
    historyWin.webContents.send('init-history', historyItems);
    historyWin.webContents.send('init-settings', settings);
  }
  if (settingsWin) {
    settingsWin.webContents.send('init-history', historyItems);
    settingsWin.webContents.send('init-settings', settings);
  }
};

const copyTextAndPostProcess = (text: string, isPasteDisabled = false) => {
  clipboard.writeText(text);
  const settings = getSettings();
  if (!isPasteDisabled) {
    if (settings.pasteAfterCopy) {
      setTimeout(() => {
        robot.keyTap('v', 'control');
      }, rules.pasteAfterCopyTimeout.value(settings.pasteAfterCopyTimeout));
    }
    if (settings.commandAfterCopy) {
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        exec(settings.commandAfterCopy!, (error: ExecException | null) => {
          if (error) {
            dialog.showErrorBox(
              'Command Error',
              `The command [${settings.commandAfterCopy}] failed.`
            );
          }
        });
      }, rules.commandAfterCopyTimeout.value(settings.commandAfterCopyTimeout));
    }
  }
  if (getSettings().closeAfterCopy) {
    if (historyWin) {
      hideWindow('history');
    }
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
  .on('web-list-item-click', (event, [text]: [string]) => {
    copyTextAndPostProcess(text);
  })
  .on('web-list-item-ctrl-click', (event, [text]: [string]) => {
    copyTextAndPostProcess(text, true);
  })
  .on('web-enter-keydown', (event, [text]: [string]) => {
    copyTextAndPostProcess(text);
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
    if (historyWin) {
      if (getSettings().showFrame !== settings.showFrame) {
        historyWin.close();
      }
    }
    setSettings(settings);
    restartMonitoring();
    registerShortcut();
    setOpenAtLogin();
    switchTaskbarIcon(historyWin);
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
