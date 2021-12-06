import { PreprocessingHistoryEvent } from '@/types/history-event';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dummy = (text: string, event: PreprocessingHistoryEvent) => {
  const addPrefix = (prefix: string | number) => {
    const map = (str: string, index: number, lines: string[]) =>
      index + 1 === lines.length && !str
        ? ''
        : +prefix
        ? (index + 1 + '').padStart(+prefix, '0') + ': ' + str
        : prefix + str;
    const eol = text.match(/\r\n|\n|\r/);
    return eol
      ? text
          .split(eol[0])
          .map(map)
          .join(eol[0])
      : map(text, 0, [text]);
  };

  text = text.replaceAll('Javascript', 'JavaScript');

  if (event.ctrlKey) {
    event.preventPaste(); // Call this if you don't want to paste.
  }
  if (event.key === 'u') {
    return text.toUpperCase();
  }
  if (event.key === 'l') {
    return text.toLowerCase();
  }
  if (event.key === 'c') {
    return text.replace(/_(.)/g, (match, p1) => p1.toUpperCase()); // To camelCase
  }
  if (event.key === 's' || event.key === 'S') {
    text = text.replace(/([A-Z])/g, match => '_' + match.toLowerCase()); // To snake_case
    return event.key === 'S' ? text.toUpperCase() : text;
  }
  if (event.key === 'q' || event.shiftKey) {
    return addPrefix('> '); // Add quote
  }
  if (event.key && 1 <= +event.key && +event.key <= 9) {
    return addPrefix(+event.key); // Add line number
  }
  if (event.key === 'd') {
    return JSON.stringify({ event, text }); // For debug
  }
  return text;
};

export default String.raw`(text: string, event: PreprocessingHistoryEvent) => {
  const addPrefix = (prefix: string | number) => {
    const map = (str: string, index: number, lines: string[]) =>
      index + 1 === lines.length && !str
        ? ''
        : +prefix
        ? (index + 1 + '').padStart(+prefix, '0') + ': ' + str
        : prefix + str;
    const eol = text.match(/\r\n|\n|\r/);
    return eol
      ? text
          .split(eol[0])
          .map(map)
          .join(eol[0])
      : map(text, 0, [text]);
  };

  text = text.replaceAll('Javascript', 'JavaScript');

  if (event.ctrlKey) {
    event.preventPaste(); // Call this if you don't want to paste.
  }
  if (event.key === 'u') {
    return text.toUpperCase();
  }
  if (event.key === 'l') {
    return text.toLowerCase();
  }
  if (event.key === 'c') {
    return text.replace(/_(.)/g, (match, p1) => p1.toUpperCase()); // To camelCase
  }
  if (event.key === 's' || event.key === 'S') {
    text = text.replace(/([A-Z])/g, match => '_' + match.toLowerCase()); // To snake_case
    return event.key === 'S' ? text.toUpperCase() : text;
  }
  if (event.key === 'q' || event.shiftKey) {
    return addPrefix('> '); // Add quote
  }
  if (event.key && 1 <= +event.key && +event.key <= 9) {
    return addPrefix(+event.key); // Add line number
  }
  if (event.key === 'd') {
    return JSON.stringify({ event, text }); // For debug
  }
  return text;
}`
  .replaceAll(': string | number', '')
  .replaceAll(': string[]', '')
  .replaceAll(': string', '')
  .replaceAll(': number', '')
  .replaceAll(': PreprocessingHistoryEvent', '');
