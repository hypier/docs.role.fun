import i18n from "i18next";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import translationKo from "../public/locales/ko.json";
import translationJa from "../public/locales/ja.json";
import translationZh from "../public/locales/zh.json";
import translationAr from "../public/locales/ar.json";
import translationCs from "../public/locales/cs.json";
import translationDa from "../public/locales/da.json";
import translationDe from "../public/locales/de.json";
import translationEl from "../public/locales/el.json";
import translationEs from "../public/locales/es.json";
import translationFi from "../public/locales/fi.json";
import translationFr from "../public/locales/fr.json";
import translationIt from "../public/locales/it.json";
import translationNl from "../public/locales/nl.json";
import translationNo from "../public/locales/no.json";
import translationPl from "../public/locales/pl.json";
import translationPt from "../public/locales/pt.json";
import translationRo from "../public/locales/ro.json";
import translationRu from "../public/locales/ru.json";
import translationSv from "../public/locales/sv.json";
import translationUk from "../public/locales/uk.json";

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
      zh: {
        translation: translationZh,
      },
      ar: {
        translation: translationAr,
      },
      cs: {
        translation: translationCs,
      },
      da: {
        translation: translationDa,
      },
      de: {
        translation: translationDe,
      },
      el: {
        translation: translationEl,
      },
      es: {
        translation: translationEs,
      },
      fi: {
        translation: translationFi,
      },
      fr: {
        translation: translationFr,
      },
      it: {
        translation: translationIt,
      },
      nl: {
        translation: translationNl,
      },
      no: {
        translation: translationNo,
      },
      pl: {
        translation: translationPl,
      },
      pt: {
        translation: translationPt,
      },
      ro: {
        translation: translationRo,
      },
      ru: {
        translation: translationRu,
      },
      sv: {
        translation: translationSv,
      },
      uk: {
        translation: translationUk,
      },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
