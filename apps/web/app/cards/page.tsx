import { constructMetadata } from "../lib/utils";
import Cards from "./cards";

export const metadata = constructMetadata({
  title: "Cards - Discover Best AI Characters",
  description: "Explore and find your personal AI companion.",
});

export default function Page(): JSX.Element {
  return (
    <div className="h-full w-full overflow-x-hidden pb-8 lg:pl-16">
      <Cards />
    </div>
  );
}
