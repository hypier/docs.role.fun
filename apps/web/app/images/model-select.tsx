"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@repo/ui/src/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/components/select";
import { useTranslation } from "react-i18next";
import useImageModelData from "../lib/hooks/use-image-model-data";

export const ModelSelect = ({ form, model }: { form: any; model: string }) => {
  const { t } = useTranslation();
  const modelData = useImageModelData();
  return (
    <FormField
      control={form.control}
      name="model"
      render={({ field }) => (
        <FormItem>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value ? field.value : model}
          >
            <FormControl>
              <SelectTrigger className="w-48 truncate lg:w-72">
                <SelectValue placeholder={t("Select an image model")} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="w-48 lg:w-72">
              {modelData && modelData?.length > 0 ? (
                modelData.map((model: { value: string; description: any }) => (
                  <SelectItem value={model.value}>
                    {model.description}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="openrouter/auto">Loading...</SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
