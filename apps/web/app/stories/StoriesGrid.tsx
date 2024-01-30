"use client";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { Story } from "../../app/character/[id]/story/[storyId]/story";
import { useTranslation } from "react-i18next";
import CharacterCardPlaceholder from "../../components/cards/character-card-placeholder";
import { useEffect, useRef, useState } from "react";
import useCurrentUser from "../lib/hooks/use-current-user";
import { useInView } from "framer-motion";
import SignInDialog from "../../components/user/sign-in-dialog";
import { useStablePaginatedQuery } from "../lib/hooks/use-stable-query";
import { useNsfwPreference } from "../lib/hooks/use-nsfw-preference";

export const StoriesGrid = () => {
  const { t } = useTranslation();
  const { nsfwPreference } = useNsfwPreference();

  const { results, status, loadMore } = useStablePaginatedQuery(
    api.stories.listAll,
    { nsfwPreference },
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
      <div className="flex items-center gap-1 px-4 font-medium lg:px-0">
        {t("Stories")}
      </div>
      <div className="flex w-full grid-cols-2 flex-col gap-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-3 lg:pl-0 2xl:grid-cols-4">
        {results?.length > 0
          ? results.map((story, i) => (
              <Link
                href={`/character/${story.characterId}/story/${story._id}`}
                onClick={(e) => e.stopPropagation()}
                className={`h-[32rem] overflow-hidden rounded-lg border duration-200 hover:shadow-lg`}
              >
                <Story
                  isCard={true}
                  storyId={story._id}
                  characterId={story.characterId}
                  isNSFW={story.isNSFW}
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
