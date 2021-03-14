import { clipboard, ipcMain } from 'electron';
import {
  getHistoryItems,
  setHistoryItems
} from '@/background/electron-store-helper';

const MAX_LENGTH = 100;

function start() {
  let historyItems = getHistoryItems();

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
      ipcMain.emit('clipboard-read', historyItems);
    }
    if (historyItems[0] && historyItems[0].text === text) {
      const diff = (time - historyItems[0].time) / 1000;
      console.log('[clipboard-cleaner] diff', diff);
      if (60 < diff) {
        clipboard.clear();
        historyItems[0].cleared = true;
        setHistoryItems(historyItems);
      }
    }
  }, 2 * 1000);
}

let timeoutId = start();

export function restart() {
  clearInterval(timeoutId);
  timeoutId = start();
}
