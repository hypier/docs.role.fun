import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
} from "@repo/ui/src/components";
import { AspectRatio } from "@repo/ui/src/components/aspect-ratio";
import { BookMarked, MessagesSquare, Repeat } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { nFormatter } from "../../app/lib/utils";
import ModelBadge from "../characters/model-badge";
import DraftBadge from "../characters/draft-badge";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useTranslation } from "react-i18next";

const CharacterCard = (props: {
  id: string;
  name: any;
  description: any;
  numChats?: number;
  cardImageUrl?: string;
  model?: any;
  isDraft?: boolean;
  showEdit?: any;
  showRemix?: boolean;
}) => {
  const { t } = useTranslation();
  const numStories = useQuery(api.stories.count, {
    characterId: props.id as Id<"characters">,
  });
  return (
    <AspectRatio
      ratio={1 / 1.75}
      className="group h-full w-full place-content-center rounded-lg duration-200 hover:shadow-lg"
    >
      <Link href={`/character/${props?.id}`}>
        <Card className="flex h-full w-full items-end rounded-lg p-2">
          {props.showEdit && (
            <Link
              href={`/my-characters/create${props.id ? `?id=${props.id}` : ""}${
                props.model ? `&model=${props.model}` : ""
              }`}
              className="absolute right-4 top-4 z-[4] hidden items-center group-hover:flex"
            >
              <Button
                variant="outline"
                className="h-5 rounded-full border-none text-xs md:text-[10px]"
              >
                {t("Edit")}
              </Button>
            </Link>
          )}
          {props.showRemix && (
            <Tooltip
              content={
                <TooltipContent
                  title={"Create new character by remixing this character"}
                />
              }
            >
              <Link
                href={`/my-characters/create${
                  props.id ? `?remixId=${props.id}` : ""
                }`}
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
          )}
          <div className="absolute top-4 z-[3] hover:z-[4]">
            <ModelBadge modelName={props.model as string} />
          </div>
          <CardHeader className="relative z-[2] w-full p-4">
            {props.cardImageUrl && (
              <div className="absolute -bottom-[9px] -left-[10px] h-[calc(100%+2rem)] w-[calc(100%+20px)] rounded-b-lg bg-gradient-to-b from-transparent via-black/60 to-black" />
            )}
            <CardTitle
              className={`${
                props.cardImageUrl ? "text-white" : "text-foreground"
              } z-[3] line-clamp-1 flex select-none justify-between text-base duration-200 group-hover:opacity-80`}
            >
              <div className="w-[80%] truncate">{props.name}</div>
              <div className="flex gap-1 font-normal">
                {(props?.numChats as number) > 0 && (
                  <Tooltip content={`Number of chats with ${props.name}`}>
                    <div className="z-[3] flex items-center gap-0.5 rounded-full text-xs text-white duration-200 group-hover:opacity-80">
                      <MessagesSquare className="aspect-square h-5 w-5 p-1" />
                      {nFormatter(props?.numChats as number)}
                    </div>
                  </Tooltip>
                )}
                {(numStories as number) > 0 && (
                  <Tooltip
                    content={`Number of stories made with ${props.name}`}
                  >
                    <div className="z-[3] flex items-center gap-0.5 rounded-full text-xs text-white duration-200 group-hover:opacity-80">
                      <BookMarked className="aspect-square h-5 w-5 p-1" />
                      {nFormatter(numStories as number)}
                    </div>
                  </Tooltip>
                )}
              </div>
              {props.isDraft && <DraftBadge />}
            </CardTitle>
            <CardDescription
              className={`${
                props.cardImageUrl ? "text-white" : "text-foreground"
              } z-[3] line-clamp-2 select-none text-xs duration-200 hover:line-clamp-none group-hover:opacity-80`}
            >
              {props.description}
            </CardDescription>
          </CardHeader>
          {props.cardImageUrl && (
            <Image
              src={props.cardImageUrl}
              alt={""}
              width={300}
              height={525}
              quality={60}
              className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-full rounded-lg object-cover"
            />
          )}
        </Card>
      </Link>
    </AspectRatio>
  );
};

export default CharacterCard;
