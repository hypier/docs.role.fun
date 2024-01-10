"use client";

import Discover from "../components/characters/discover";
import useStoreUserEffect from "./lib/hooks/use-store-user-effect";

export default function Page(): JSX.Element {
  useStoreUserEffect();
  return (
    <div className="h-full w-full overflow-x-hidden pb-8 lg:pl-16 lg:pr-6">
      <Discover />
    </div>
  );
}
