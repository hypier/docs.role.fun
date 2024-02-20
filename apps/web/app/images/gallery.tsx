import Spinner from "@repo/ui/src/components/spinner";
import CharacterCardPlaceholder from "../../components/cards/character-card-placeholder";
import ImageCard from "./image-card";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import {
  useStablePaginatedQuery,
  useStableQuery,
} from "../lib/hooks/use-stable-query";
import { api } from "../../convex/_generated/api";
import useCurrentUser from "../lib/hooks/use-current-user";
import { useTranslation } from "react-i18next";
import SignInDialog from "../../components/user/sign-in-dialog";
import { useNsfwPreference } from "../lib/hooks/use-nsfw-preference";
import { useConvexAuth, useQuery } from "convex/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/src/components/carousel";
import { Toggle } from "@repo/ui/src/components/toggle";
import { useImageStore } from "../lib/hooks/use-image-store";

export const ImagePlaceholder = () => {
  const { t } = useTranslation();
  return (
    <div className="relative animate-pulse">
      <div className="absolute inset-0 z-10 m-auto flex flex-col items-center justify-center gap-2 text-sm">
        <div className="flex gap-2">
          <Spinner />
          {t("Generating...")}
        </div>
        <span className="w-[80%] text-center text-xs text-muted-foreground">
          {t(
            "This can take a bit of time if your request is in a queue or the model is booting up. When model is ready, image is generated within 30 seconds. When image generation is failed due to an unexpected error, your crystal will be automatically refunded.",
          )}
        </span>
      </div>
      <CharacterCardPlaceholder key={"my"} ratio={1 / 1.75} />
    </div>
  );
};

const Gallery = ({ isMy = false }: { isMy?: boolean }) => {
  const me = useCurrentUser();
  const ref = useRef(null);
  const inView = useInView(ref);
  const { t } = useTranslation();

  const { isAuthenticated } = useConvexAuth();
  const { nsfwPreference } = useNsfwPreference();
  const { imageId, setIsGenerating, isGenerating } = useImageStore();
  const generatedImage = useQuery(
    api.images.get,
    imageId ? { imageId } : "skip",
  );

  const router = useRouter();
  const pathname = usePathname();
  const searchQuery = useSearchParams();
  const filters = {
    tag: searchQuery?.get("tag") || undefined,
    nsfwPreference,
    isAuthenticated,
  };
  const [_api, setApi] = useState<CarouselApi>();

  const popularTags = useStableQuery(api.images.listPopularTags) || {};
  const { results, status, loadMore } = useStablePaginatedQuery(
    isMy ? api.images.listMy : api.images.listImages,
    filters,
    { initialNumItems: 10 },
  );
  const allImages = results || [];
  const images = allImages.filter((image) => image.imageUrl);
  useEffect(() => {
    if (inView) {
      if (!me?.name && results?.length > 31) {
        setIsSignInModalOpen(true);
      } else {
        loadMore(10);
      }
    }
  }, [inView, loadMore]);

  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  useEffect(() => {
    if (generatedImage?.imageUrl) {
      setIsGenerating(false);
    }
  }, [generatedImage]);

  return (
    <>
      <div className="relative flex w-full place-content-center lg:justify-start">
        <Carousel
          opts={{ align: "center" }}
          className="w-[75%] md:w-[80%] lg:w-[96%]"
          setApi={setApi}
        >
          <CarouselContent className="w-full">
            {Array.isArray(popularTags) &&
              popularTags.map(
                (
                  { tagName, count }: { tagName: string; count: number },
                  index: number,
                ) => (
                  <CarouselItem
                    key={tagName + index}
                    className="2xl:basis-1/8 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/6"
                  >
                    <Toggle
                      aria-label={`Toggle ${tagName}`}
                      variant="filled"
                      className="inline h-7 w-full truncate rounded-full px-2 text-xs"
                      defaultPressed={searchQuery.get("tag") === tagName}
                      pressed={searchQuery.get("tag") === tagName}
                      onPressedChange={(pressed) => {
                        const query = new URLSearchParams(searchQuery);
                        if (pressed) {
                          query.set("tag", tagName);
                        } else {
                          query.delete("tag");
                        }
                        router.push(`${pathname}?${query.toString()}`);
                      }}
                    >
                      {t(tagName)}
                    </Toggle>
                  </CarouselItem>
                ),
              )}
          </CarouselContent>
          <CarouselPrevious variant="ghost" />
          <CarouselNext variant="ghost" />
        </Carousel>
      </div>
      <div className="flex w-full grid-cols-2 flex-col gap-4 px-4 md:grid lg:grid-cols-3 lg:pl-0 2xl:grid-cols-4">
        <SignInDialog
          isOpen={isSignInModalOpen}
          setIsOpen={setIsSignInModalOpen}
        />
        {isGenerating && <ImagePlaceholder />}
        {images?.length > 0
          ? images.map((image, index) => (
              <ImageCard
                id={image._id}
                key={image._id}
                imageUrl={image.imageUrl as string}
                model={image.model}
                prompt={image.prompt}
                numLikes={image?.numLikes}
                isLiked={image?.isLiked}
                isNSFW={image?.isNSFW && nsfwPreference !== "allow"}
                isPrivate={image?.isPrivate}
                creatorId={image?.creatorId}
              />
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
    </>
  );
};

export default Gallery;
