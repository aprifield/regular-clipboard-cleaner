import { clipboard, ipcMain } from 'electron';
import {
  getHistoryItems,
  getSettings,
  setHistoryItems
} from '@/background/electron-store-helper';
import rules from '@/util/rules';

let timeoutId: NodeJS.Timeout;

function startMonitoring() {
  const historyItems = getHistoryItems();
  const settings = getSettings();

  const monitorInterval = rules.monitorInterval.rule(settings.monitorInterval)
    ? Number(settings.monitorInterval)
    : rules.monitorInterval.init;
  const clearInterval = rules.clearInterval.rule(settings.clearInterval)
    ? Number(settings.clearInterval)
    : rules.clearInterval.init;
  const maxHistoryCount = rules.maxHistoryCount.rule(settings.maxHistoryCount)
    ? Number(settings.maxHistoryCount)
    : rules.maxHistoryCount.init;

  if (maxHistoryCount === 0) {
    return setInterval(() => {
      clipboard.clear();
      if (historyItems.length !== 0) {
        historyItems.length = 0;
        setHistoryItems(historyItems);
        ipcMain.emit('clipboard-history-change', historyItems);
      }
    }, clearInterval * 1000);
  }

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
      if (maxHistoryCount < historyItems.length) {
        historyItems.length = maxHistoryCount;
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
