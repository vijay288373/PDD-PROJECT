/**
 * react-i18next compatibility shim.
 * Maps the useTranslation() API used by profile components
 * to our custom i18n module + useLang hook.
 */
import { t as translate } from '../lib/i18n';
import { useLang } from '../lib/useLang';

export function useTranslation() {
  const { langCode, setLangCode } = useLang();

  // Wrap our t(key, langCode) to match react-i18next's t(key) API
  const t = (key) => translate(key, langCode);

  const i18n = {
    language: langCode,
    changeLanguage: (code) => setLangCode(code),
  };

  return { t, i18n };
}
