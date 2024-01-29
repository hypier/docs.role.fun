import { Button } from "@repo/ui/src/components";
import { ArrowDown, Menu, PlusSquare, X } from "lucide-react";
import React from "react";

interface Props {
  closePrompt: () => void;
  doNotShowAgain: () => void;
}

export default function AddToSamsung(props: Props) {
  const { doNotShowAgain } = props;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-[80%] px-4 pb-12 text-foreground">
      <div className="relative flex h-full flex-col items-center justify-around rounded-xl border bg-background p-4 text-center">
        <p className="text-lg text-muted-foreground">
          Install ORP app to your home screen!
        </p>
        <div className="flex items-center gap-2 text-lg">
          <p>Click the</p>
          <Menu className="text-4xl" />
          <p>icon</p>
        </div>
        <div className="flex w-full flex-col items-center gap-2 px-4 text-lg">
          <p className="text-lg text-muted-foreground">
            Scroll down and then click:
          </p>
          <div className="flex flex-col items-center gap-2 rounded-lg bg-white p-4 text-zinc-800">
            <PlusSquare className="text-2xl" />
            <p>Add page to</p>
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-2 px-4 text-lg">
          <p>Then select:</p>
          <div className="flex flex-col items-center gap-2 rounded-lg bg-white px-4 py-2 text-zinc-800">
            <p>Home screen</p>
          </div>
        </div>
        <Button onClick={doNotShowAgain}>Don&apos;t show again</Button>
        <ArrowDown className="absolute -bottom-[50px] right-[-3px] z-10 animate-bounce text-4xl text-blue-500" />
      </div>
    </div>
  );
}
