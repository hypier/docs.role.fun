import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components";
import { InfoTooltip } from "@repo/ui/src/components/tooltip";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import CharacterCardPlaceholder from "../cards/character-card-placeholder";
import { AspectRatio } from "@repo/ui/src/components/aspect-ratio";
import { Plus } from "lucide-react";
import { useState } from "react";
import PersonaForm from "./persona-form";
import PersonaCard from "../cards/persona-card";
import useCurrentUser from "../../app/lib/hooks/use-current-user";

const NewPersona = ({ onClick }: { onClick: any }) => {
  return (
    <AspectRatio
      ratio={1 / 1.75}
      className="group h-full w-full place-content-center rounded-lg border border-dashed duration-200 hover:-translate-y-1 hover:shadow-lg"
      role="button"
      onClick={onClick}
    >
      <Card className="flex h-full w-full items-center justify-center gap-2 rounded-lg border-none p-2">
        <Plus /> Create persona
      </Card>
    </AspectRatio>
  );
};

export function MyPersonas() {
  const allPersonas = useQuery(api.personas.listMy) || [];
  const personas = allPersonas.filter((persona) => persona.name);
  const [draftPersona, setDraftPersona] = useState(false) as any;
  const currentUser = useCurrentUser();

  return (
    <>
      {draftPersona ? (
        <PersonaForm
          id={draftPersona?._id}
          name={draftPersona?.name}
          description={draftPersona?.description}
          cardImageUrl={draftPersona?.cardImageUrl}
          isEdit={draftPersona === true ? false : true}
          isPrivate={draftPersona.isPrivate}
          onClickGoBack={() => setDraftPersona(false)}
        />
      ) : (
        <Card className="h-full w-full overflow-hidden border-transparent shadow-none lg:border-border lg:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              My personas
              <InfoTooltip
                content={
                  "You can be anyone you want to be. By updating your persona with specific personality traits, preferences, and physical characteristics, your interactions with characters become more personalized and immersive. Whether you want to explore new identities, immerse yourself in your favorite fictional stories, or simply add a creative twist to your conversations, Personas are the way to go."
                }
              />
            </CardTitle>

            <CardDescription>Create and customize personas.</CardDescription>
          </CardHeader>
          <CardContent className="flex w-full grid-cols-2 flex-col gap-4 px-4 sm:grid md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            <NewPersona onClick={() => setDraftPersona(true)} />
            {personas
              ? personas.map(
                  (persona) =>
                    persona.name && (
                      <PersonaCard
                        id={persona._id}
                        key={persona._id}
                        name={persona.name}
                        cardImageUrl={persona.cardImageUrl as string}
                        description={persona.description}
                        isDefault={
                          currentUser?.primaryPersonaId === persona?._id
                        }
                        onEdit={() => setDraftPersona(persona)}
                      />
                    ),
                )
              : Array.from({ length: 12 }).map((_, index) => (
                  <CharacterCardPlaceholder key={index} />
                ))}
            {Array.from({ length: 10 - personas?.length - 1 }).map(
              (_, index) => (
                <CharacterCardPlaceholder key={index} />
              ),
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
