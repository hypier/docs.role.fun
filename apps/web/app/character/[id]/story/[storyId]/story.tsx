import { Id } from "../../../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Message } from "../../../../dialog";
import { Button } from "@repo/ui/src/components";
import { toast } from "sonner";
import Link from "next/link";

export function Story({
  name,
  cardImageUrl,
  storyId,
  chatId,
}: {
  name: string;
  cardImageUrl?: string;
  storyId: Id<"stories">;
  chatId?: Id<"chats">;
}) {
  const messages = useQuery(api.stories.messages, { storyId });
  const unlock = useMutation(api.stories.unlock);
  return (
    <div className="relative h-full w-full">
      <div className={`flex h-full flex-col overflow-y-auto`}>
        <div className="mx-2 flex h-full flex-col justify-between gap-8 rounded-lg p-4">
          <div className="flex flex-col gap-8">
            {messages?.map((message, i) => (
              <Message
                name={name}
                message={message}
                cardImageUrl={cardImageUrl as string}
              />
            ))}
          </div>
          {chatId ? (
            <Button
              className="mx-auto w-fit"
              onClick={() => {
                const promise = unlock({ chatId, storyId });
                toast.promise(promise, {
                  loading: "Unlocking story...",
                  success: () => {
                    return `Chat has unlocked.`;
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
              Continue this story
            </Button>
          ) : (
            <Link href="/sign-in" className="mx-auto">
              <Button className="w-fit">Continue this story</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
