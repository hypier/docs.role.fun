"use client";

import { Button } from "@repo/ui/src/components";
import Link from "next/link";

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
        <Link href="/">
          <Button onClick={() => reset()}>Go to Homepage</Button>
        </Link>
      </body>
    </html>
  );
}
