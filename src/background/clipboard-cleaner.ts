import { clipboard, ipcMain } from 'electron';
import {
  getHistoryItems,
  getSettings,
  setHistoryItems
} from '@/background/electron-store-helper';

const MAX_LENGTH = 100;

let timeoutId: NodeJS.Timeout;

function startMonitoring() {
  const historyItems = getHistoryItems();
  const settings = getSettings();

  const monitorInterval =
    settings.monitorInterval !== undefined &&
    1 <= +settings.monitorInterval &&
    +settings.monitorInterval <= Number.MAX_SAFE_INTEGER
      ? +settings.monitorInterval
      : 2;
  const clearInterval =
    settings.clearInterval !== undefined &&
    1 <= +settings.clearInterval &&
    +settings.clearInterval <= Number.MAX_SAFE_INTEGER
      ? +settings.clearInterval
      : 60;

  return setInterval(() => {
    const text = clipboard.readText();
    if (!text) {
      return;
    }

    const time = new Date().getTime();

    if (
      !historyItems[0] ||
      (historyItems[0] &&
        (historyItems[0].text !== text || historyItems[0].cleared))
    ) {
      const index = historyItems.findIndex(item => item.text === text);
      if (0 <= index) {
        historyItems.splice(index, 1);
      }
      historyItems.unshift({ text, time });
      if (MAX_LENGTH < historyItems.length) {
        historyItems.length = MAX_LENGTH;
      }
      setHistoryItems(historyItems);
      ipcMain.emit('clipboard-history-change', historyItems);
    }
    if (historyItems[0] && historyItems[0].text === text) {
      const diff = time - historyItems[0].time;
      console.log('[clipboard-cleaner] diff', diff / 1000);
      if (clearInterval * 1000 <= diff) {
        clipboard.clear();
        historyItems[0].cleared = true;
        setHistoryItems(historyItems);
      }
    }
  }, monitorInterval * 1000);
}

export function restartMonitoring() {
  clearInterval(timeoutId);
  timeoutId = startMonitoring();
}

export function deleteHistory(removedText: string) {
  const clipboardText = clipboard.readText();
  if (clipboardText && clipboardText === removedText) {
    clipboard.clear();
  }

  const historyItems = getHistoryItems();
  const index = historyItems.findIndex(item => item.text === removedText);
  if (0 <= index) {
    historyItems.splice(index, 1);
  }
  setHistoryItems(historyItems);

  restartMonitoring();
}

export function deleteAllHistory() {
  clipboard.clear();

  setHistoryItems([]);

  restartMonitoring();
}

timeoutId = startMonitoring();
