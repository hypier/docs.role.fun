import { constructMetadata } from "../lib/utils";
import { StoriesGrid } from "./StoriesGrid";

export const metadata = constructMetadata({
  title: "Stories - Find your dream stories",
  description: "Explore, find and create best stories to your heart's content.",
});

export default function Page(): JSX.Element {
  return (
    <div className="h-full w-full overflow-x-hidden pb-8 lg:pl-16">
      <StoriesGrid />
    </div>
  );
}
