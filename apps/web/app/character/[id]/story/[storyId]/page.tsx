import { Metadata, ResolvingMetadata } from "next";
import { constructMetadata } from "../../../../lib/utils";
import ChatWithCharacter from "../../ChatWithCharacter";

type Props = {
  params: { id: string; storyId: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // read route params
  const storyId = params.storyId;

  // fetch data
  const metadata = await fetch(
    `${process.env.NEXT_PUBLIC_CONVEX_URL?.replace(
      "convex.cloud",
      "convex.site",
    )}/story?storyId=${storyId}`,
  ).then((res) => res.json());

  return constructMetadata({
    title: metadata.title,
    description: metadata.description,
    image: metadata.cardImageUrl ? metadata.cardImageUrl : undefined,
  });
}

export default function Page({
  params,
}: {
  params: { id: string; storyId: string };
}) {
  return <ChatWithCharacter params={params} />;
}
