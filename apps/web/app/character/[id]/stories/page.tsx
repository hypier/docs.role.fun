import { Metadata, ResolvingMetadata } from "next";
import { constructMetadata } from "../../../lib/utils";
import { StoriesGrid } from "./StoriesGrid";
import { Id } from "../../../../convex/_generated/dataModel";

type Props = {
  params: { id: string };
};
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // read route params
  const id = params.id;

  // fetch data
  const character = await fetch(
    `${process.env.NEXT_PUBLIC_CONVEX_URL?.replace(
      "convex.cloud",
      "convex.site",
    )}/character?characterId=${id}`,
  ).then((res) => res.json());

  return constructMetadata({
    title: `Stories of ${character.name}`,
    description: character.description,
    image: character.cardImageUrl ? character.cardImageUrl : undefined,
    icon: character.cardImageUrl ? character.cardImageUrl : undefined,
  });
}

export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="h-full w-full overflow-x-hidden pb-8 lg:pl-16">
      <StoriesGrid characterId={params.id as Id<"characters">} />
    </div>
  );
}
