"use client";
import { api } from "../../../convex/_generated/api";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect } from "react";
import { useStableQuery } from "./use-stable-query";

const useAllModels = () => {
  const [modelData, saveModelData] = useLocalStorage("allModels", null as any);
  const fetchedModelData = useStableQuery(api.models.listAllModels);

  useEffect(() => {
    if (fetchedModelData) {
      saveModelData(fetchedModelData);
    }
  }, [fetchedModelData, saveModelData]);

  return modelData;
};

export default useAllModels;
