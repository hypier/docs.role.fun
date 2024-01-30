"use client";
import { api } from "../../convex/_generated/api";
import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useStablePaginatedQuery } from "../lib/hooks/use-stable-query";
import CharacterCard from "../../components/cards/character-card";
import CharacterCardPlaceholder from "../../components/cards/character-card-placeholder";
import { useTranslation } from "react-i18next";
import useCurrentUser from "../lib/hooks/use-current-user";
import SignInDialog from "../../components/user/sign-in-dialog";

const Models = () => {
  const { t } = useTranslation();
  const { results, status, loadMore } = useStablePaginatedQuery(
    api.characters.listModels,
    {},
    { initialNumItems: 10 },
  );
  const allCharacters = results || [];
  const characters = allCharacters.filter(
    (character) => character.name && character.cardImageUrl,
  );
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
        {t("Models")}
      </div>
      <div className="flex w-full grid-cols-2 flex-col gap-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-3 lg:pl-0 2xl:grid-cols-4">
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
                    isNSFW={character?.isNSFW}
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

export default Models;
