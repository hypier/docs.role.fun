import { Metadata, ResolvingMetadata } from "next";
import { constructMetadata } from "../../../../lib/utils";
import ChatWithCharacter from "../../ChatWithCharacter";

type Props = {
  params: { id: string; storyId: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = params.id;

  // fetch data
  const character = await fetch(
    `${process.env.NEXT_PUBLIC_CONVEX_URL?.replace(
      "convex.cloud",
      "convex.site"
    )}/character?characterId=${id}`
  ).then((res) => res.json());

  return constructMetadata({
    title: character.name,
    description: character.description,
    image: character.cardImageUrl ? character.cardImageUrl : undefined,
  });
}

export default function Page({
  params,
}: {
  params: { id: string; storyId: string };
}) {
  return <ChatWithCharacter params={params} />;
}
