import { PreprocessingHistoryEvent } from '@/types/history-event';

export const dummy = (text: string, event: PreprocessingHistoryEvent) => {
  if (event.ctrlKey) {
    event.preventPaste(); // Call this if you don't want to paste.
  }
  if (event.shiftKey) {
    return text.replace(/^/gm, '> ').replace(/\r> \n/gm, '\r\n'); // Quote sample
  }
  if (event.key === 'd') {
    return JSON.stringify({ event, text }); // Debug
  }
  return text;
};

export default String.raw`(text: string, event: PreprocessingHistoryEvent) => {
  if (event.ctrlKey) {
    event.preventPaste(); // Call this if you don't want to paste.
  }
  if (event.shiftKey) {
    return text.replace(/^/gm, '> ').replace(/\r> \n/gm, '\r\n'); // Quote sample
  }
  if (event.key === 'd') {
    return JSON.stringify({ event, text }); // Debug
  }
  return text;
}`
  .replaceAll(': string', '')
  .replaceAll(': PreprocessingHistoryEvent', '');
