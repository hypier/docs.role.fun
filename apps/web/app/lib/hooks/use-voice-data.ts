"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect } from "react";

const useVoiceData = () => {
  const [voiceData, saveVoiceData] = useLocalStorage("voiceData", null as any);
  const fetchedVoiceData = useQuery(api.models.listVoices);

  useEffect(() => {
    if (fetchedVoiceData) {
      saveVoiceData(fetchedVoiceData);
    }
  }, [fetchedVoiceData, saveVoiceData]);

  return voiceData;
};

export default useVoiceData;
