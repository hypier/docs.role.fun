import { api } from "../../convex/_generated/api";
import CharacterCard from "../cards/character-card";
import CharacterCardPlaceholder from "../cards/character-card-placeholder";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useStablePaginatedQuery } from "../../app/lib/hooks/use-stable-query";
import { useQuery } from "convex/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Toggle } from "@repo/ui/src/components/toggle";
import { Button, Tooltip } from "@repo/ui/src/components";
import { ChevronLeft, ChevronRight, ListFilter } from "lucide-react";
import { FadeInOut } from "../../app/lib/utils";
import { MainStories } from "./main-stories";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/src/components/carousel";

const Discover = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchQuery = useSearchParams();
  const filters = {
    languageTag: searchQuery.get("languageTag") || undefined,
    genreTag: searchQuery.get("genreTag") || undefined,
    personalityTag: searchQuery.get("personalityTag") || undefined,
    roleTag: searchQuery.get("roleTag") || undefined,
    model: searchQuery.get("model") || undefined,
  };
  const popularTags = useQuery(api.characters.listPopularTags) || {};
  const [tagPage, setTagPage] = useState(0);
  const { results, status, loadMore } = useStablePaginatedQuery(
    api.characters.list,
    filters,
    { initialNumItems: 10 },
  );
  const allCharacters = results || [];
  const characters = allCharacters.filter(
    (character) => character.name && character.cardImageUrl,
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
  }, [_api, characters]);

  const tagsPerPage = 10;
  const flattenedTags = Object.entries(popularTags).flatMap(([key, values]) =>
    values.map((value) => ({ ...value, tagKey: key })),
  );
  const paginatedTags = flattenedTags.slice(
    tagPage * tagsPerPage,
    (tagPage + 1) * tagsPerPage,
  );
  const nextPageNotExists =
    tagPage === Math.ceil(flattenedTags.length / tagsPerPage) - 1;
  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true }),
  );

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <div className="px-4 font-medium lg:mt-2 lg:px-0">Characters</div>
      <div className="flex w-full flex-wrap items-center gap-1 px-4 lg:px-0">
        <Tooltip content="Filter characters">
          <ListFilter className="h-4 w-4 p-0.5 text-muted-foreground" />
        </Tooltip>
        {tagPage > 0 && (
          <Button
            variant="ghost"
            aria-label="Previous tags"
            onClick={() => setTagPage(tagPage - 1)}
            disabled={tagPage === 0}
          >
            <ChevronLeft className="h-4 w-4 p-0.5 text-muted-foreground" />
          </Button>
        )}
        <AnimatePresence>
          {paginatedTags.map((tag, index) => (
            <motion.div key={index} {...FadeInOut}>
              <Toggle
                aria-label={`Toggle ${tag.tagName}`}
                variant="filled"
                className="inline h-7 max-w-40 truncate px-2 text-xs"
                defaultPressed={searchQuery.get(tag.tagKey) === tag.tagName}
                pressed={searchQuery.get(tag.tagKey) === tag.tagName}
                onPressedChange={(pressed) => {
                  const query = new URLSearchParams(searchQuery);
                  if (pressed) {
                    query.set(tag.tagKey, tag.tagName);
                  } else {
                    query.delete(tag.tagKey);
                  }
                  router.push(`${pathname}?${query.toString()}`);
                }}
              >
                {tag.tagName}
              </Toggle>
            </motion.div>
          ))}
        </AnimatePresence>
        {!nextPageNotExists && (
          <Button
            variant="ghost"
            aria-label="Next tags"
            onClick={() => setTagPage(tagPage + 1)}
            disabled={nextPageNotExists}
          >
            <ChevronRight className="h-4 w-4 p-0.5 text-muted-foreground" />
          </Button>
        )}
      </div>
      <div className="border-y py-4 lg:w-[90%] lg:border-none lg:py-0">
        <Carousel
          plugins={[plugin.current]}
          opts={{ align: "center" }}
          className="mx-12 max-w-screen-xl xl:max-w-screen-2xl"
          setApi={setApi}
        >
          <CarouselContent className="w-full">
            {characters?.length > 0
              ? characters.map(
                  (character, index) =>
                    character.name && (
                      <CarouselItem
                        className="md:basis-1/3 lg:basis-1/4 2xl:basis-1/5"
                        key={character._id}
                      >
                        <CharacterCard
                          id={character._id}
                          name={character.name}
                          numChats={character.numChats as number}
                          cardImageUrl={character.cardImageUrl as string}
                          description={character.description}
                          model={character.model}
                          showRemix={true}
                        />
                      </CarouselItem>
                    ),
                )
              : Array.from({ length: 10 }).map((_, index) => (
                  <CarouselItem className="md:basis-1/3 lg:basis-1/4 2xl:basis-1/5">
                    <CharacterCardPlaceholder key={index} />
                  </CarouselItem>
                ))}
            {status === "LoadingMore" &&
              Array.from({ length: 10 }).map((_, index) => (
                <CarouselItem className="md:basis-1/3 lg:basis-1/4 2xl:basis-1/5">
                  <CharacterCardPlaceholder key={index} />
                </CarouselItem>
              ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      <MainStories />
    </div>
  );
};

export default Discover;
