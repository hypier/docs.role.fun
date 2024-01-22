"use client";

import { useRouter } from "next/navigation";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  router.push("/");
  return (
    <html>
      <body>
        <h2>Something went wrong! Redirecting to Homepage...</h2>
      </body>
    </html>
  );
}
