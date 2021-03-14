import { HistoryItem } from '@/types/history-item';
import Store from 'electron-store';

const store = new Store({
  name: 'config',
  fileExtension: '',
  encryptionKey: 'pXQ3IB3BT0yqbX5SSYP'
});

console.log('[electron-store-helper] path', store.path);

export default store;

let historyItemsInMemory: HistoryItem[] = [];

export function getHistoryItems() {
  // return (store.get('historyItems') as HistoryItem[]) || [];
  return historyItemsInMemory;
}

export function setHistoryItems(historyItems: HistoryItem[]) {
  // store.set('historyItems', historyItems);
  historyItemsInMemory = historyItems;
}
