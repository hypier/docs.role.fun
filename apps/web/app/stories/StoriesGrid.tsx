"use client";
import { api } from "../../convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import Link from "next/link";
import { Story } from "../../app/character/[id]/story/[storyId]/story";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/src/components/carousel";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { InfoTooltip, TooltipContent } from "@repo/ui/src/components";
import CharacterCardPlaceholder from "../../components/cards/character-card-placeholder";

export const StoriesGrid = () => {
  const { t } = useTranslation();
  const { results, status, loadMore } = usePaginatedQuery(
    api.stories.listAll,
    {},
    { initialNumItems: 10 },
  );
  const [_api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!_api) {
      return;
    }

    setCount(_api.scrollSnapList().length);
    setCurrent(_api.selectedScrollSnap() + 1);
    if (_api.selectedScrollSnap() + 1 >= _api.scrollSnapList().length - 10) {
      loadMore(10);
    }

    _api.on("select", () => {
      setCurrent(_api.selectedScrollSnap() + 1);
    });
  }, [_api, results]);

  return (
    <section className="flex flex-col gap-4 lg:gap-8">
      <div className="flex items-center gap-1 px-4 font-medium lg:px-0">
        {t("Stories")}
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
      </div>
    </section>
  );
};
