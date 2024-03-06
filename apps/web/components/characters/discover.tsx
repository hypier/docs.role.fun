"use client";
import { api } from "../../convex/_generated/api";
import CharacterCard from "../cards/character-card";
import CharacterCardPlaceholder from "../cards/character-card-placeholder";
import { useEffect, useRef, useState } from "react";
import {
  useStablePaginatedQuery,
  useStableQuery,
} from "../../app/lib/hooks/use-stable-query";
import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Toggle } from "@repo/ui/src/components/toggle";
import { Button } from "@repo/ui/src/components";
import { ChevronRight } from "lucide-react";
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
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import useMediaQuery from "@repo/ui/src/hooks/use-media-query";

const Discover = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchQuery = useSearchParams();
  const { nsfwPreference } = useNsfwPreference();
  const filters = {
    genderTag: searchQuery.get("genderTag") || undefined,
    languageTag: searchQuery.get("languageTag") || undefined,
    genreTag: searchQuery.get("genreTag") || undefined,
    personalityTag: searchQuery.get("personalityTag") || undefined,
    model: searchQuery.get("model") || undefined,
    nsfwPreference,
    isAuthenticated,
  };
  const popularTags = useStableQuery(api.characters.listPopularTags) || {};
  const { results, status, loadMore } = useStablePaginatedQuery(
    api.characters.listWithHides,
    filters,
    { initialNumItems: 10 },
  );
  const allCharacters = results || [];
  const characters = allCharacters.filter(
    (character) => character.name && character.cardImageUrl,
  );

  const { isMobile } = useMediaQuery();
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
    <div className="relative flex flex-col gap-4">
      <Authenticated>
        <CheckinDialog />
      </Authenticated>
      <Unauthenticated>{!username && <PreferenceDialog />}</Unauthenticated>
      <Unauthenticated>
        <SignInDialog
          isOpen={isSignInModalOpen}
          setIsOpen={setIsSignInModalOpen}
        />
      </Unauthenticated>
      <div className="flex items-center gap-1 px-4 font-medium lg:mt-2 lg:px-0">
        <Link href="/characters" className="flex items-center gap-1">
          {t("Characters")}
          <Button variant="ghost" size="icon">
            <ChevronRight />
          </Button>
        </Link>
      </div>
      <div className="relative flex place-content-center lg:justify-start">
        <Carousel
          opts={{ align: "center" }}
          className="w-[75%] md:w-[80%] lg:w-[calc(80%+8rem)]"
          setApi={setApi}
        >
          <CarouselContent className="w-full" isOverflowHidden={false}>
            {Object.entries(popularTags).map(([tagKey, tagValues]) =>
              tagValues.map((tag, index) => (
                <CarouselItem
                  key={index + "tag"}
                  className="2xl:basis-1/8 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/6"
                >
                  <Toggle
                    aria-label={`Toggle ${tag.tagName}`}
                    variant="filled"
                    className="inline h-7 w-full truncate rounded-full px-2 text-xs"
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
      <div className="relative flex place-content-center lg:justify-start">
        <Carousel
          plugins={[plugin.current]}
          opts={{ align: "center" }}
          className="ml-4 w-[95%] md:w-[80%] lg:ml-0 lg:w-[calc(80%+8rem)]"
          setApi={setApi}
        >
          <CarouselContent className="w-full" isOverflowHidden={false}>
            {characters?.length > 0
              ? characters.map(
                  (character, index) =>
                    character.name && (
                      <>
                        <CarouselItem
                          className="md:basis-1/2 lg:basis-1/3 2xl:basis-1/4"
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
                            showHides={isAuthenticated}
                            isNSFW={
                              character?.isNSFW &&
                              me?.nsfwPreference !== "allow"
                            }
                          />
                        </CarouselItem>
                        {index === 5 && (
                          <CarouselItem
                            className="md:basis-1/2 lg:basis-1/3 2xl:basis-1/4"
                            key={"new-character"}
                          >
                            <NewCharacter />
                          </CarouselItem>
                        )}
                      </>
                    ),
                )
              : Array.from({ length: 10 }).map((_, index) => (
                  <CarouselItem
                    className="md:basis-1/2 lg:basis-1/3 2xl:basis-1/4"
                    key={index + "placeholder"}
                  >
                    <CharacterCardPlaceholder />
                  </CarouselItem>
                ))}
            {status === "LoadingMore" &&
              Array.from({ length: 10 }).map((_, index) => (
                <CarouselItem
                  className="md:basis-1/2 lg:basis-1/3 2xl:basis-1/4"
                  key={index + "loader"}
                >
                  <CharacterCardPlaceholder />
                </CarouselItem>
              ))}
          </CarouselContent>
          {!isMobile && (
            <>
              <CarouselPrevious variant="ghost" />
              <CarouselNext variant="ghost" />
            </>
          )}
        </Carousel>
      </div>

      <Authenticated>
        <ErrorBoundary errorComponent={() => ""}>
          <MainChats />
        </ErrorBoundary>
      </Authenticated>
      <section className="flex flex-col gap-4 lg:w-[calc(80%+8rem)]">
        <div className="flex items-center gap-1 px-4 font-medium lg:px-0">
          <Link href="/images" className="flex items-center gap-1">
            {t("Images")}
            <Button variant="ghost" size="icon">
              <ChevronRight />
            </Button>
          </Link>
        </div>
        <ErrorBoundary errorComponent={() => ""}>
          <Gallery />
        </ErrorBoundary>
      </section>
    </div>
  );
};

export default Discover;
