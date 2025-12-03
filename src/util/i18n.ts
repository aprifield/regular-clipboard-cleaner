import en from '@/locales/en';
import ja from '@/locales/ja';

let dictionary: { [key: string]: string };

export function loadDictionary(locale = 'en') {
  if (dictionary) {
    return;
  }

  dictionary = locale === 'ja' ? ja : en;
}

export function translate(key: string, ...params: string[]) {
  if (!dictionary[key]) {
    return undefined;
  }

  return dictionary[key].replace(/{(\d+)}/g, (match, index) => {
    return params[index];
  });
}
