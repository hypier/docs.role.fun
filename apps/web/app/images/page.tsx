import { constructMetadata } from "../lib/utils";
import Images from "./images";

export const metadata = constructMetadata({
  title: "Images - Generate AI Art",
  description: "Explore, find and generate best AI art.",
});

export default function Page(): JSX.Element {
  return (
    <div className="h-full w-full overflow-x-hidden pb-8 lg:pl-16">
      <Images />
    </div>
  );
}
