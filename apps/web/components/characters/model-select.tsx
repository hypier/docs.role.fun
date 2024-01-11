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
import {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  PromiseLikeOfReactNode,
} from "react";

export const ModelSelect = ({ form, model }: { form: any; model: string }) => {
  const { t } = useTranslation();
  const modelData = useModelData();
  return (
    <FormField
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
