"use client";

import { Button } from "@repo/ui/src/components";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h1>Something went wrong!</h1>
        <Button onClick={() => reset()}>Retry</Button>
      </body>
    </html>
  );
}
