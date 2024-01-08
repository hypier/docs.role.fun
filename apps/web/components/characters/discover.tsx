import { api } from "../../convex/_generated/api";
import CharacterCard from "../cards/character-card";
import CharacterCardPlaceholder from "../cards/character-card-placeholder";
import { AnimatePresence, motion, useInView } from "framer-motion";
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
  const ref = useRef(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView) {
      loadMore(10);
    }
  }, [inView, loadMore]);
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
  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <div className="self-center px-4 font-medium lg:px-0">Characters</div>
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
      <div className="border-y bg-background p-2 py-12 lg:rounded-lg lg:border lg:shadow-lg">
        <Carousel
          plugins={[plugin.current]}
          opts={{
            align: "center",
            loop: true,
          }}
          className="mx-12"
        >
          <CarouselContent className="w-full">
            {characters?.length > 0
              ? characters.map(
                  (character, index) =>
                    character.name && (
                      <CarouselItem
                        className="xl:basis-1/ md:basis-1/3 lg:basis-1/4"
                        key={character._id}
                      >
                        <div
                          ref={
                            index === characters.length - 1 ? ref : undefined
                          }
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
                        </div>
                      </CarouselItem>
                    ),
                )
              : Array.from({ length: 10 }).map((_, index) => (
                  <CarouselItem className="md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                    <CharacterCardPlaceholder key={index} />
                  </CarouselItem>
                ))}
            {status === "LoadingMore" &&
              Array.from({ length: 10 }).map((_, index) => (
                <CarouselItem className="md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                  <CharacterCardPlaceholder key={index} />
                </CarouselItem>
              ))}
            <div ref={ref} />
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
