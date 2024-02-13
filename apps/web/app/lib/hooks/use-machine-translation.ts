import { useQuery } from "convex/react";
import { create } from "zustand";
import { api } from "../../../convex/_generated/api";
import { useLanguage } from "../../lang-select";
import { useEffect } from "react";

type State = {
  translations: Record<string, string>;
  count: number;
  addTranslation: (key: string, value: string) => void;
  setTranslations: (newTranslations: any) => void;
  inc: () => void;
};

export const useTranslationStore = create<State>((set) => ({
  translations: {},
  count: 0,
  addTranslation: (key, value) =>
    set((state) => ({ translations: { ...state.translations, [key]: value } })),
  setTranslations: (newTranslations: any) =>
    set(() => ({ translations: newTranslations })),
  inc: () => set((state) => ({ count: state.count + 1 })),
}));

export const initializeTranslationStore = () => {
  const { currentLanguage } = useLanguage();
  const { setTranslations, translations } = useTranslationStore();
  const allTranslations = useQuery(
    api.translation.list,
    currentLanguage
      ? Object.keys(translations).length === 0 && currentLanguage !== "en"
        ? {
            targetLanguage: currentLanguage,
          }
        : "skip"
      : "skip",
  );

  useEffect(() => {
    if (allTranslations) {
      const newTranslations = allTranslations.reduce(
        (acc: any, translation: any) => {
          acc[translation.text] = translation.translation;
          return acc;
        },
        {},
      );
      setTranslations(newTranslations);
    }
  }, [allTranslations, setTranslations]);
};

export const useMachineTranslation = () => {
  const mt = (text: string, translations: Record<string, string>) => {
    if (translations && translations.hasOwnProperty(text)) {
      return translations[text];
    }
    return text;
  };

  return { mt };
};
