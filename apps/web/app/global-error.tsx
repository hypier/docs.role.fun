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
      <body className="h-full w-full items-center justify-center">
        <div className="absolute inset-0 m-auto flex h-96 w-96 flex-col gap-2">
          <h1 className="text-lg font-medium">Something went wrong! </h1>
          <p className="text-muted-foreground">Try refreshing the page.</p>
          <Button
            onClick={() => {
              reset();
              window && window.location.reload();
            }}
          >
            Retry
          </Button>
        </div>
      </body>
    </html>
  );
}
