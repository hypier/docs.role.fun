import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
} from "@repo/ui/src/components";
import { AspectRatio } from "@repo/ui/src/components/aspect-ratio";
import Image from "next/image";
import ModelBadge from "../../components/characters/model-badge";
import {
  DialogOrDrawer,
  DialogOrDrawerContent,
  DialogOrDrawerDescription,
  DialogOrDrawerHeader,
  DialogOrDrawerTrigger,
} from "@repo/ui/src/components/dialog-or-drawer";
import { toast } from "sonner";
import {
  ClipboardIcon,
  Download,
  FilterX,
  Heart,
  Lock,
  Plus,
  Redo,
  Repeat,
} from "lucide-react";
import AgeRestriction from "../../components/characters/age-restriction";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { nFormatter } from "../lib/utils";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useStableQuery } from "../lib/hooks/use-stable-query";
import { Badge } from "@repo/ui/src/components/badge";
import useAllModels from "../lib/hooks/use-all-models";

const ImageDetail = (props: {
  prompt: string;
  imageUrl?: string;
  model?: any;
  isDraft?: boolean;
  isNSFW?: boolean;
  creatorId?: Id<"users">;
}) => {
  const creatorName = useStableQuery(api.users.getUsername, {
    id: props.creatorId as Id<"users">,
  });
  const modelData = useAllModels();
  const modelInfo =
    modelData?.find((item: any) => item.value === props.model) || {};

  const { t } = useTranslation();
  return (
    <DialogOrDrawerContent
      className="max-w-3xl"
      onOpenAutoFocus={(e: any) => e.preventDefault()}
    >
      {props?.isNSFW && <AgeRestriction />}
      <DialogOrDrawerHeader className="flex flex-col gap-4 lg:flex-row">
        {props.imageUrl && (
          <div className="flex h-full w-full flex-col items-center gap-2">
            <Image
              src={props.imageUrl}
              alt={props.prompt}
              width={300}
              height={525}
              quality={90}
              className="h-[15rem] w-[10rem] rounded-xl object-cover lg:h-full lg:w-full"
            />
          </div>
        )}
        <div className="flex w-full flex-col gap-8">
          <div className="flex w-full flex-col gap-2">
            Prompt
            <DialogOrDrawerDescription>
              {props?.prompt}
            </DialogOrDrawerDescription>
            <div className="grid w-full grid-cols-3 justify-between gap-2">
              <Tooltip content={"Create new image by remixing this image"}>
                <Link
                  href={`/images?prompt=${props.prompt}&model=${props.model}`}
                  className="w-full"
                >
                  <Button className="w-full gap-1" variant="outline">
                    <Repeat className="h-4 w-4" />
                    {t("Remix")}
                  </Button>
                </Link>
              </Tooltip>
              {!props?.isNSFW && (
                <Tooltip content={"Create character using this image"}>
                  <Link
                    href={`/my-characters/create?cardImageUrl=${props.imageUrl}&description=${props.prompt}`}
                    className="w-full"
                  >
                    <Button className="w-full gap-1" variant="outline">
                      <Plus className="h-4 w-4" />
                      {t("Character")}
                    </Button>
                  </Link>
                </Tooltip>
              )}
              {props.imageUrl && (
                <a
                  href={props.imageUrl}
                  download={true}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Button className="w-full gap-1" variant="outline">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </a>
              )}
            </div>
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
            <DialogOrDrawerDescription>
              {modelInfo.description || props.model}
            </DialogOrDrawerDescription>
          </div>
          <div className="flex w-full flex-col gap-2">
            Created by
            <DialogOrDrawerDescription>
              @{creatorName}
            </DialogOrDrawerDescription>
          </div>
        </div>
      </DialogOrDrawerHeader>
    </DialogOrDrawerContent>
  );
};

const ImageCard = (props: {
  id: string;
  prompt: string;
  imageUrl?: string;
  model?: any;
  isDraft?: boolean;
  isNSFW?: boolean;
  isLiked?: boolean;
  isPrivate?: boolean;
  numLikes?: number;
  creatorId?: Id<"users">;
}) => {
  const { t } = useTranslation();
  const like = useMutation(api.images.like);
  return (
    <DialogOrDrawer>
      <DialogOrDrawerTrigger>
        <AspectRatio
          ratio={1 / 1.75}
          className="group h-full w-full place-content-center overflow-hidden rounded-xl duration-200 hover:shadow-lg"
        >
          <Card className="flex h-full w-full items-end rounded-xl p-2">
            <div className="absolute top-4 z-[3] hover:z-[4]">
              {props?.isPrivate ? (
                <Tooltip content={"Private images are removed in 7 days."}>
                  <div>
                    <Badge
                      className="group/badge flex w-fit gap-1"
                      variant="model"
                    >
                      <Lock className="h-4 w-4 p-0.5 text-yellow-500" />
                    </Badge>
                  </div>
                </Tooltip>
              ) : (
                <ModelBadge modelName={props.model as string} />
              )}
            </div>

            <Tooltip content={"Create new image by remixing this image"}>
              <Link
                href={`/images?prompt=${props.prompt}&model=${props.model}`}
                className="absolute right-4 top-4 z-[4] hidden items-center group-hover:flex"
              >
                <Button
                  variant="outline"
                  className="h-5 rounded-full border-none text-xs md:text-[10px]"
                >
                  <Repeat className="h-3 w-3 p-0.5" />
                  {t("Remix")}
                </Button>
              </Link>
            </Tooltip>
            {props.imageUrl && (
              <>
                {props?.isNSFW ? (
                  <Image
                    src={props.imageUrl}
                    alt={""}
                    width={7.5}
                    height={13}
                    quality={25}
                    className="pointer-events-none absolute left-0 top-0 h-full w-full rounded-xl object-cover blur-md"
                  />
                ) : (
                  <Image
                    src={props.imageUrl}
                    alt={""}
                    width={300}
                    height={525}
                    quality={80}
                    className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-full rounded-xl object-cover"
                  />
                )}
              </>
            )}
            <CardHeader className="relative z-[2] w-full p-4">
              {props.imageUrl && (
                <div className="absolute -bottom-[9px] -left-[10px] h-[calc(100%+2rem)] w-[calc(100%+20px)] rounded-b-xl bg-gradient-to-b from-transparent via-black/30 to-black" />
              )}
              <CardTitle
                className={`${
                  props.imageUrl ? "text-white" : "text-foreground"
                } z-[3] line-clamp-1 flex select-none justify-between text-base duration-200 group-hover:opacity-80`}
              >
                <div className="flex gap-1 font-normal">
                  <div
                    className="group/like z-[3] flex items-center gap-0.5 rounded-full text-xs text-white duration-200 group-hover:opacity-80"
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      like({ imageId: props.id as Id<"images"> });
                    }}
                  >
                    {props.isLiked ? (
                      <Heart className="aspect-square h-5 w-5 fill-red-500 stroke-red-500 p-0.5 group-hover/like:fill-transparent group-hover/like:stroke-white" />
                    ) : (
                      <Heart className="aspect-square h-5 w-5 p-0.5 group-hover/like:fill-red-500 group-hover/like:stroke-red-500" />
                    )}
                    {nFormatter(props?.numLikes as number)}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        </AspectRatio>
      </DialogOrDrawerTrigger>
      <ImageDetail
        prompt={props?.prompt}
        imageUrl={props?.imageUrl}
        isNSFW={props?.isNSFW}
        model={props?.model}
        creatorId={props?.creatorId}
      />
    </DialogOrDrawer>
  );
};

export default ImageCard;
