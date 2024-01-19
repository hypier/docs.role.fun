"use client";
import { usePaginatedQuery, useQuery } from "convex/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import useCurrentUser from "../../../lib/hooks/use-current-user";
import SignInDialog from "../../../../components/user/sign-in-dialog";
import { Story } from "../story/[storyId]/story";
import CharacterCardPlaceholder from "../../../../components/cards/character-card-placeholder";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

export const StoriesGrid = ({
  characterId,
}: {
  characterId: Id<"characters">;
}) => {
  const { t } = useTranslation();
  const character = useQuery(api.characters.get, {
    id: characterId,
  });
  const creatorName = useQuery(api.users.getUsername, {
    id: character?.creatorId as Id<"users">,
  });

  const { results, status, loadMore } = usePaginatedQuery(
    api.stories.list,
    { characterId: characterId },
    { initialNumItems: 10 },
  );
  const ref = useRef(null);
  const inView = useInView(ref);
  const me = useCurrentUser();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  useEffect(() => {
    if (inView) {
      if (!me?.name) {
        setIsSignInModalOpen(true);
      } else {
        loadMore(10);
      }
    }
  }, [inView, loadMore]);

  return (
    <section className="flex flex-col gap-4 lg:gap-8">
      <SignInDialog
        isOpen={isSignInModalOpen}
        setIsOpen={setIsSignInModalOpen}
      />
      <div className="flex flex-col gap-1 px-4 font-medium lg:px-0">
        <div>Stories of {character?.name}</div>
        <div className="font-normal text-muted-foreground">
          {character?.description}, created by @{creatorName}
        </div>
      </div>
      <div className="flex w-full grid-cols-2 flex-col gap-4 px-4 sm:grid md:grid-cols-3 lg:pl-0 xl:grid-cols-4 2xl:grid-cols-5">
        {results?.length > 0
          ? results.map((story, i) => (
              <Link
                href={`/character/${story.characterId}/story/${story._id}`}
                onClick={(e) => e.stopPropagation()}
                className={`h-[32rem] overflow-hidden rounded-lg border duration-200 hover:shadow-lg ${
                  story.isNSFW ? "blur-md" : ""
                }`}
              >
                <Story
                  isCard={true}
                  storyId={story._id}
                  characterId={story.characterId}
                />
              </Link>
            ))
          : Array.from({ length: 10 }).map((_, index) => (
              <CharacterCardPlaceholder key={index} />
            ))}
        {status === "LoadingMore" &&
          Array.from({ length: 10 }).map((_, index) => (
            <CharacterCardPlaceholder key={index} />
          ))}
        <div ref={ref} />
      </div>
    </section>
  );
};
