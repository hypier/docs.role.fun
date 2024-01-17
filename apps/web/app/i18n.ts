import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

i18n
  .use(Backend) // use http backend to load translation files
  .use(LanguageDetector) // detect user language
  .use(initReactI18next) // pass the i18n instance to react-i18next.
  .init({
    backend: {
      // path where resources get loaded from, or a function
      // returning a path:
      // function(lngs, namespaces) { return customPath; }
      // the returned path will interpolate lng, ns if provided like giving a static path
      loadPath: "/locales/{{lng}}.json",

      // your backend server supports multiloading
      // /locales/resources.json?lng=de+en&ns=translation
      // Adapter is needed to enable MultiLoading https://github.com/i18next/i18next-multiload-backend-adapter
      // Returned JSON structure in this case is
      // {
      //  lang : {
      //   namespaceA: {},
      //   namespaceB: {},
      //   ...etc
      //  }
      // }
      allowMultiLoading: false, // set loadPath: '/locales/resources.json?lng={{lng}}&ns={{ns}}' to adapt to multiLoading
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
