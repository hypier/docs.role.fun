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

export const ArchiveButton = ({
  archive,
  characterId,
}: {
  archive: any;
  characterId: Id<"characters">;
}) => {
  const router = useRouter();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="text-muted-foreground">
          Archive character
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
