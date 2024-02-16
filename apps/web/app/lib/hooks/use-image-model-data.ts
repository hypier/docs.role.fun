"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect } from "react";

const useImageModelData = () => {
  const [modelData, saveModelData] = useLocalStorage(
    "image-model",
    null as any,
  );
  const fetchedModelData = useQuery(api.models.listImageModels);

  useEffect(() => {
    if (fetchedModelData) {
      saveModelData(fetchedModelData);
    }
  }, [fetchedModelData, saveModelData]);

  return modelData;
};

export default useImageModelData;
