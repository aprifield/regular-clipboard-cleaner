import { clipboard, ipcMain } from 'electron';
import {
  getHistoryItems,
  getSettings,
  setHistoryItems
} from '@/background/electron-store-helper';
import { HistoryItem } from '@/types/history-item';
import { Settings } from '@/types/settings';

const MAX_LENGTH = 100;

let timeoutId: NodeJS.Timeout;
let historyItems: HistoryItem[];
let settings: Settings;

function startMonitoring() {
  historyItems = getHistoryItems();
  settings = getSettings();

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
    let text = clipboard.readText();
    if (!text) {
      return;
    }

    text = text.trim();
    const time = new Date().getTime();

    if (
      !historyItems[0] ||
      (historyItems[0] &&
        (historyItems[0].text !== text || historyItems[0].cleared))
    ) {
      historyItems = historyItems.filter(item => item.text !== text);
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
  if (clipboardText && clipboardText.trim() === removedText) {
    clipboard.clear();
  }

  historyItems = historyItems.filter(item => item.text !== removedText);
  setHistoryItems(historyItems);

  restartMonitoring();
}

export function deleteAllHistory() {
  clipboard.clear();

  historyItems = [];
  setHistoryItems(historyItems);

  restartMonitoring();
}

timeoutId = startMonitoring();
