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
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Crystal } from "@repo/ui/src/components/icons";
import Spinner from "@repo/ui/src/components/spinner";
import { useEffect, useState } from "react";

export const GenerateButton = ({
  setCharacterId,
  isReady,
}: {
  setCharacterId: any;
  isReady: boolean;
}) => {
  const generate = useMutation(api.characters.generate);
  const [isGenerating, setIsGenerating] = useState(false);
  useEffect(() => {
    isReady && setIsGenerating(false);
  }, [isReady]);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="flex gap-1"
          disabled={Boolean(isReady) || isGenerating}
        >
          {isGenerating ? (
            <>
              <Spinner />
              Generating...
            </>
          ) : (
            <>
              Generate character
              <Crystal className="w-4 h-4" /> x 76
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {`While character is generating, everything in your current character form can be overwritten. Image could take longer to generate.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              setIsGenerating(true);
              const characterId = await generate();
              setCharacterId(characterId);
              toast.success("Character will be generated within 30 seconds.");
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
