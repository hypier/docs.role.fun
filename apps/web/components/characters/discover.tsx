"use client";
import { api } from "../../convex/_generated/api";
import CharacterCard from "../cards/character-card";
import CharacterCardPlaceholder from "../cards/character-card-placeholder";
import { useEffect, useRef, useState } from "react";
import { useStablePaginatedQuery } from "../../app/lib/hooks/use-stable-query";
import { useConvexAuth, useQuery } from "convex/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Toggle } from "@repo/ui/src/components/toggle";
import { Button } from "@repo/ui/src/components";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { useTranslation } from "react-i18next";
import { MainChats } from "./main-chat";
import { NewCharacter } from "./my-characters";
import useCurrentUser from "../../app/lib/hooks/use-current-user";
import CheckinDialog from "../check-in-dialog";
import Gallery from "../../app/images/gallery";
import Link from "next/link";
import SignInDialog from "../user/sign-in-dialog";
import { useNsfwPreference } from "../../app/lib/hooks/use-nsfw-preference";
import PreferenceDialog from "../user/preference-dialog";

const Discover = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchQuery = useSearchParams();
  const { nsfwPreference } = useNsfwPreference();
  const filters = {
    languageTag: searchQuery.get("languageTag") || undefined,
    genreTag: searchQuery.get("genreTag") || undefined,
    personalityTag: searchQuery.get("personalityTag") || undefined,
    roleTag: searchQuery.get("roleTag") || undefined,
    model: searchQuery.get("model") || undefined,
    nsfwPreference,
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
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  useEffect(() => {
    if (!_api) {
      return;
    }

    setCount(_api.scrollSnapList().length);
    setCurrent(_api.selectedScrollSnap() + 1);
    if (_api.selectedScrollSnap() + 1 >= _api.scrollSnapList().length - 10) {
      if (!me?.name && count > 31) {
        setIsSignInModalOpen(true);
      } else {
        loadMore(10);
      }
    }

    _api.on("select", () => {
      setCurrent(_api.selectedScrollSnap() + 1);
    });
  }, [_api, characters]);

  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true }),
  );
  const me = useCurrentUser();
  const username = me?.name;

  return (
    <div className="relative flex flex-col gap-4 lg:gap-8">
      {isAuthenticated && <CheckinDialog />}
      {username && <MainChats />}
      {!username && <PreferenceDialog />}
      <SignInDialog
        isOpen={isSignInModalOpen}
        setIsOpen={setIsSignInModalOpen}
      />

      <div className="flex items-center gap-1 px-4 font-medium lg:mt-2 lg:px-0">
        <Link href="/characters" className="flex items-center gap-1">
          {t("Characters")}
          <Button variant="ghost" size="icon">
            <ChevronRight />
          </Button>
        </Link>
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
      <div className="relative flex place-content-center border-y py-4 lg:justify-start lg:border-none lg:py-0">
        <Carousel
          plugins={[plugin.current]}
          opts={{ align: "center" }}
          className="w-[75%] md:w-[80%] lg:w-[calc(80%+4rem)]"
          setApi={setApi}
        >
          <CarouselContent className="w-full">
            {characters?.length > 0
              ? characters.map(
                  (character, index) =>
                    character.name && (
                      <>
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
                            isNSFW={
                              character?.isNSFW &&
                              me?.nsfwPreference !== "allow"
                            }
                          />
                        </CarouselItem>
                        {index === 5 && (
                          <CarouselItem
                            className="md:basis-1/3 lg:basis-1/4 2xl:basis-1/5"
                            key={character._id}
                          >
                            <NewCharacter />
                          </CarouselItem>
                        )}
                      </>
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
          <CarouselPrevious variant="ghost" />
          <CarouselNext variant="ghost" />
        </Carousel>
      </div>
      <MainStories />
      <section className="flex flex-col gap-4 lg:w-[calc(80%+4rem)] lg:gap-8">
        <div className="flex items-center gap-1 border-b px-4 pb-4 font-medium lg:border-none lg:px-0 lg:pb-0">
          <Link href="/images" className="flex items-center gap-1">
            {t("Images")}
            <Button variant="ghost" size="icon">
              <ChevronRight />
            </Button>
          </Link>
        </div>
        <Gallery isGenerating={false} />
      </section>
    </div>
  );
};

export default Discover;
