import Spinner from "@repo/ui/src/components/spinner";
import CharacterCardPlaceholder from "../../components/cards/character-card-placeholder";
import ImageCard from "./image-card";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useStablePaginatedQuery } from "../lib/hooks/use-stable-query";
import { api } from "../../convex/_generated/api";
import useCurrentUser from "../lib/hooks/use-current-user";
import { useTranslation } from "react-i18next";
import SignInDialog from "../../components/user/sign-in-dialog";
import { Info } from "lucide-react";

const Gallery = ({ isGenerating = false }: { isGenerating: boolean }) => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref);
  const me = useCurrentUser();
  const { results, status, loadMore } = useStablePaginatedQuery(
    api.images.listImages,
    {},
    { initialNumItems: 10 },
  );
  const allImages = results || [];
  const images = allImages.filter((image) => image.imageUrl);
  useEffect(() => {
    if (inView) {
      if (!me?.name && results?.length > 21) {
        setIsSignInModalOpen(true);
      } else {
        loadMore(10);
      }
    }
  }, [inView, loadMore]);

  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  return (
    <div className="flex w-full grid-cols-2 flex-col gap-4 px-4 sm:grid md:grid-cols-3 lg:grid-cols-4 lg:pl-0 xl:grid-cols-5">
      <SignInDialog
        isOpen={isSignInModalOpen}
        setIsOpen={setIsSignInModalOpen}
      />
      {!isGenerating && (
        <div className="relative animate-pulse">
          <div className="absolute inset-0 z-10 m-auto flex flex-col items-center justify-center gap-2 text-sm">
            <div className="flex gap-2">
              <Spinner />
              {t("Generating...")}
            </div>
            <span className="w-[80%] text-center text-xs text-muted-foreground">
              {t(
                "Normally, image is generated in a minute. When image generation is failed due to an unexpected error, your crystal will be automatically refunded.",
              )}
            </span>
          </div>
          <CharacterCardPlaceholder key={"my"} />
        </div>
      )}
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
              isNSFW={image?.isNSFW && me?.nsfwPreference !== "allow"}
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
  );
};

export default Gallery;
