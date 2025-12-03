import { clipboard, ipcMain } from 'electron';
import rules from '@/util/rules';
import {
  getHistoryItems,
  getSettings,
  setHistoryItems,
} from './electron-store-helper';

let timeoutId: NodeJS.Timeout;

function startMonitoring() {
  const historyItems = getHistoryItems();
  const settings = getSettings();

  const monitorInterval = rules.monitorInterval.value(settings.monitorInterval);
  const clearInterval = rules.clearInterval.value(settings.clearInterval);
  const maxHistoryCount = rules.maxHistoryCount.value(settings.maxHistoryCount);
  const maxTextLength = rules.maxTextLength.value(settings.maxTextLength);

  const blockList = (settings.blockList || [])
    .map((str) => str.replace(/[.*+?^=!:${}()|[\]/\\]/g, String.raw`\$&`))
    .join('|');
  const blockListRegExp = blockList ? new RegExp(blockList, 'i') : undefined;

  let clearedTime = Date.now();
  let notHistoryReadTime = 0;
  let notHistoryChangedTime = 0;
  let lastAvailableFormats = [] as string[];

  const clearClipboard = () => {
    console.log('[clipboard-cleaner] clear');
    clipboard.clear();
    clearedTime = Date.now();
  };

  const trimHistoryItems = () => {
    for (
      let i = historyItems.length - 1;
      i >= 0 && historyItems.length > maxHistoryCount;
      i--
    ) {
      if (!historyItems[i].pinned) {
        historyItems.splice(i, 1);
      }
    }
  };

  if (maxHistoryCount < historyItems.length) {
    trimHistoryItems();
    setHistoryItems(historyItems);
    ipcMain.emit('native:change:clipboard-history', historyItems);
  }

  return setInterval(() => {
    const time = Date.now();
    const text = clipboard.readText();
    const currentAvailableFormats = clipboard.availableFormats();

    if (
      maxHistoryCount === 0 ||
      !text ||
      text.length > maxTextLength ||
      (blockListRegExp && blockListRegExp.test(text))
    ) {
      notHistoryReadTime = time;

      if (currentAvailableFormats.length === 0) {
        const file =
          process.platform === 'darwin'
            ? clipboard.read('public.file-url')
            : clipboard.readBuffer('FileNameW');
        if (file.length > 0) {
          currentAvailableFormats.push('clipboard-cleaner/file');
        }
      }

      if (
        JSON.stringify(currentAvailableFormats) ===
        JSON.stringify(lastAvailableFormats)
      ) {
        const diff = time - Math.max(clearedTime, notHistoryChangedTime);
        console.log(
          '[clipboard-cleaner] not history diff',
          diff / 1000,
          currentAvailableFormats
        );
        if (clearInterval * 1000 <= diff) {
          clearClipboard();
        }
      } else {
        notHistoryChangedTime = time;
        lastAvailableFormats = currentAvailableFormats;
      }

      return;
    }

    lastAvailableFormats = currentAvailableFormats;

    if (!historyItems[0] || historyItems[0].text !== text) {
      const index = historyItems.findIndex((item) => item.text === text);
      if (0 <= index) {
        const foundItem = historyItems[index];
        historyItems.splice(index, 1);
        historyItems.unshift(foundItem);
      } else {
        historyItems.unshift({ text, time });
      }
      trimHistoryItems();
      setHistoryItems(historyItems);
      ipcMain.emit('native:change:clipboard-history', historyItems);
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

export function pinHistory(pinnedText: string) {
  const historyItems = getHistoryItems();
  const foundItem = historyItems.find((item) => item.text === pinnedText);
  if (foundItem) {
    foundItem.pinned = !foundItem.pinned;
  }
  setHistoryItems(historyItems);

  restartMonitoring();
}

export function deleteHistory(removedText: string) {
  const clipboardText = clipboard.readText();
  if (clipboardText && clipboardText === removedText) {
    clipboard.clear();
  }

  const historyItems = getHistoryItems();
  const index = historyItems.findIndex((item) => item.text === removedText);
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
