import i18n from "i18next";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import translationKo from "../public/locales/ko.json";
import translationJa from "../public/locales/ja.json";
import translationCn from "../public/locales/cn.json";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {},
      },
      ko: {
        translation: translationKo,
      },
      ja: {
        translation: translationJa,
      },
      cn: {
        translation: translationCn,
      },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
