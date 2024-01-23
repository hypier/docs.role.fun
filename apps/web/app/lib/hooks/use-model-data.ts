"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect } from "react";

const useModelData = () => {
  const [modelData, saveModelData] = useLocalStorage("modelData", null as any);
  const fetchedModelData = useQuery(api.models.list);

  useEffect(() => {
    if (fetchedModelData) {
      saveModelData(fetchedModelData);
    }
  }, [fetchedModelData, saveModelData]);

  return modelData;
};

export default useModelData;
