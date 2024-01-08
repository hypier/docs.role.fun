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

export function LanguageSelect() {
  const { i18n, t } = useTranslation();
  const currentUser = useCurrentUser();
  const setLanguage = useMutation(api.users.setLanguage);
  const userLanguage = currentUser?.languageTag;
  const i18nextLanguage = i18next.language || window.localStorage.i18nextLng;
  const currentLanguage = userLanguage || i18nextLanguage;

  useEffect(() => {
    i18n.changeLanguage(userLanguage);
  }, [userLanguage]);

  return (
    <Select
      onValueChange={(value) => {
        i18n.changeLanguage(value);
        setLanguage({ languageTag: value });
      }}
      defaultValue={currentLanguage}
      value={currentLanguage}
    >
      <SelectTrigger>
        <SelectValue placeholder={t("Select a language")} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{t("Languages")}</SelectLabel>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="ko">한국어</SelectItem>
          <SelectItem value="cn">中文</SelectItem>
          <SelectItem value="ja">日本語</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
