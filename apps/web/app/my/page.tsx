"use client";

import useStoreUserEffect from "../lib/hooks/use-store-user-effect";
import Creations from "./creations";

export default function Page(): JSX.Element {
  useStoreUserEffect();
  return (
    <div className="h-full w-full overflow-x-hidden pb-8 lg:pl-16">
      <Creations />
    </div>
  );
}
