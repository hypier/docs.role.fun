"use client";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../convex/_generated/api";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { Id } from "../convex/_generated/dataModel";
import { Switch } from "@repo/ui/src/components/switch";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import {
  BookMarked,
  Camera,
  CircleUserRound,
  ClipboardIcon,
  Delete,
  Headphones,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Repeat,
  Send,
  Share,
  Sparkles,
  StepForward,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useInView } from "framer-motion";
import { Button, InfoTooltip, Tooltip } from "@repo/ui/src/components";
import { CodeBlock } from "@repo/ui/src/components/codeblock";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/src/components/avatar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/src/components/popover";
import { useRouter, useSearchParams } from "next/navigation";
import { MemoizedReactMarkdown } from "./markdown";
import ModelBadge from "../components/characters/model-badge";
import { Crystal } from "@repo/ui/src/components/icons";
import Spinner from "@repo/ui/src/components/spinner";
import useMyUsername from "./lib/hooks/use-my-username";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@repo/ui/src/components/badge";
import { ConvexError } from "convex/values";
import { useCrystalDialog } from "./lib/hooks/use-crystal-dialog";
import { usePostHog } from "posthog-js/react";
import { useLanguage } from "./lang-select";
import { Label } from "@repo/ui/src/components/label";
import {
  useStablePaginatedQuery,
  useStableQuery,
} from "./lib/hooks/use-stable-query";
import { useVoiceOver } from "./lib/hooks/use-voice-over";

export const FormattedMessage = ({
  message,
  username,
}: {
  message: any;
  username?: string;
}) => {
  const { t } = useTranslation();
  const baseText = message?.text?.startsWith("Not enough crystals.")
    ? `${message?.text} [${t("Crystal Top-up")}](/crystals)`
    : message?.text;
  const translationText = message?.translation
    ? `${message?.translation} *[${message?.text.trim()}]*`
    : "";
  const textContent = translationText ? translationText : baseText;
  return (
    <MemoizedReactMarkdown
      className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 "
      remarkPlugins={[remarkGfm, remarkMath]}
      components={{
        a({ children, href, target, rel }) {
          return (
            <a href={href} rel={rel} target={target} className="underline">
              {children}
            </a>
          );
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>;
        },
        code({ node, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          return (
            <CodeBlock
              key={Math.random()}
              language={(match && match[1]) || ""}
              value={String(children).replace(/\n$/, "")}
              {...props}
            />
          );
        },
      }}
    >
      {textContent?.replaceAll("{{user}}", username)}
    </MemoizedReactMarkdown>
  );
};

export const Message = ({
  index,
  name,
  message,
  cardImageUrl,
  username = "You",
  chatId,
}: {
  index?: number;
  name: string;
  message: any;
  cardImageUrl: string;
  username?: string;
  chatId?: Id<"chats">;
}) => {
  const { t } = useTranslation();
  const regenerate = useMutation(api.messages.regenerate);
  const react = useMutation(api.messages.react);
  const speech = useMutation(api.speeches.generate);
  const imagine = useMutation(api.images.imagine);
  const posthog = usePostHog();
  const { playVoice, stopVoice, isVoicePlaying } = useVoiceOver();

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isImagining, setIsImagining] = useState(false);
  const [thinkingDots, setThinkingDots] = useState("");
  const [thinkingMessage, setThinkingMessage] = useState(t("Thinking"));
  const { openDialog } = useCrystalDialog();

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setThinkingDots((prevDots) => {
        if (prevDots.length < 3) {
          return prevDots + ".";
        } else {
          return "";
        }
      });
      if (Date.now() - startTime >= 3000) {
        setThinkingMessage(t("Warming up AI"));
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    message?.imageUrl && setIsImagining(false);
  }, [message?.imageUrl]);

  useEffect(() => {
    if (index === 0) playVoice();
  }, [index]);

  return (
    <div
      className={`flex flex-col gap-2 ${
        message?.characterId ? "self-start" : "self-end"
      }`}
    >
      <div
        className={`flex items-center gap-2 text-sm font-medium ${
          message?.characterId ? "justify-start" : "justify-end"
        }`}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage
            alt={`Character card of ${name}`}
            src={message?.characterId ? cardImageUrl : "undefined"}
            className="object-cover"
          />
          <AvatarFallback>
            {message?.characterId ? name[0] : username[0]}
          </AvatarFallback>
        </Avatar>
        {message?.characterId ? <>{name}</> : <>{username}</>}
      </div>
      {message?.text === "" ? (
        <div className="max-w-[20rem] animate-pulse whitespace-pre-wrap rounded-xl rounded-tr-none bg-muted px-3 py-2 md:max-w-[30rem] lg:max-w-[40rem]">
          {thinkingMessage}
          {thinkingDots}
        </div>
      ) : (
        <>
          <div className="relative max-w-[20rem] whitespace-pre-wrap rounded-xl rounded-tl-none bg-muted px-3 py-2 md:max-w-[30rem] lg:max-w-[40rem]">
            <FormattedMessage message={message} username={username} />
            {message?.characterId && chatId && !isRegenerating && (
              <div className="absolute -right-4 -top-4 lg:-right-2.5 lg:-top-2.5">
                <Tooltip
                  content={
                    <span className="flex gap-1 p-2 text-xs text-muted-foreground">
                      {t(`Selfie`)} ( <Crystal className="h-4 w-4" /> x 14 )
                    </span>
                  }
                  desktopOnly={true}
                >
                  <Button
                    className="h-8 w-8 rounded-full p-1 hover:bg-foreground/10 disabled:opacity-90 lg:h-6 lg:w-6"
                    variant="outline"
                    onClick={async () => {
                      setIsImagining(true);
                      try {
                        await imagine({
                          messageId: message?._id as Id<"messages">,
                        });
                        posthog.capture("imagine");
                      } catch (error) {
                        setIsImagining(false);
                        if (error instanceof ConvexError) {
                          openDialog();
                        } else {
                          toast.error("An unknown error occurred");
                        }
                      }
                    }}
                    disabled={message?.imageUrl || isImagining}
                  >
                    {isImagining ? (
                      <Spinner className="h-5 w-5 lg:h-4 lg:w-4" />
                    ) : (
                      <Camera className="h-5 w-5 lg:h-4 lg:w-4" />
                    )}
                  </Button>
                </Tooltip>
              </div>
            )}
          </div>

          {isImagining ? (
            <div className="relative h-[30rem] w-[20rem] rounded-lg bg-muted">
              <div className="absolute inset-0 m-auto flex flex-col items-center justify-center gap-2 text-sm">
                <Spinner />
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  {name} is taking selfie
                </div>
                <span className="w-[80%] text-center text-xs text-muted-foreground">
                  {t(
                    "This can take a bit of time if your request is in a queue or the model is booting up. When model is ready, image is generated within 30 seconds. When image generation is failed due to an unexpected error, your crystal will be automatically refunded.",
                  )}
                </span>
              </div>
            </div>
          ) : (
            message?.imageUrl && (
              <Image
                src={message.imageUrl}
                alt={message?.text}
                width={525}
                height={300}
                className="h-[30rem] w-[20rem] rounded-lg"
              />
            )
          )}
          {message?.characterId && chatId && !isRegenerating && (
            <div className="flex w-fit items-center justify-start rounded-full bg-foreground/10 p-1">
              <Tooltip
                content={
                  <span className="flex gap-1 p-2 text-xs text-muted-foreground">
                    {t("Copy message to clipboard")}
                  </span>
                }
                desktopOnly={true}
              >
                <Button
                  variant="ghost"
                  className="h-8 w-8 rounded-full p-1 hover:bg-foreground/10 disabled:opacity-90 lg:h-6 lg:w-6"
                  onClick={() => {
                    navigator.clipboard.writeText(message?.text);
                    toast.success("Message copied to clipboard");
                  }}
                >
                  <ClipboardIcon className="h-5 w-5 lg:h-4 lg:w-4" />
                </Button>
              </Tooltip>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full p-1 hover:bg-foreground/10 disabled:opacity-90 lg:h-6 lg:w-6"
                disabled={message?.reaction === "like"}
                onClick={async () => {
                  await react({
                    messageId: message?._id as Id<"messages">,
                    type: "like",
                  });
                }}
              >
                {message?.reaction === "like" ? (
                  <ThumbsUp className="h-6 w-6 text-green-500 lg:h-4 lg:w-4" />
                ) : (
                  <ThumbsUp className="h-5 w-5 lg:h-4 lg:w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full p-1 hover:bg-foreground/10 disabled:opacity-90 lg:h-6 lg:w-6"
                disabled={message?.reaction === "dislike"}
                onClick={async () => {
                  await react({
                    messageId: message?._id as Id<"messages">,
                    type: "dislike",
                  });
                  setIsRegenerating(true);
                  await regenerate({
                    messageId: message?._id as Id<"messages">,
                    chatId,
                    characterId: message?.characterId,
                  });
                  setIsRegenerating(false);
                }}
              >
                {isRegenerating ? (
                  <Spinner className="h-5 w-5 lg:h-4 lg:w-4" />
                ) : message?.reaction === "dislike" ? (
                  <ThumbsDown className="h-6 w-6 text-rose-500 lg:h-4 lg:w-4" />
                ) : (
                  <ThumbsDown className="h-5 w-5 lg:h-4 lg:w-4" />
                )}
              </Button>
              <Tooltip
                content={
                  <span className="flex gap-1 p-2 text-xs text-muted-foreground">
                    {t("Listen")} (<Crystal className="h-4 w-4" /> x 10 )
                  </span>
                }
                desktopOnly={true}
              >
                <Button
                  variant="ghost"
                  className="h-8 w-8 rounded-full p-1 hover:bg-foreground/10 disabled:opacity-90 lg:h-6 lg:w-6"
                  onClick={async () => {
                    if (isSpeaking) {
                      setIsSpeaking(false);
                    } else {
                      try {
                        await speech({
                          messageId: message?._id as Id<"messages">,
                          characterId: message?.characterId,
                          text: message?.translation
                            ? message?.translation
                            : message?.text,
                        });
                        setIsSpeaking(true);
                      } catch (error) {
                        setIsSpeaking(false);
                        if (error instanceof ConvexError) {
                          openDialog();
                        } else {
                          toast.error("An unknown error occurred");
                        }
                      }
                    }
                  }}
                >
                  {isSpeaking ? (
                    <Pause className="h-5 w-5 lg:h-4 lg:w-4" />
                  ) : (
                    <span className="flex w-full items-center justify-center gap-1">
                      <Headphones className="h-5 w-5 lg:h-4 lg:w-4" />
                    </span>
                  )}
                </Button>
              </Tooltip>

              {message?.speechUrl && (isSpeaking || isVoicePlaying) && (
                <audio
                  autoPlay
                  controls
                  hidden
                  onEnded={() => {
                    setIsSpeaking(false);
                    stopVoice();
                  }}
                >
                  <source src={message?.speechUrl} type="audio/mpeg" />
                </audio>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const Inspirations = ({
  chatId,
  characterId,
}: {
  chatId: Id<"chats">;
  characterId: Id<"characters">;
}) => {
  const { t } = useTranslation();
  const autopilot = useMutation(api.followUps.autopilot);
  return (
    <Tooltip
      content={
        <span className="flex gap-1 p-2 text-xs text-muted-foreground">
          <Crystal className="h-4 w-4" /> {t("Continue")}
        </span>
      }
      desktopOnly={true}
    >
      <Button
        variant="outline"
        onClick={() => {
          autopilot({ chatId, characterId });
        }}
        size="icon"
        type="button"
      >
        <Sparkles className="h-4 w-4" />
      </Button>
    </Tooltip>
  );
};

interface ChatOptionsPopoverProps {
  characterId: Id<"characters">;
  chatId: Id<"chats">;
  name: string;
}

const ChatOptionsPopover = ({
  characterId,
  chatId,
  name,
}: ChatOptionsPopoverProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const goBack = router.back;
  const remove = useMutation(api.chats.remove);
  const newChat = useMutation(api.chats.create);
  return (
    <Popover>
      <AlertDialog>
        <PopoverContent className="w-52 p-1">
          <Link
            href={`/my-characters/create${
              characterId ? `?remixId=${characterId}` : ""
            }`}
          >
            <Button
              variant="ghost"
              className="w-full justify-start gap-1 text-muted-foreground"
            >
              <Repeat className="h-4 w-4 p-0.5" />
              {t("Remix character")}
            </Button>
          </Link>
          <Link href={`/my-personas`}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-1 text-muted-foreground"
            >
              <CircleUserRound className="h-4 w-4 p-0.5" />
              <span className="w-40 truncate text-left">
                {t("Edit my persona")}
              </span>
            </Button>
          </Link>

          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-1 text-muted-foreground"
            >
              <Delete className="h-4 w-4 p-0.5" />
              <span className="w-40 truncate text-left">
                {" "}
                {t("Delete chat")}
              </span>
            </Button>
          </AlertDialogTrigger>
          <Button
            variant="ghost"
            className="w-full justify-start gap-1 text-muted-foreground"
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
            <Share className="h-4 w-4 p-0.5" />
            <span className="w-40 truncate text-left">
              {t("Share")} {name}
            </span>
          </Button>
        </PopoverContent>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Are you absolutely sure?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {`This action cannot be undone. This will permanently delete chat.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const promise = remove({
                  id: chatId as Id<"chats">,
                });
                toast.promise(promise, {
                  loading: "Deleting chat...",
                  success: () => {
                    goBack();
                    return `Chat has been deleted.`;
                  },
                  error: (error) => {
                    console.log("error:::", error);
                    return error
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
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
    </Popover>
  );
};

export function Dialog({
  name,
  model,
  cardImageUrl,
  chatId,
  characterId,
  isPublic,
}: {
  name: string;
  model: string;
  cardImageUrl?: string;
  chatId: Id<"chats">;
  characterId: Id<"characters">;
  isPublic?: boolean;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const create = useMutation(api.stories.create);
  const params = useSearchParams();
  const newChat = useMutation(api.chats.create);
  const urlChatId = params.get("chatId") as Id<"chats">;
  chatId = urlChatId ? urlChatId : chatId;
  const { results, loadMore } = useStablePaginatedQuery(
    api.messages.list,
    { chatId },
    { initialNumItems: 5 },
  );
  const { currentLanguage, autoTranslate, toggleAutoTranslate } = useLanguage();
  const remoteMessages = results.reverse();
  const messages = useMemo(
    () =>
      (
        [] as {
          characterId: Id<"characters">;
          text: string;
          _id: string;
        }[]
      ).concat(
        (remoteMessages ?? []) as {
          characterId: Id<"characters">;
          text: string;
          _id: string;
        }[],
      ),
    [remoteMessages, ""],
  );
  const username = useMyUsername();
  const sendMessage = useMutation(api.messages.send);
  const posthog = usePostHog();

  const followUps = useStableQuery(api.followUps.get, { chatId });
  const [isScrolled, setScrolled] = useState(false);
  const [input, setInput] = useState("");
  const { openDialog } = useCrystalDialog();

  const sendAndReset = async (input: string) => {
    setInput("");
    try {
      await sendMessage({ message: input, chatId, characterId });
      posthog.capture("send_message");
    } catch (error) {
      if (error instanceof ConvexError) {
        openDialog();
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };
  const handleSend = (event?: FormEvent) => {
    event && event.preventDefault();
    sendAndReset(input);
    setScrolled(false);
  };

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isScrolled) {
      return;
    }
    // Check if the device is mobile
    const isMobile = window.innerWidth <= 768;
    // Using `setTimeout` to make sure scrollTo works on button click in Chrome
    setTimeout(() => {
      if (isMobile) {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      } else {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 0);
  }, [messages, isScrolled]);
  const ref = useRef(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView && isScrolled) {
      loadMore(5);
    }
  }, [inView, loadMore]);

  const lastMessage = messages?.[messages.length - 1]?.text || "";
  const isLastMessageLoaded = lastMessage?.length > 0 ?? false;
  return (
    <div className="h-full w-full">
      {cardImageUrl && (
        <Image
          src={cardImageUrl}
          alt={`Character card of ${name}`}
          width={300}
          height={525}
          quality={60}
          className="pointer-events-none fixed left-0 top-16 -z-10 h-[100vh] w-[100vw] object-cover opacity-50 sm:hidden"
        />
      )}
      {chatId && (
        <div className="sticky top-0 flex h-12 w-full items-center justify-between border-b bg-background p-2 px-4 lg:rounded-t-lg lg:px-6">
          <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground lg:text-xs">
            <ModelBadge modelName={model as string} showCredits={true} />
            <Badge variant="model">
              <Headphones className="h-4 w-4 p-0.5" /> /
              <Crystal className="h-4 w-4 p-0.5" /> x 10
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <ChatOptionsPopover
              characterId={characterId}
              chatId={chatId}
              name={name}
            />
            <Button
              onClick={() => {
                const promise = newChat({
                  characterId,
                  isNew: true,
                });
                toast.promise(promise, {
                  loading: "Creating new chat...",
                  success: (chatId) => {
                    router.push(`/character/${characterId}?chatId=${chatId}`);
                    return `New chat has been created.`;
                  },
                  error: (error) => {
                    console.log("error:::", error);
                    return error
                      ? (error.data as { message: string })?.message
                      : "Unexpected error occurred";
                  },
                });
              }}
              className="flex h-8"
              variant="outline"
            >
              <Plus className="h-4 w-4 p-0.5" />
              <span className="hidden lg:inline"> {t("New chat")}</span>
            </Button>
          </div>
        </div>
      )}
      <div
        className={`flex h-full min-h-[60vh] flex-col overflow-y-auto lg:h-[calc(100%-12rem)] lg:min-h-fit`}
        ref={listRef}
        onWheel={() => {
          setScrolled(true);
        }}
      >
        {currentLanguage !== "en" && (
          <div className="flex w-full items-center justify-center pt-8">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <Label htmlFor="automatic-translation">
                  {t("Automatic translation")}
                </Label>
                <InfoTooltip
                  content={t(
                    "Crystal is used when you send message and character answers.",
                  )}
                />
              </div>
              <Switch
                id="automatic-translation"
                value={autoTranslate}
                onCheckedChange={() => toggleAutoTranslate()}
              />
            </div>
          </div>
        )}
        <div
          className="mx-2 flex h-fit flex-col gap-8 rounded-lg p-4"
          ref={listRef}
          onWheel={() => {
            setScrolled(true);
          }}
        >
          <div ref={ref} />
          {remoteMessages === undefined ? (
            <>
              <div className="h-5 animate-pulse rounded-md bg-black/10" />
              <div className="h-9 animate-pulse rounded-md bg-black/10" />
            </>
          ) : (
            messages.map((message, i) => (
              <Message
                index={i}
                key={message._id}
                name={name}
                message={message}
                cardImageUrl={cardImageUrl as string}
                username={(username as string) || "You"}
                chatId={chatId}
              />
            ))
          )}
        </div>
        {followUps && !followUps?.isStale && isLastMessageLoaded && (
          <div className="mb-4 flex w-full flex-col justify-center gap-4 px-6">
            {followUps?.followUp1 &&
              followUps?.followUp1 !== "Tell me more" && (
                <Button
                  onClick={() => {
                    sendAndReset(followUps?.followUp1 as string);
                    setScrolled(false);
                  }}
                  variant="outline"
                  className="flex w-fit gap-1 rounded-full p-2 text-left"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="w-fit max-w-80 truncate lg:max-w-screen-sm">
                    {followUps.followUp1}
                  </span>
                </Button>
              )}
            {followUps?.followUp2 &&
              followUps?.followUp2 !== "Tell me more" && (
                <Button
                  onClick={() => {
                    sendAndReset(followUps?.followUp2 as string);
                    setScrolled(false);
                  }}
                  variant="outline"
                  className="flex w-fit gap-1 rounded-full p-2 text-left"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="w-fit max-w-80 truncate lg:max-w-screen-sm">
                    {followUps.followUp2}
                  </span>
                </Button>
              )}
            {followUps?.followUp3 &&
              followUps?.followUp3 !== "Tell me more" && (
                <Button
                  onClick={() => {
                    sendAndReset(followUps?.followUp3 as string);
                    setScrolled(false);
                  }}
                  variant="outline"
                  className="flex w-fit gap-1 rounded-full p-2 text-left"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="w-fit max-w-80 truncate lg:max-w-screen-sm">
                    {followUps.followUp3}
                  </span>
                </Button>
              )}
            {!followUps?.followUp2 && (
              <Button
                onClick={() => {
                  sendAndReset("Tell me more");
                  setScrolled(false);
                }}
                variant="outline"
                className="flex w-fit gap-1 rounded-full p-2 text-left"
              >
                <StepForward className="h-4 w-4" />
                <span className="w-fit truncate">{t("Tell me more")}</span>
              </Button>
            )}
          </div>
        )}
      </div>
      <form
        className="fixed bottom-0 z-50 flex h-24 min-h-fit w-full flex-col items-center border-0 border-t-[1px] border-solid bg-background lg:sticky lg:rounded-br-lg"
        onSubmit={(event) => void handleSend(event)}
      >
        <div className="flex w-full items-center justify-center gap-4 px-4">
          <input
            className="my-3 w-full border-none bg-background !text-base focus-visible:ring-0"
            style={{
              fontSize: "1rem",
              lineHeight: "1.5rem",
            }}
            autoFocus
            name="message"
            placeholder="Send a message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <Button disabled={input === ""} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
