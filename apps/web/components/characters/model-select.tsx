"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/src/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/components/select";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import useModelData from "../../app/lib/hooks/use-model-data";

export const ModelSelect = ({
  form,
  model,
  isNSFW,
}: {
  form: any;
  model: string;
  isNSFW?: boolean;
}) => {
  const { t } = useTranslation();
  let modelData = useModelData();
  if (isNSFW) {
    modelData = modelData?.filter((model: any) => model.isNSFW);
  } else {
    modelData = modelData?.filter((model: any) => !model.isNSFW);
  }
  if (modelData?.every((modelItem: any) => modelItem.value !== model)) {
    form.setValue("model", modelData[0].value);
  }
  if (
    !modelData?.some(
      (modelItem: any) => modelItem.value === form.getValues("model"),
    )
  ) {
    form.setValue("model", modelData?.[0].value);
  }

  return (
    <FormField
      key={modelData}
      control={form.control}
      name="model"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("AI Model")}</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value ? field.value : model}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select an AI model for character." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {modelData && modelData?.length > 0 ? (
                modelData.map(
                  (model: {
                    value: string;
                    description: any;
                    crystalPrice: number;
                  }) => (
                    <SelectItem value={model.value}>
                      {model.description} ({model.crystalPrice}x Crystals per
                      message)
                    </SelectItem>
                  ),
                )
              ) : (
                <SelectItem value="openrouter/auto">Loading...</SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormDescription>
            {t(
              "Choose an AI model for your character. Each model has unique traits.",
            )}{" "}
            <Link
              href="/models"
              className="text-foreground underline duration-200 hover:opacity-50"
            >
              {t("Test your model here.")}
            </Link>
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
