"use client";
import { api } from "../../convex/_generated/api";
import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useStablePaginatedQuery } from "../lib/hooks/use-stable-query";
import CharacterCard from "../../components/cards/character-card";
import CharacterCardPlaceholder from "../../components/cards/character-card-placeholder";
import { useTranslation } from "react-i18next";
import useCurrentUser from "../lib/hooks/use-current-user";
import { useQuery } from "convex/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/src/components/carousel";
import { Button } from "@repo/ui/src/components";
import { ChevronLeft } from "lucide-react";
import { Toggle } from "@repo/ui/src/components/toggle";
import SignInDialog from "../../components/user/sign-in-dialog";

const Characters = () => {
  const { t } = useTranslation();
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
    <div className="flex flex-col gap-8">
      <SignInDialog
        isOpen={isSignInModalOpen}
        setIsOpen={setIsSignInModalOpen}
      />
      <div className="flex items-center gap-1 px-4 font-medium lg:mt-2 lg:px-0">
        {t("Characters")}
      </div>
      <div className="relative flex place-content-center border-y py-4 lg:justify-start lg:border-none lg:py-0">
        <Carousel
          opts={{ align: "center" }}
          className="w-[75%] md:w-[80%] lg:w-[calc(80%+4rem)]"
          setApi={setApi}
        >
          <CarouselContent className="w-full">
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
            {Object.entries(popularTags).map(([tagKey, tagValues]) =>
              tagValues.map((tag, index) => (
                <CarouselItem
                  key={index}
                  className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/6 2xl:basis-1/12"
                >
                  <Toggle
                    aria-label={`Toggle ${tag.tagName}`}
                    variant="filled"
                    className="inline h-7 w-full truncate px-2 text-xs"
                    defaultPressed={searchQuery.get(tagKey) === tag.tagName}
                    pressed={searchQuery.get(tagKey) === tag.tagName}
                    onPressedChange={(pressed) => {
                      const query = new URLSearchParams(searchQuery);
                      if (pressed) {
                        query.set(tagKey, tag.tagName);
                      } else {
                        query.delete(tagKey);
                      }
                      router.push(`${pathname}?${query.toString()}`);
                    }}
                  >
                    {t(tag.tagName)}
                  </Toggle>
                </CarouselItem>
              )),
            )}
          </CarouselContent>
          <CarouselPrevious variant="ghost" />
          <CarouselNext variant="ghost" />
        </Carousel>
      </div>
      <div className="flex w-full grid-cols-2 flex-col gap-4 px-4 sm:grid md:grid-cols-3 lg:grid-cols-4 lg:pl-0 xl:grid-cols-5">
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
                    isNSFW={character?.isNSFW && me?.nsfwPreference !== "allow"}
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

export default Characters;
