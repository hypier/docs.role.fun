import { Button } from "@repo/ui/src/components";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/src/components/alert-dialog";
import { useRouter } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTranslation } from "react-i18next";

export const ArchiveButton = ({
  characterId,
}: {
  characterId: Id<"characters">;
}) => {
  const archive = useMutation(api.characters.archive);
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="text-muted-foreground">
          {t("Archive")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {`This action cannot be undone. Archived characters are not discoverable from the homepage. Users who already interacted with the characters can still see their messages.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              const promise = archive({
                id: characterId as Id<"characters">,
              });
              toast.promise(promise, {
                loading: "Archiving character...",
                success: () => {
                  router.back();
                  return `Character has been archived.`;
                },
                error: (error) => {
                  return error?.data
                    ? (error.data as { message: string })?.message
                    : "Unexpected error occurred";
                },
              });
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
