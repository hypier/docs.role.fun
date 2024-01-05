"use client";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../convex/_generated/api";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { Id } from "../convex/_generated/dataModel";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { MoreHorizontal, Plus, Send, Sparkles } from "lucide-react";
import { useInView } from "framer-motion";
import { Button, Tooltip } from "@repo/ui/src/components";
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
import { useRouter } from "next/navigation";
import { MemoizedReactMarkdown } from "./markdown";
import ModelBadge from "../components/characters/model-badge";
import { Crystal } from "@repo/ui/src/components/icons";
import { Separator } from "@repo/ui/src/components/separator";
import Spinner from "@repo/ui/src/components/spinner";

export const Message = ({
  name,
  message,
  cardImageUrl,
}: {
  name: string;
  message: any;
  cardImageUrl: string;
}) => {
  return (
    <div
      key={message._id}
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
            {message?.characterId ? name[0] : "Y"}
          </AvatarFallback>
        </Avatar>
        {message?.characterId ? <>{name}</> : <>You</>}
      </div>
      {message.text === "" ? (
        <div
          className={
            "max-w-[20rem] animate-pulse whitespace-pre-wrap rounded-xl px-3 py-2 md:max-w-[30rem] lg:max-w-[40rem]" +
            (message?.characterId
              ? " rounded-tl-none bg-muted "
              : " rounded-tr-none bg-foreground text-muted ")
          }
        >
          Thinking...
        </div>
      ) : (
        <div
          className={
            "max-w-[20rem] whitespace-pre-wrap rounded-xl px-3 py-2 md:max-w-[30rem] lg:max-w-[40rem]" +
            (message?.characterId
              ? " rounded-tl-none bg-muted "
              : " rounded-tr-none bg-foreground text-muted ")
          }
        >
          <MemoizedReactMarkdown
            className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 break-words"
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
              a({ children, href, target, rel }) {
                return (
                  <a
                    href={href}
                    rel={rel}
                    target={target}
                    className="underline duration-200 hover:opacity-50"
                  >
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
            {message?.text?.startsWith("Not enough crystals.")
              ? `${message.text} [Visit Shop](/shop)`
              : message.text}
          </MemoizedReactMarkdown>
        </div>
      )}
    </div>
  );
};

export const Inspirations = ({
  inspirations,
  setIsGeneratingInspiration,
  generateInspiration,
  sendAndReset,
  chatId,
  characterId,
  isGeneratingInspiration,
}: {
  inspirations: any;
  setIsGeneratingInspiration: any;
  generateInspiration: any;
  sendAndReset: any;
  chatId: Id<"chats">;
  characterId: Id<"characters">;
  isGeneratingInspiration: boolean;
}) => {
  return (
    <div className="flex max-h-36 w-full flex-wrap items-center gap-1 overflow-y-clip overflow-x-scroll bg-background/90 p-4 text-xs backdrop-blur-md scrollbar-hide">
      <Tooltip
        content={
          <span className="flex gap-1 p-2 text-xs text-muted-foreground">
            <Crystal className="h-4 w-4" /> x 1
          </span>
        }
        desktopOnly={true}
      >
        <Button
          variant="ghost"
          onClick={() => {
            setIsGeneratingInspiration(true);
            generateInspiration({ chatId, characterId });
          }}
          className="gap-1"
          size="xs"
          disabled={isGeneratingInspiration}
          type="button"
        >
          {isGeneratingInspiration ? (
            <>
              <Spinner />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 p-1" />
              Inspire
            </>
          )}
        </Button>
      </Tooltip>
      {inspirations && !inspirations?.isStale && (
        <>
          <Separator className="w-8" />
          {inspirations?.followUp1 && inspirations.followUp1?.length > 0 && (
            <Button
              variant="outline"
              size="xs"
              className="rounded-full px-2 font-normal"
              onClick={() => {
                sendAndReset(inspirations?.followUp1 as string);
              }}
              type="button"
            >
              {inspirations?.followUp1}
            </Button>
          )}
          {inspirations?.followUp2 && inspirations.followUp2?.length > 0 && (
            <Button
              variant="outline"
              size="xs"
              className="rounded-full px-2 font-normal"
              onClick={() => {
                sendAndReset(inspirations?.followUp2 as string);
              }}
              type="button"
            >
              {inspirations?.followUp2}
            </Button>
          )}
          {inspirations?.followUp3 && inspirations.followUp3?.length > 0 && (
            <Button
              variant="outline"
              size="xs"
              className="rounded-full px-2 font-normal"
              onClick={() => {
                sendAndReset(inspirations?.followUp3 as string);
              }}
              type="button"
            >
              {inspirations?.followUp3}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export function Dialog({
  name,
  model,
  cardImageUrl,
  chatId,
  characterId,
}: {
  name: string;
  model: string;
  cardImageUrl?: string;
  chatId: Id<"chats">;
  characterId: Id<"characters">;
}) {
  const router = useRouter();
  const goBack = router.back;
  const remove = useMutation(api.chats.remove);
  const create = useMutation(api.stories.create);
  const { results, loadMore } = usePaginatedQuery(
    api.messages.list,
    { chatId },
    { initialNumItems: 5 },
  );
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
  const sendMessage = useMutation(api.messages.send);
  const generateInspiration = useMutation(api.followUps.generate);
  const inspirations = useQuery(api.followUps.get, {
    chatId,
  });

  const [isGeneratingInspiration, setIsGeneratingInspiration] = useState(false);
  const [isScrolled, setScrolled] = useState(false);
  const [input, setInput] = useState("");

  const sendAndReset = (input: string) => {
    sendMessage({ message: input, chatId, characterId });
    setInput("");
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
    // Using `setTimeout` to make sure scrollTo works on button click in Chrome
    setTimeout(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 0);
  }, [messages, isScrolled]);

  useEffect(() => {
    inspirations && setIsGeneratingInspiration(false);
  }, [inspirations]);

  const ref = useRef(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView && isScrolled) {
      loadMore(10);
    }
  }, [inView, loadMore]);

  return (
    <div className="h-full w-full">
      {chatId && (
        <div className="sticky top-0 flex h-12 w-full items-center justify-between rounded-t-lg border-b bg-background p-2 px-6">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <ModelBadge modelName={model as string} showCredits={true} />
            AI can make mistakes.
          </div>
          <div className="flex items-center gap-1">
            <Popover>
              <AlertDialog>
                <AlertDialogTrigger>
                  <PopoverContent asChild>
                    <Button variant="ghost" className="text-muted-foreground">
                      Delete Chat
                    </Button>
                  </PopoverContent>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {`This action cannot be undone. This will permanently delete chat.`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="h-8 gap-1">
                  <Plus className="h-4 w-4" />
                  Create story
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Create a story</AlertDialogTitle>
                  <AlertDialogDescription>
                    {`Anyone will be able to see the story. Messages you send after creating your link won't be shared.`}
                  </AlertDialogDescription>
                  <div className="flex h-72 flex-col gap-4 overflow-y-scroll rounded-lg border p-4 shadow-lg scrollbar-hide">
                    {messages.map((message, i) => (
                      <Message
                        key={message._id}
                        name={name}
                        message={message}
                        cardImageUrl={cardImageUrl as string}
                      />
                    ))}
                  </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      const promise = create({
                        characterId: characterId as Id<"characters">,
                        messageIds: messages
                          .slice(1)
                          .map((message) => message._id as Id<"messages">),
                      });
                      toast.promise(promise, {
                        loading: "Creating story...",
                        success: (storyId) => {
                          router.push(
                            `/character/${characterId}/story/${storyId}`,
                          );
                          if (navigator?.clipboard) {
                            navigator.clipboard.writeText(
                              document.location.href,
                            );
                            toast.success("Link copied to clipboard");
                          }
                          return `Story has been created.`;
                        },
                        error: (error) => {
                          return error?.data
                            ? (error.data as { message: string })?.message
                            : "Unexpected error occurred";
                        },
                      });
                    }}
                  >
                    Create
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
      <div
        className={`flex flex-col ${
          inspirations?.followUp3 && !inspirations?.isStale
            ? "lg:h-[calc(100%-16rem)]"
            : "lg:h-[calc(100%-12rem)]"
        } h-full overflow-y-auto`}
      >
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
                name={name}
                message={message}
                cardImageUrl={cardImageUrl as string}
              />
            ))
          )}
        </div>
      </div>
      <form
        className="sticky bottom-16 flex min-h-fit w-full flex-col items-center rounded-br-lg border-0 border-t-[1px] border-solid bg-background lg:bottom-0"
        onSubmit={(event) => void handleSend(event)}
      >
        <Inspirations
          inspirations={inspirations}
          setIsGeneratingInspiration={setIsGeneratingInspiration}
          generateInspiration={generateInspiration}
          sendAndReset={sendAndReset}
          chatId={chatId}
          characterId={characterId}
          isGeneratingInspiration={isGeneratingInspiration}
        />
        <div className="flex w-full">
          <input
            className="my-3 ml-4 w-full border-none bg-background focus-visible:ring-0"
            autoFocus
            name="message"
            placeholder="Send a message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <Button disabled={input === ""} variant="ghost" className="my-3 mr-4">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
