"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  reset();
  return (
    <div>
      <h2>Something went wrong!</h2>
    </div>
  );
}
