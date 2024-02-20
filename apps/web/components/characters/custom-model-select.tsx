import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/components/select";
import useModelData from "../../app/lib/hooks/use-model-data";
import { Id } from "../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useStableQuery } from "../../app/lib/hooks/use-stable-query";

export const CustomModelSelect = ({
  characterId,
  initialModel,
}: {
  characterId: Id<"characters">;
  initialModel: string;
}) => {
  const upsertCustomization = useMutation(api.characterCustomization.upsert);
  const existingCustomization = useStableQuery(api.characterCustomization.get, {
    characterId,
  });
  const [selectedModel, setSelectedModel] = useState(
    existingCustomization?.model ? existingCustomization?.model : initialModel,
  );
  const modelData = useModelData();
  if (
    modelData &&
    modelData.length > 0 &&
    !modelData.some((model: any) => model.value === selectedModel)
  ) {
    setSelectedModel(modelData[0].value);
  }

  useEffect(() => {
    setSelectedModel(
      existingCustomization?.model
        ? existingCustomization?.model
        : initialModel,
    );
  }, [initialModel, existingCustomization]);

  const handleModelChange = (newValue: string) => {
    setSelectedModel(newValue);
    upsertCustomization({ characterId, model: newValue });
  };

  return (
    <Select onValueChange={handleModelChange} defaultValue={selectedModel}>
      <SelectTrigger className="h-6 max-w-72 text-xs text-muted-foreground lg:max-w-fit">
        <SelectValue placeholder="Select an AI model for character." />
      </SelectTrigger>
      <SelectContent>
        {modelData && modelData.length > 0 ? (
          modelData.map(
            (model: {
              value: string;
              description: string;
              crystalPrice: number;
            }) => (
              <SelectItem key={model.value} value={model.value}>
                {model.description} ({model?.crystalPrice}x Crystals per
                message)
              </SelectItem>
            ),
          )
        ) : (
          <SelectItem value="loading">Loading...</SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};
