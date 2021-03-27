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
  defaults: { settings: {} }
});

console.log('[electron-store-helper] path', clipboardStore.path);
console.log('[electron-store-helper] path', settingsStore.path);

let historyItemsInMemory: HistoryItem[] = [];

export function getSettings() {
  return settingsStore.get('settings');
}

export function setSettings(settings: Settings) {
  console.log('[electron-store-helper] setSettings settings', settings);
  const oldSettings = settingsStore.get('settings');
  if (oldSettings.maintained && !settings.maintained) {
    historyItemsInMemory = clipboardStore.get('clipboard');
    clipboardStore.set('clipboard', []);
  } else if (!oldSettings.maintained && settings.maintained) {
    clipboardStore.set('clipboard', historyItemsInMemory);
    historyItemsInMemory = [];
  }
  settingsStore.set('settings', settings);
}

export function getHistoryItems() {
  if (settingsStore.get('settings').maintained) {
    return clipboardStore.get('clipboard');
  } else {
    return historyItemsInMemory;
  }
}

export function setHistoryItems(historyItems: HistoryItem[]) {
  if (settingsStore.get('settings').maintained) {
    clipboardStore.set('clipboard', historyItems);
  } else {
    historyItemsInMemory = historyItems;
  }
}
