import { english } from './english';
import { german } from './german';
import { polish } from './polish';

export const languages = {
  en: english,
  de: german,
  pl: polish,
};

export const languageList = Object.values(languages).map((lang) => ({
  code: lang.code,
  name: lang.name,
  nativeName: lang.nativeName,
  flag: lang.flag,
}));

export { english, german, polish };
