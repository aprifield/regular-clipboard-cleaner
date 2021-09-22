let dictionary: { [key: string]: string };

export function loadDictionary(locale = 'en') {
  if (dictionary) {
    return;
  }

  try {
    dictionary = require(`@/locales/${locale}.json`);
  } catch {
    dictionary = require(`@/locales/en.json`);
  }
}

export function translate(key: string, ...params: string[]) {
  if (!dictionary[key]) {
    return undefined;
  }

  return dictionary[key].replace(/{(\d+)}/g, (match, index) => {
    return params[index];
  });
}
