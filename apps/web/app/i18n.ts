import i18n from "i18next";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

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
        translation: {
          "opensource ai characters": "오픈소스 AI 캐릭터",
          alpha: "알파",
          Create: "만들기",
          "Log in": "로그인",
          Discover: "발견",
          Chats: "채팅",
          My: "내",
          Characters: "캐릭터",
          Personas: "페르소나",
          Shop: "상점",
          Community: "커뮤니티",
          "My Characters": "내 캐릭터",
          "Create character": "캐릭터 만들기",
          "Create and customize characters.": "캐릭터를 만들고 설정해보세요.",
        },
      },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
