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
import useCurrentUser from "../app/lib/hooks/use-current-user";
import { useEffect, useState } from "react";
import { Rating18Plus } from "@repo/ui/src/components/icons";
import { Label } from "@repo/ui/src/components/label";
import { Switch } from "@repo/ui/src/components/switch";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AgeRestriction = () => {
  const me = useCurrentUser();
  const [showDialog, setShowDialog] = useState(false);
  const updateNSFWPreference = useMutation(api.users.updateNSFWPreference);
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
              <Rating18Plus className="h-5 w-5" />
              Mature Content
            </AlertDialogTitle>
            <AlertDialogDescription className="flex">
              By enabling Mature Content, you confirm you are over the age of
              18.
            </AlertDialogDescription>
            <div className="flex items-center space-x-2 pt-4">
              <Switch
                id="allow"
                checked={me?.nsfwPreference === "allow"}
                onCheckedChange={(checked: boolean) => {
                  const promise = updateNSFWPreference({
                    nsfwPreference: checked ? "allow" : "auto",
                  });
                  toast.promise(promise, {
                    loading: "Updating preference...",
                    success: "Preference updated successfully",
                    error: "Failed to update preference",
                  });
                }}
              />
              <Label htmlFor="allow">Always allow</Label>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => router.back()}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  );
};

export default AgeRestriction;
