"use client";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tooltip,
} from "@repo/ui/src/components";
import Image from "next/image";
import { Dialog } from "../../dialog";
import Spinner from "@repo/ui/src/components/spinner";
import useStoreChatEffect from "../../lib/hooks/use-store-chat-effect";
import { MessagesSquare, Share } from "lucide-react";
import { FadeInOut, nFormatter } from "../../lib/utils";
import { SignIn, useUser } from "@clerk/nextjs";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui/src/components/drawer";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Story } from "./story/[storyId]/story";
import { useSearchParams } from "next/navigation";

export default function ChatWithCharacter({
  params,
}: {
  params: { id: string; storyId?: string };
}) {
  const { user } = useUser();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const data = useQuery(api.characters.get, {
    id: params.id as Id<"characters">,
  });
  const creatorName = useQuery(api.users.getUsername, {
    id: data?.creatorId as Id<"users">,
  });
  const searchParams = useSearchParams();
  const urlChatId = searchParams.get("chatId");
  const { chatId, isUnlocked } = useStoreChatEffect(
    params.id as Id<"characters">,
    params.storyId ? (params.storyId as Id<"stories">) : undefined,
    urlChatId as Id<"chats">,
  );
  return (
    <div className="flex w-full flex-col justify-self-start lg:pr-6">
      <Card className="flex h-full w-full flex-col border-transparent shadow-none lg:h-[42rem] lg:flex-row lg:border-border lg:shadow-xl xl:h-[50rem]">
        <Drawer>
          <DrawerTrigger asChild>
            <CardHeader className="relative cursor-pointer justify-end rounded-l-lg border-b lg:h-[calc(42rem-1px)] lg:w-96 lg:border-r xl:h-[calc(50rem-1px)]">
              {data?.cardImageUrl && (
                <Image
                  src={data.cardImageUrl}
                  alt={`Character card of ${data?.name}`}
                  width={300}
                  height={525}
                  quality={60}
                  className="pointer-events-none absolute left-0 top-0 h-full w-full object-cover lg:rounded-l-lg"
                />
              )}
              {data?.cardImageUrl && (
                <div className="absolute -bottom-0 -left-0 h-full w-full bg-gradient-to-b from-transparent to-black/75 lg:rounded-l-lg" />
              )}
              <CardTitle
                className={`${
                  data?.cardImageUrl ? "text-white" : "text-foreground"
                } z-[1] flex justify-between text-xl`}
              >
                <div className="w-[80%] truncate">{data?.name}</div>
                <Tooltip content={`Number of chats with ${data?.name}`}>
                  <div className="z-[3] flex items-center gap-0.5 rounded-full text-xs text-white duration-200 group-hover:opacity-80">
                    <MessagesSquare className="aspect-square h-5 w-5 p-1" />
                    {nFormatter(data?.numChats as number)}
                  </div>
                </Tooltip>
              </CardTitle>
              <p
                className={`${
                  data?.cardImageUrl ? "text-white" : "text-foreground"
                } z-[1] line-clamp-3 text-sm hover:line-clamp-none lg:line-clamp-5`}
              >
                {data?.description}
              </p>
              {creatorName && (
                <div className="flex items-center justify-between">
                  <p
                    className={`${
                      data?.cardImageUrl
                        ? "text-muted dark:text-gray-500"
                        : "text-muted-foreground"
                    } z-[1] line-clamp-3 text-xs hover:line-clamp-none lg:line-clamp-5`}
                  >
                    Created by @{creatorName}
                  </p>
                  <Button
                    className="z-10 text-white"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (navigator.share) {
                        navigator.share({
                          title: document.title,
                          url: document.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(document.location.href);
                        toast.success("Link copied to clipboard");
                      }
                    }}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{data?.name}</DrawerTitle>
              <DrawerDescription>{`${data?.description}, created by @${creatorName}`}</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <CardContent className="h-full w-full p-0">
          {params.storyId && !isUnlocked ? (
            <Story
              name={data?.name as string}
              storyId={params.storyId as Id<"stories">}
              chatId={chatId ? chatId : undefined}
              cardImageUrl={data?.cardImageUrl}
            />
          ) : chatId ? (
            <Dialog
              name={data?.name as string}
              welcomeMessage={
                data?.greetings ? (data.greetings[0] as string) : undefined
              }
              model={data?.model as string}
              chatId={chatId}
              characterId={data?._id as any}
              cardImageUrl={data?.cardImageUrl}
            />
          ) : isAuthenticated && !isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="flex h-full min-h-[60vh] w-full flex-col items-center justify-center gap-8 lg:min-h-fit">
              <AnimatePresence>
                {data?.name && (
                  <motion.span
                    {...FadeInOut}
                    className="font-medium"
                  >{`Sign in and start chat with ${data?.name}`}</motion.span>
                )}
              </AnimatePresence>
              {!user && <SignIn />}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
