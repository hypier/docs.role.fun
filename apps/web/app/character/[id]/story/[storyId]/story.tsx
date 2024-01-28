import { Id } from "../../../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Message } from "../../../../dialog";
import { Button } from "@repo/ui/src/components";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import Spinner from "@repo/ui/src/components/spinner";
import { useNsfwPreference } from "../../../../lib/hooks/use-nsfw-preference";
import { useStableQuery } from "../../../../lib/hooks/use-stable-query";
import { useTranslation } from "react-i18next";
import { Crystal } from "@repo/ui/src/components/icons";

export function Story({
  name = "",
  cardImageUrl,
  storyId,
  chatId,
  characterId,
  isCard,
  isNSFW,
}: {
  name?: string;
  cardImageUrl?: string;
  storyId: Id<"stories">;
  chatId?: Id<"chats">;
  characterId?: Id<"characters">;
  isCard?: boolean;
  isNSFW?: boolean;
}) {
  const { t } = useTranslation();
  const character = useStableQuery(
    api.characters.get,
    characterId ? { id: characterId } : "skip",
  );
  const messages = useStableQuery(api.stories.messages, { storyId });
  const creatorName = useStableQuery(api.stories.creatorName, { storyId });
  const unlock = useMutation(api.stories.unlock);
  const { nsfwPreference } = useNsfwPreference();

  return (
    <div className="relative h-full w-full">
      {character?.cardImageUrl && (
        <Image
          src={character.cardImageUrl}
          fill={true}
          className={`-z-10 object-cover opacity-10 duration-200 group-hover:opacity-50 ${
            isNSFW && nsfwPreference !== "allow" ? "blur-md" : ""
          }`}
          alt="image of character"
        />
      )}
      <div className={`flex h-full flex-col overflow-y-auto scrollbar-hide`}>
        <div className="mx-2 flex h-full flex-col justify-between gap-8 rounded-lg p-4">
          <div
            className={`flex flex-col gap-8
${isNSFW && nsfwPreference !== "allow" ? "blur-md" : ""}
          `}
          >
            {messages && messages?.length > 0 ? (
              messages?.map((message, i) => (
                <Message
                  key={message?._id}
                  name={name || (character?.name as string)}
                  message={message}
                  username={creatorName || "You"}
                  cardImageUrl={
                    (cardImageUrl as string) ||
                    (character?.cardImageUrl as string)
                  }
                />
              ))
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Spinner />
              </div>
            )}
          </div>
          {messages && !isCard && (
            <div className="mx-auto pb-20 lg:pb-8">
              {chatId ? (
                <Button
                  className="w-fit gap-1"
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
                  {t("Unlock this story")}
                  <span className="flex items-center">
                    <Crystal className="h-4 w-4" /> x {messages?.length}
                  </span>
                </Button>
              ) : (
                <Link href="/sign-in" className="mx-auto">
                  <Button className="w-fit">{t("Unlock this story")}</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
