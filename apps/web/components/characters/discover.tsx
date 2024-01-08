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
import {
  ChevronLeft,
  ChevronRight,
  FilterIcon,
  ListFilter,
} from "lucide-react";
import { FadeInOut } from "../../app/lib/utils";

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
  const paginatedTags = Object.entries(popularTags).slice(
    tagPage * 10,
    (tagPage + 1) * 10,
  );
  const nextPageNotExists =
    tagPage === Math.ceil(Object.entries(popularTags).length / 10) - 1;

  return (
    <div className="flex flex-col gap-8">
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
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <AnimatePresence>
          {paginatedTags.map(([tagKey, tagValues]) =>
            tagValues.map((tagValue, i) => (
              <motion.div {...FadeInOut}>
                <Toggle
                  key={i}
                  aria-label={`Toggle ${tagValue.tagName}`}
                  variant="filled"
                  className="inline max-w-40 truncate rounded-full px-2 text-xs lg:px-3 lg:text-sm"
                  defaultPressed={searchQuery.get(tagKey) === tagValue.tagName}
                  pressed={searchQuery.get(tagKey) === tagValue.tagName}
                  onPressedChange={(pressed) => {
                    const query = new URLSearchParams(searchQuery);
                    if (pressed) {
                      query.set(tagKey, tagValue.tagName);
                    } else {
                      query.delete(tagKey);
                    }
                    router.push(`${pathname}?${query.toString()}`);
                  }}
                >
                  {tagValue.tagName}
                </Toggle>
              </motion.div>
            )),
          )}
        </AnimatePresence>
        {!nextPageNotExists && (
          <Button
            variant="ghost"
            aria-label="Next tags"
            onClick={() => setTagPage(tagPage + 1)}
            disabled={nextPageNotExists}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex w-full grid-cols-2 flex-col gap-4 px-4 sm:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:px-0">
        {characters?.length > 0
          ? characters.map(
              (character, index) =>
                character.name && (
                  <CharacterCard
                    id={character._id}
                    key={character._id}
                    name={character.name}
                    numChats={character.numChats as number}
                    cardImageUrl={character.cardImageUrl as string}
                    description={character.description}
                    model={character.model}
                    showRemix={true}
                  />
                ),
            )
          : Array.from({ length: 10 }).map((_, index) => (
              <CharacterCardPlaceholder key={index} />
            ))}
        {status === "LoadingMore" &&
          Array.from({ length: 10 }).map((_, index) => (
            <CharacterCardPlaceholder key={index} />
          ))}
        <div ref={ref} />
      </div>
    </div>
  );
};

export default Discover;
