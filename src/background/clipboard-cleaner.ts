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

  const monitorInterval = rules.monitorInterval.value(settings.monitorInterval);
  const clearInterval = rules.clearInterval.value(settings.clearInterval);
  const maxHistoryCount = rules.maxHistoryCount.value(settings.maxHistoryCount);
  const maxTextLength = rules.maxTextLength.value(settings.maxTextLength);

  let blockListRegExp: RegExp | undefined;
  const blockList = (settings.blockList || [])
    .map(str => str.replace(/[.*+?^=!:${}()|[\]/\\]/g, '\\$&'))
    .join('|');
  if (blockList) {
    blockListRegExp = new RegExp(blockList, 'i');
  }

  let lastClearedTime = new Date().getTime();

  const clearClipboard = () => {
    console.log('[clipboard-cleaner] clear');
    clipboard.clear();
    lastClearedTime = new Date().getTime();
  };

  if (maxHistoryCount === 0) {
    return setInterval(() => {
      clearClipboard();
      if (historyItems.length !== 0) {
        historyItems.length = 0;
        setHistoryItems(historyItems);
        ipcMain.emit('clipboard-history-change', historyItems);
      }
    }, clearInterval * 1000);
  } else {
    return setInterval(() => {
      const time = new Date().getTime();
      const text = clipboard.readText();
      if (
        !text ||
        text.length > maxTextLength ||
        (blockListRegExp && blockListRegExp.test(text))
      ) {
        const diff = time - lastClearedTime;
        console.log('[clipboard-cleaner] diff', diff / 1000);
        if (clearInterval * 1000 <= diff) {
          clearClipboard();
        }
        return;
      }

      if (
        !historyItems[0] ||
        historyItems[0].cleared ||
        historyItems[0].text !== text
      ) {
        if (!historyItems[0]) {
          historyItems.unshift({ text, time });
        } else if (historyItems[0].cleared) {
          historyItems[0] = { text, time };
        } else if (historyItems[0].text !== text) {
          const index = historyItems.findIndex(item => item.text === text);
          if (0 <= index) {
            historyItems.splice(index, 1);
          }
          historyItems.unshift({ text, time });
          if (maxHistoryCount < historyItems.length) {
            historyItems.length = maxHistoryCount;
          }
        }
        setHistoryItems(historyItems);
        ipcMain.emit('clipboard-history-change', historyItems);
      } else {
        if (historyItems[0].text === text) {
          const diff = time - historyItems[0].time;
          console.log('[clipboard-cleaner] diff', diff / 1000);
          if (clearInterval * 1000 <= diff) {
            clearClipboard();
            historyItems[0].cleared = true;
            setHistoryItems(historyItems);
          }
        }
      }
    }, monitorInterval * 1000);
  }
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
