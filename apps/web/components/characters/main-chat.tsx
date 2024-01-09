import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import Link from "next/link";
import { Button } from "@repo/ui/src/components";
import { Id } from "../../convex/_generated/dataModel";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/src/components/avatar";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/src/components/carousel";
import { useTranslation } from "react-i18next";

export const Chat = ({
  name,
  time,
  chatId,
  characterId,
}: {
  name: string;
  time: string;
  chatId: Id<"chats">;
  characterId: Id<"characters">;
}) => {
  const character = useQuery(api.characters.get, {
    id: characterId as Id<"characters">,
  });
  const message = useQuery(api.messages.mostRecentMessage, {
    chatId,
  });
  const recentMessageAt = message?._creationTime
    ? (message?._creationTime as number)
    : time;
  return (
    <Link href={`/character/${characterId}?chatId=${chatId}`}>
      <div className="flex flex-col items-start justify-start">
        <Avatar>
          <AvatarImage
            alt={`preview of chat ${name}`}
            src={character?.cardImageUrl}
            className="object-cover"
            width={300}
            height={525}
          />
          <AvatarFallback>
            {name ? name : character?.name?.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 duration-200 group-hover:opacity-75">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">
              {name ? name : character?.name ? character?.name : "Loading"}
            </h2>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground lg:line-clamp-3">
            {message?.text ? message?.text : "Click here to chat."}
          </p>
        </div>
      </div>
    </Link>
  );
};

export function MainChats() {
  const { t } = useTranslation();
  const { results } = usePaginatedQuery(
    api.chats.list,
    {},
    { initialNumItems: 10 },
  );
  const [_api, setApi] = useState<CarouselApi>();
  return (
    <>
      {results?.length && (
        <>
          <div className="flex items-center gap-1 px-4 font-medium lg:mt-2 lg:px-0">
            {t("Continue chat")}
          </div>
          <div className="border-y py-4 lg:w-[90%] lg:border-none lg:py-0">
            <Carousel
              className="3xl:max-w-screen-2xl mx-12 max-w-xs sm:max-w-sm md:max-w-screen-xl"
              setApi={setApi}
            >
              <CarouselContent className="w-full">
                {results.map((chat) => (
                  <CarouselItem className="group m-4 basis-1/2 rounded-lg border bg-background p-4 sm:basis-1/3 md:basis-1/6">
                    <Chat
                      name={chat.chatName as string}
                      time={chat.updatedAt}
                      characterId={chat.characterId as Id<"characters">}
                      chatId={chat._id as Id<"chats">}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious variant="ghost" />
              <CarouselNext variant="ghost" />
            </Carousel>
          </div>
        </>
      )}
    </>
  );
}
