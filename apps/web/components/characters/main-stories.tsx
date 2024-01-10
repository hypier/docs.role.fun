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
import CharacterCardPlaceholder from "../cards/character-card-placeholder";
import { useTranslation } from "react-i18next";
import { InfoTooltip, TooltipContent } from "@repo/ui/src/components";

export const MainStories = () => {
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
        {t("Continue stories")}
        <InfoTooltip
          content={
            <TooltipContent
              title={t("Stories are chats with characters, shared by users.")}
            />
          }
        />
      </div>
      <div className="relative flex place-content-center border-y py-4 lg:justify-start lg:border-none lg:py-0">
        <Carousel
          opts={{
            align: "center",
          }}
          className="w-[75%] md:w-[80%]"
          setApi={setApi}
        >
          <CarouselContent className="w-full">
            {results?.length > 0
              ? results.map((story, i) => (
                  <CarouselItem
                    className="group ml-4 h-[32rem] overflow-hidden rounded-lg border pl-0 !text-sm md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                    key={story._id}
                  >
                    <Link
                      href={`/character/${story.characterId}/story/${story._id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Story
                        isCard={true}
                        storyId={story._id}
                        characterId={story.characterId}
                      />
                    </Link>
                  </CarouselItem>
                ))
              : Array.from({ length: 10 }).map((_, index) => (
                  <CarouselItem className="ml-4 overflow-hidden rounded-lg border pl-0 shadow-lg md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <CharacterCardPlaceholder key={index} />
                  </CarouselItem>
                ))}
            {status === "LoadingMore" &&
              Array.from({ length: 10 }).map((_, index) => (
                <CarouselItem className="ml-4 overflow-hidden rounded-lg border pl-0 shadow-lg md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <CharacterCardPlaceholder key={index} />
                </CarouselItem>
              ))}
          </CarouselContent>
          <CarouselPrevious variant="ghost" />
          <CarouselNext variant="ghost" />
        </Carousel>
      </div>
    </section>
  );
};
