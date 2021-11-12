import { PreprocessingHistoryEvent } from '@/types/history-event';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dummy = (text: string, event: PreprocessingHistoryEvent) => {
  if (event.ctrlKey) {
    event.preventPaste(); // Call this if you don't want to paste.
  }
  if (event.shiftKey) {
    const m = text.match(/\r\n|\n|\r/);
    return m
      ? text
          .split(m[0])
          .map(str => '> ' + str)
          .join(m[0])
      : '> ' + text;
  }
  if (event.key === 'u') {
    return text.toUpperCase();
  }
  if (event.key === 'l') {
    return text.toLowerCase();
  }
  if (event.key === 'd') {
    return JSON.stringify({ event, text });
  }
  return text;
};

export default String.raw`(text: string, event: PreprocessingHistoryEvent) => {
  if (event.ctrlKey) {
    event.preventPaste(); // Call this if you don't want to paste.
  }
  if (event.shiftKey) {
    const m = text.match(/\r\n|\n|\r/);
    return m
      ? text
          .split(m[0])
          .map(str => '> ' + str)
          .join(m[0])
      : '> ' + text;
  }
  if (event.key === 'u') {
    return text.toUpperCase();
  }
  if (event.key === 'l') {
    return text.toLowerCase();
  }
  if (event.key === 'd') {
    return JSON.stringify({ event, text });
  }
  return text;
}`
  .replaceAll(': string', '')
  .replaceAll(': PreprocessingHistoryEvent', '');
