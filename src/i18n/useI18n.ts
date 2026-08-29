import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { translate, plural, type I18nParams, type Lang } from './translations';

interface UseI18nReturn {
  language: Lang;
  setLanguage: (language: Lang) => void;
  /** Traduction simple avec interpolation `{key}`. */
  t: (key: string, params?: I18nParams) => string;
  /** Traduction avec pluriel selon la langue (clés `.one` / `.other`). */
  tp: (key: string, count: number, params?: I18nParams) => string;
}

export function useI18n(): UseI18nReturn {
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);

  const t = useCallback(
    (key: string, params?: I18nParams) => translate(language, key, params),
    [language],
  );
  const tp = useCallback(
    (key: string, count: number, params?: I18nParams) =>
      plural(language, key, count, params),
    [language],
  );

  return { language, setLanguage, t, tp };
}