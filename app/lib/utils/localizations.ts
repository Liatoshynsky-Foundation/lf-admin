export function getLocalizations(locale: Array<string>) {
  if (locale.includes('uk') && locale.includes('en')) {
    return '';
  } else if (locale.includes('en')) {
    return 'EN';
  } else {
    return 'UK';
  }
}
