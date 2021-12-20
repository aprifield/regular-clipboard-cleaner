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

  const blockList = (settings.blockList || [])
    .map(str => str.replace(/[.*+?^=!:${}()|[\]/\\]/g, '\\$&'))
    .join('|');
  const blockListRegExp = blockList ? new RegExp(blockList, 'i') : undefined;

  let clearedTime = new Date().getTime();
  let notHistoryReadTime = 0;
  let notHistoryChangedTime = 0;
  let lastAvailableFormats = [] as string[];

  const clearClipboard = () => {
    console.log('[clipboard-cleaner] clear');
    clipboard.clear();
    clearedTime = new Date().getTime();
  };

  if (maxHistoryCount === 0) {
    if (historyItems.length) {
      historyItems.length = 0;
      setHistoryItems(historyItems);
      ipcMain.emit('clipboard-history-change', historyItems);
    }
  }

  return setInterval(() => {
    const time = new Date().getTime();
    const text = clipboard.readText();
    const currentAvailableFormats = clipboard.availableFormats();

    if (
      maxHistoryCount === 0 ||
      !text ||
      text.length > maxTextLength ||
      (blockListRegExp && blockListRegExp.test(text))
    ) {
      notHistoryReadTime = time;

      if (!currentAvailableFormats.length) {
        const file =
          process.platform === 'darwin'
            ? clipboard.read('public.file-url')
            : clipboard.readBuffer('FileNameW');
        if (file.length) {
          currentAvailableFormats.push('clipboard-cleaner/file');
        }
      }

      if (
        JSON.stringify(currentAvailableFormats) !==
        JSON.stringify(lastAvailableFormats)
      ) {
        notHistoryChangedTime = time;
        lastAvailableFormats = currentAvailableFormats;
      } else {
        const diff = time - Math.max(clearedTime, notHistoryChangedTime);
        console.log(
          '[clipboard-cleaner] not history diff',
          diff / 1000,
          currentAvailableFormats
        );
        if (clearInterval * 1000 <= diff) {
          clearClipboard();
        }
      }

      return;
    }

    lastAvailableFormats = currentAvailableFormats;

    if (!historyItems[0] || historyItems[0].text !== text) {
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
    } else {
      if (historyItems[0].text === text) {
        const diff = time - Math.max(historyItems[0].time, notHistoryReadTime);
        console.log('[clipboard-cleaner] same text diff', diff / 1000);
        if (clearInterval * 1000 <= diff) {
          clearClipboard();
          setHistoryItems(historyItems);
        }
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
