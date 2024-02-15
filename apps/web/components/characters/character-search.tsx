import { Button, Card, CardHeader, CardTitle } from "@repo/ui/src/components";
import {
  AvatarImage,
  AvatarFallback,
  Avatar,
} from "@repo/ui/src/components/avatar";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Input } from "@repo/ui/src/components/input";
import { useDebouncedCallback } from "use-debounce";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNsfwPreference } from "../../app/lib/hooks/use-nsfw-preference";
import {
  useStablePaginatedQuery,
  useStableQuery,
} from "../../app/lib/hooks/use-stable-query";

export const Chat = ({
  name,
  description,
  characterId,
}: {
  name: string;
  description: string;
  characterId: Id<"characters">;
}) => {
  const character = useStableQuery(api.characters.get, {
    id: characterId as Id<"characters">,
  });
  return (
    <Link href={`/character/${characterId}`}>
      <li className="group p-4 hover:bg-muted">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage
              alt={`preview of chat ${name}`}
              src={character?.cardImageUrl}
              className="object-cover"
              width={300}
              height={525}
            />
            <AvatarFallback>{name?.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium">{name ? name : "Loading"}</h2>
            </div>
            <p className="line-clamp-1 text-sm text-muted-foreground">
              {description ? description : "Click here to chat."}
            </p>
          </div>
        </div>
      </li>
    </Link>
  );
};

export default function CharacterSearch() {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const { nsfwPreference } = useNsfwPreference();
  const { results, status, loadMore } = useStablePaginatedQuery(
    api.characters.search,
    { query: inputValue, nsfwPreference },
    { initialNumItems: 10 },
  );
  const ref = useRef(null);
  const inView = useInView(ref);
  const debouncedSetInput = useDebouncedCallback(setInputValue, 500);

  useEffect(() => {
    if (inView) {
      loadMore(10);
    }
  }, [inView, loadMore]);

  return (
    <Card className="h-full w-full overflow-hidden rounded-b-none border-transparent shadow-none lg:border-border lg:shadow-xl">
      <CardHeader>
        <CardTitle className="flex w-full flex-col items-center gap-4">
          {t("Search")}
          <Input
            autoFocus
            onChange={(e) => debouncedSetInput(e.target.value)}
          />
        </CardTitle>
      </CardHeader>
      <ul>
        {results?.length ? (
          results.map((character) => (
            <Chat
              name={character.name as string}
              characterId={character._id as Id<"characters">}
              description={character.description as string}
            />
          ))
        ) : (
          <div className="flex h-[100vh] w-full flex-col items-center justify-center gap-2">
            {`No search results were found for "${inputValue}".`}
            <Link href="/my-characters/create" className="hidden lg:block">
              <Button className="rounded-full px-3" type="button">
                <Plus className="h-5 w-5 p-1" />
                {t("Create")}
              </Button>
            </Link>
          </div>
        )}
        <div ref={ref} />
      </ul>
    </Card>
  );
}
