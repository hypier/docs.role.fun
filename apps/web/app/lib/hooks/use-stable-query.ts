// in hooks/useStableQuery.ts
import { usePaginatedQuery, useQuery } from "convex/react";
import { useRef } from "react";

export const useStablePaginatedQuery = ((name, ...args) => {
  try {
    const result = usePaginatedQuery(name, ...args);
    const stored = useRef(result);

    // If new data is still loading, wait and do nothing
    // If data has finished loading, use the ref to store it
    if (result.status !== "LoadingMore") {
      stored.current = result;
    }

    return stored.current;
  } catch (error) {
    // Handle the exception in a way that makes sense for your application
    console.error("An error occurred in useStablePaginatedQuery: ", error);
    // Depending on the error handling strategy, you might want to return a default value or rethrow the error
    return { results: [], status: "failed", loadMore: () => {} };
  }
}) as typeof usePaginatedQuery;

export const useStableQuery = ((name, ...args) => {
  const result = useQuery(name, ...args);

  // useRef() creates an object that does not change between re-renders
  // stored.current will be result (undefined) on the first render
  const stored = useRef(result);

  // After the first render, stored.current only changes if I change it
  // if result is undefined, fresh data is loading and we should do nothing
  if (result !== undefined) {
    // if a freshly loaded result is available, use the ref to store it
    stored.current = result;
  }

  // undefined on first load, stale data while reloading, fresh data after loading
  return stored.current;
}) as typeof useQuery; // make sure we match the useQuery signature & return type
