import { Rectangle } from 'electron';
import { HistoryItem } from '@/types/history-item';
import { Settings } from '@/types/settings';
import Store from 'electron-store';

const clipboardStore = new Store<{ clipboard: HistoryItem[] }>({
  name: '.clipboard',
  fileExtension: '',
  encryptionKey: 'LzCHFd8929C4W1EEN6hPCsPYtIVTBjx7',
  defaults: { clipboard: [] }
});

const settingsStore = new Store<{ settings: Settings }>({
  name: '.settings',
  fileExtension: '',
  encryptionKey: 'jbBsbiyUGNwtRc3rUbwBgrbPi3PUztqD',
  defaults: {
    settings: {
      startAtLogin: true,
      pasteAfterCopy: process.platform !== 'darwin',
      closeAfterCopy: true,
      showNearCursor: true
    }
  }
});

console.log('[electron-store-helper] path', clipboardStore.path);
console.log('[electron-store-helper] path', settingsStore.path);

let historyItemsInMemory: HistoryItem[] | undefined;
let settingsInMemory: Settings | undefined;

export function getSettings() {
  if (settingsInMemory) {
    return settingsInMemory;
  }

  settingsInMemory = settingsStore.get('settings');
  return settingsInMemory;
}

export function setSettings(settings: Settings) {
  console.log('[electron-store-helper] setSettings settings', settings);

  const oldMaintained = getSettings().maintained;
  const newMaintained = settings.maintained;

  if (oldMaintained && !newMaintained) {
    clipboardStore.set('clipboard', []);
  } else if (!oldMaintained && newMaintained) {
    clipboardStore.set('clipboard', historyItemsInMemory);
  }

  settingsInMemory = settings;
  settingsStore.set('settings', settings);
}

export function getWindowSettings(mode: 'history' | 'settings') {
  const settings = getSettings();
  return mode === 'settings' ? settings.settingsBounds : settings.historyBounds;
}

export function setWindowSettings(
  mode: 'history' | 'settings',
  bounds: Rectangle
) {
  const settings: Settings = {
    ...getSettings(),
    [mode === 'settings' ? 'settingsBounds' : 'historyBounds']: bounds
  };
  setSettings(settings);
}

export function getHistoryItems() {
  if (historyItemsInMemory) {
    return historyItemsInMemory;
  }

  historyItemsInMemory = getSettings().maintained
    ? clipboardStore.get('clipboard')
    : [];
  return historyItemsInMemory;
}

export function setHistoryItems(historyItems: HistoryItem[]) {
  historyItemsInMemory = historyItems;
  if (getSettings().maintained) {
    clipboardStore.set('clipboard', historyItems);
  }
}
