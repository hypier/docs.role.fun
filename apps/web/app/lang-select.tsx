import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/components/select";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import useCurrentUser from "./lib/hooks/use-current-user";
import { api } from "../convex/_generated/api";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { Languages } from "lucide-react";

export function useLanguage() {
  const { i18n } = useTranslation();
  const currentUser = useCurrentUser();
  const autoTranslate = currentUser?.autoTranslate ?? true;
  const toggleAutoTranslate = useMutation(api.users.toggleAutoTranslate);
  const setLanguage = useMutation(api.users.setLanguage);
  const userLanguage = currentUser?.languageTag;
  const i18nextLanguage = i18next.language || window.localStorage.i18nextLng;
  const currentLanguage = userLanguage || i18nextLanguage;

  useEffect(() => {
    i18n.changeLanguage(userLanguage);
  }, [userLanguage]);

  return {
    currentLanguage,
    setLanguage,
    i18n,
    autoTranslate,
    toggleAutoTranslate,
  };
}

export function LanguageSelect({ isCompact = false }: { isCompact?: boolean }) {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage, i18n } = useLanguage();
  return (
    <Select
      onValueChange={(value) => {
        i18n.changeLanguage(value);
        setLanguage({ languageTag: value });
      }}
      defaultValue={currentLanguage}
      value={currentLanguage}
    >
      <SelectTrigger className={isCompact ? "h-7 text-xs" : ""}>
        <SelectValue placeholder={t("Select a language")} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{t("Languages")}</SelectLabel>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="ko">한국어</SelectItem>
          <SelectItem value="ja">日本語</SelectItem>
          <SelectItem value="zh">中文</SelectItem>
          <SelectItem value="ar">العربية</SelectItem>
          <SelectItem value="cs">Čeština</SelectItem>
          <SelectItem value="da">Dansk</SelectItem>
          <SelectItem value="de">Deutsch</SelectItem>
          <SelectItem value="el">Ελληνικά</SelectItem>
          <SelectItem value="es">Español</SelectItem>
          <SelectItem value="fi">Suomi</SelectItem>
          <SelectItem value="fr">Français</SelectItem>
          <SelectItem value="it">Italiano</SelectItem>
          <SelectItem value="nl">Nederlands</SelectItem>
          <SelectItem value="no">Norsk</SelectItem>
          <SelectItem value="pl">Polski</SelectItem>
          <SelectItem value="pt">Português</SelectItem>
          <SelectItem value="ro">Română</SelectItem>
          <SelectItem value="ru">Русский</SelectItem>
          <SelectItem value="sv">Svenska</SelectItem>
          <SelectItem value="uk">Українська</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
