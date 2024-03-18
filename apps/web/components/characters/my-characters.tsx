import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components";
import { api } from "../../convex/_generated/api";
import CharacterCardPlaceholder from "../cards/character-card-placeholder";
import CharacterCard from "../cards/character-card";
import { AspectRatio } from "@repo/ui/src/components/aspect-ratio";
import { Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import { InfoTooltip } from "@repo/ui/src/components/tooltip";
import { useInView } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useStablePaginatedQuery } from "../../app/lib/hooks/use-stable-query";

export const NewCharacter = () => {
  const { t } = useTranslation();
  return (
    <Link href="/my-characters/create">
      <AspectRatio
        ratio={1 / 1.5}
        className="group group h-full w-full place-content-center rounded-lg border border-dashed"
        role="button"
      >
        <Card className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border-none p-2 duration-200 group-hover:opacity-50">
          <div className="flex gap-2">
            <Plus /> {t("Create character")}
          </div>
        </Card>
      </AspectRatio>
    </Link>
  );
};

export function MyCharacters() {
  const { t } = useTranslation();
  const { results, loadMore } = useStablePaginatedQuery(
    api.characters.listMy,
    {},
    { initialNumItems: 10 },
  );
  const allCharacters = results || [];
  const characters = allCharacters.filter((character) => character.name);
  const ref = useRef(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView) {
      loadMore(10);
    }
  }, [inView, loadMore]);
  return (
    <Card className="h-full w-full overflow-hidden border-transparent shadow-none lg:border-border lg:shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t("My Characters")}
          <InfoTooltip
            content={
              "Create interactive characters using our tools. All characters on the home page were made this way."
            }
          />
        </CardTitle>
        <CardDescription>
          {t("Create and customize characters.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex w-full grid-cols-2 flex-col gap-4 px-4 sm:grid md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <NewCharacter />
        {characters
          ? characters.map(
              (character) =>
                character.name && (
                  <CharacterCard
                    id={character._id}
                    key={character._id}
                    name={character.name}
                    numChats={character.numChats as number}
                    showEdit={true}
                    cardImageUrl={character.cardImageUrl as string}
                    description={character.description}
                    isDraft={character.isDraft}
                    model={character.model}
                  />
                ),
            )
          : Array.from({ length: 12 }).map((_, index) => (
              <CharacterCardPlaceholder key={index} />
            ))}
        {Array.from({ length: 10 - characters?.length - 1 }).map((_, index) => (
          <CharacterCardPlaceholder key={index} />
        ))}
      </CardContent>
      <div ref={ref} />
    </Card>
  );
}
