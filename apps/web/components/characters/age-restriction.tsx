import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/src/components/alert-dialog";
import useCurrentUser from "../../app/lib/hooks/use-current-user";
import { useEffect, useState } from "react";
import { Rating18Plus } from "@repo/ui/src/components/icons";
import { Label } from "@repo/ui/src/components/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/components/select";
import { useNsfwPreference } from "../../app/lib/hooks/use-nsfw-preference";

export const PreferenceSelect = ({
  showLabel = true,
}: {
  showLabel?: boolean;
}) => {
  const me = useCurrentUser();
  const { t } = useTranslation();
  const { nsfwPreference, updatePreference } = useNsfwPreference();

  return (
    <div className="flex flex-col gap-2 pt-4">
      {showLabel && (
        <Label htmlFor="nsfwPreference" className="text-xs">
          {t("Mature Content")}
        </Label>
      )}
      <Select
        onValueChange={(value: "allow" | "auto" | "block") => {
          const promise = updatePreference(value);
          toast.promise(promise, {
            loading: "Updating preference...",
            success: "Preference updated successfully",
            error: me?.name
              ? "Failed to update preference."
              : "Log in to save your preference.",
          });
        }}
        defaultValue={nsfwPreference as string}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={t("Select a preference (Current: Block)")}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="allow">{t("Always allow")}</SelectItem>
          <SelectItem value="auto">{t("Always ask")}</SelectItem>
          <SelectItem value="block">{t("Always block")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

const AgeRestriction = () => {
  const me = useCurrentUser();
  const { t } = useTranslation();
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (me?.nsfwPreference !== "allow") {
      setShowDialog(true);
    } else {
      setShowDialog(false);
    }
  }, [me]);

  return (
    showDialog && (
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-1">
              <Rating18Plus className="h-5 w-5 text-amber-500" />
              {t("Mature Content")}
            </AlertDialogTitle>
            <AlertDialogDescription className="flex">
              {t(
                "This model, character or content is uncensored. By enabling Mature Content, you confirm you are over the age of 18.",
              )}
            </AlertDialogDescription>
            <PreferenceSelect />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => router.back()}>
              {t("Go back")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={
                me?.nsfwPreference === "block" ? () => router.back() : undefined
              }
            >
              {t("Confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  );
};
export default AgeRestriction;
