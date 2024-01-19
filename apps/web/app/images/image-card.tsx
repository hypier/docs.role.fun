import { Button, Card, CardHeader } from "@repo/ui/src/components";
import { AspectRatio } from "@repo/ui/src/components/aspect-ratio";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import ModelBadge from "../../components/characters/model-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@repo/ui/src/components/dialog";
import { toast } from "sonner";
import { ClipboardIcon } from "lucide-react";
import AgeRestriction from "../../components/characters/age-restriction";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const ImageDetail = (props: {
  prompt: string;
  imageUrl?: string;
  model?: any;
  isDraft?: boolean;
  isNSFW?: boolean;
  creatorId?: Id<"users">;
}) => {
  const creatorName = useQuery(api.users.getUsername, {
    id: props.creatorId as Id<"users">,
  });
  return (
    <DialogContent className="max-w-3xl">
      {props?.isNSFW && <AgeRestriction />}
      <DialogHeader className="flex flex-col gap-4 lg:flex-row">
        {props.imageUrl && (
          <>
            <Image
              src={props.imageUrl}
              alt={props.prompt}
              width={300}
              height={525}
              quality={60}
              className="h-full w-full object-cover"
            />
          </>
        )}
        <div className="flex w-full flex-col gap-8">
          <div className="flex w-full flex-col gap-2">
            Prompt
            <DialogDescription>{props?.prompt}</DialogDescription>
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(props.prompt);
                  toast.success("Copied to clipboard");
                } catch (err) {
                  toast.error("Failed to copy text");
                }
              }}
              className="flex gap-1"
            >
              <ClipboardIcon className="h-4 w-4" />
              Copy Prompt
            </Button>
          </div>
          <div className="flex w-full flex-col gap-2">
            Model
            <DialogDescription>{props?.model}</DialogDescription>
          </div>
          <div className="flex w-full flex-col gap-2">
            Created by
            <DialogDescription>@{creatorName}</DialogDescription>
          </div>
        </div>
      </DialogHeader>
    </DialogContent>
  );
};

const ImageCard = (props: {
  id: string;
  prompt: string;
  imageUrl?: string;
  model?: any;
  isDraft?: boolean;
  isNSFW?: boolean;
  creatorId?: Id<"users">;
}) => {
  const { t } = useTranslation();
  return (
    <Dialog>
      <DialogTrigger>
        <AspectRatio
          ratio={1 / 1.75}
          className="group h-full w-full place-content-center overflow-hidden rounded-lg duration-200 hover:shadow-lg"
        >
          <Card className="flex h-full w-full items-end rounded-lg p-2">
            <div className="absolute top-4 z-[3] hover:z-[4]">
              <ModelBadge modelName={props.model as string} />
            </div>
            {props.imageUrl && (
              <>
                {props?.isNSFW ? (
                  <Image
                    src={props.imageUrl}
                    alt={""}
                    width={7.5}
                    height={13}
                    quality={50}
                    className="pointer-events-none absolute left-0 top-0 h-full w-full rounded-lg object-cover blur-md"
                  />
                ) : (
                  <Image
                    src={props.imageUrl}
                    alt={""}
                    width={300}
                    height={525}
                    quality={60}
                    className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-full rounded-lg object-cover"
                  />
                )}
              </>
            )}
          </Card>
        </AspectRatio>
      </DialogTrigger>
      <ImageDetail
        prompt={props?.prompt}
        imageUrl={props?.imageUrl}
        isNSFW={props?.isNSFW}
        model={props?.model}
        creatorId={props?.creatorId}
      />
    </Dialog>
  );
};

export default ImageCard;
