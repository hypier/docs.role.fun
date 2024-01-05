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
  cardImageUrl,
  name,
}: {
  setCharacterId: any;
  cardImageUrl: string;
  name: string;
}) => {
  const generate = useMutation(api.characters.generate);
  const [isGenerating, setIsGenerating] = useState(false);

  const [generationStep, setGenerationStep] = useState(0);
  const generationSteps = [
    "name",
    "description",
    "instructions",
    "greeting",
    "character",
    "something",
    "magic",
    "wonder",
    "future",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setGenerationStep((prevStep) => (prevStep + 1) % generationSteps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (name && !cardImageUrl && isGenerating) {
      toast.success("Character detail is generated.");
      toast.info("Generating character image...");
    }
    cardImageUrl && setIsGenerating(false);
  }, [cardImageUrl, name]);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="hidden gap-1 md:flex"
          disabled={Boolean(cardImageUrl) || Boolean(name) || isGenerating}
        >
          {isGenerating ? (
            <>
              <Spinner />
              Generating {generationSteps[generationStep]}...
            </>
          ) : (
            <>
              Generate character
              <Crystal className="h-4 w-4" /> x 85
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
              toast.info("Character will be generated within a minute.");
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
