import { constructMetadata } from "../lib/utils";
import Models from "./models";

export const metadata = constructMetadata({
  title: "Models - Discover Best AI Models",
  description: "Explore and find the best models to enhance your AI companion.",
});

export default function Page(): JSX.Element {
  return (
    <div className="h-full w-full overflow-x-hidden pb-8 lg:pl-16">
      <Models />
    </div>
  );
}
