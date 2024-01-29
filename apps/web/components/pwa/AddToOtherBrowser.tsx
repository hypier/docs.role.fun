import React from "react";
import Link from "next/link";
import { Button } from "@repo/ui/src/components";

interface Props {
  closePrompt: () => void;
  doNotShowAgain: () => void;
}

export default function AddToOtherBrowser(props: Props) {
  const { doNotShowAgain } = props;
  const searchUrl = `https://www.google.com/search?q=add+to+home+screen+for+common-mobile-browsers`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[60%] flex-col items-center justify-around px-4 pb-12 text-foreground">
      <div className="relative flex h-full flex-col items-center justify-around rounded-xl border bg-background p-4 text-center">
        <p className="text-lg text-muted-foreground">
          Install ORP app to your home screen!
        </p>
        <div className="flex flex-col items-center gap-4 text-lg">
          <Link className="text-blue-300" href={searchUrl} target="_blank">
            Find out how
          </Link>
        </div>
        <Button onClick={doNotShowAgain}>Don&apos;t show again</Button>
      </div>
    </div>
  );
}
