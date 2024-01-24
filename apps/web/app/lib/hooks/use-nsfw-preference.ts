"use client";
import { useMutation } from "convex/react";
import { useLocalStorage } from "@uidotdev/usehooks";
import useCurrentUser from "./use-current-user";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";

export const useNsfwPreference = () => {
  const me = useCurrentUser();
  const updateNSFWPreference = useMutation(api.users.updateNSFWPreference);
  const [nsfwPreference, setNsfwPreference] = useLocalStorage<string>(
    me?.nsfwPreference || "block",
  );

  const updatePreference = (value: "allow" | "auto" | "block") => {
    setNsfwPreference(value);
    const promise = updateNSFWPreference({
      nsfwPreference: value,
    });
    return promise;
  };

  useEffect(() => {
    me?.nsfwPreference
      ? setNsfwPreference(me?.nsfwPreference)
      : nsfwPreference &&
        me?.name &&
        updateNSFWPreference({
          nsfwPreference: nsfwPreference as "allow" | "block" | "auto",
        });
  }, [me?.nsfwPreference]);

  return { nsfwPreference, updatePreference };
};
