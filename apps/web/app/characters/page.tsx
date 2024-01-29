import { constructMetadata } from "../lib/utils";
import Characters from "./characters";

export const metadata = constructMetadata({
  title: "Characters - Discover Best AI Characters",
  description: "Explore and find your personal AI companion.",
});

export default function Page(): JSX.Element {
  return (
    <div className="h-full w-full overflow-x-hidden pb-8 lg:pl-16">
      <Characters />
    </div>
  );
}
