import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
} from "@repo/ui/src/components/carousel";
import { useTranslation } from "react-i18next";
import { FadeInOut } from "../../app/lib/utils";
import { ChevronRight } from "lucide-react";
import {
  useStablePaginatedQuery,
  useStableQuery,
} from "../../app/lib/hooks/use-stable-query";
import { Authenticated, useConvexAuth } from "convex/react";
import useMediaQuery from "@repo/ui/src/hooks/use-media-query";

export const Chat = ({
  name,
  chatId,
  characterId,
}: {
  name: string;
  chatId: Id<"chats">;
  characterId: Id<"characters">;
}) => {
  const { isAuthenticated } = useConvexAuth();
  const character = useStableQuery(
    api.characters.get,
    isAuthenticated
      ? {
          id: characterId as Id<"characters">,
        }
      : "skip",
  );
  const message = useStableQuery(
    api.messages.mostRecentMessage,
    isAuthenticated
      ? {
          chatId,
        }
      : "skip",
  );
  return (
    <Link href={`/character/${characterId}?chatId=${chatId}`}>
      <div className="flex flex-col items-start justify-start overflow-hidden">
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
            <h2 className="w-32 truncate text-lg font-medium lg:w-64">
              {name ? name : character?.name ? character?.name : "Loading"}
            </h2>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground lg:line-clamp-3">
            {message?.translation
              ? message?.translation
              : message?.text
                ? message?.text
                : "Click here to chat."}
          </p>
        </div>
      </div>
    </Link>
  );
};

export function MainChats() {
  const { t } = useTranslation();
  const { results } = useStablePaginatedQuery(
    api.chats.list,
    {},
    { initialNumItems: 3 },
  );
  const [_api, setApi] = useState<CarouselApi>();
  const { isDesktop } = useMediaQuery();
  if (!isDesktop) return;
  return (
    <AnimatePresence>
      {results?.length > 0 && (
        <motion.div {...FadeInOut} className="flex flex-col gap-4">
          <div className="flex items-center gap-1 px-4 py-4 font-medium lg:mt-2 lg:px-0 lg:py-0">
            <Link href="/chats" className="flex items-center gap-1">
              {t("Continue chat")}
              <Button variant="ghost" size="icon">
                <ChevronRight />
              </Button>
            </Link>
          </div>

          <div className="relative flex place-content-center lg:justify-start lg:py-0">
            <Carousel
              className="w-[75%] md:w-[80%] lg:w-[calc(80%+8rem)]"
              setApi={setApi}
            >
              <CarouselContent className="w-full">
                {results.map((chat) => (
                  <CarouselItem
                    className="group ml-4 basis-1/2 rounded-xl border border-b-2 bg-background p-4 lg:basis-1/3"
                    key={chat._id}
                  >
                    <Authenticated>
                      <Chat
                        name={chat.chatName as string}
                        characterId={chat.characterId as Id<"characters">}
                        chatId={chat._id as Id<"chats">}
                      />
                    </Authenticated>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
