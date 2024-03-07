"use client";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useCurrentUser from "../lib/hooks/use-current-user";
import { Input } from "@repo/ui/src/components/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Form,
} from "@repo/ui/src/components/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@repo/ui/src/components";
import { useMutation, useQuery } from "convex/react";
import { Crystal } from "@repo/ui/src/components/icons";
import React from "react";
import { toast } from "sonner";
import Gallery from "./gallery";
import { ModelSelect } from "./model-select";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCrystalDialog } from "../lib/hooks/use-crystal-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/src/components/collapsible";
import { ChevronDown, Lock, Unlock } from "lucide-react";
import { Toggle } from "@repo/ui/src/components/toggle";
import { usePostHog } from "posthog-js/react";
import { useImageStore } from "../lib/hooks/use-image-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/components/select";

const formSchema = z.object({
  prompt: z.string().max(1024).min(5),
  model: z.union([
    z.literal("stable-diffusion-xl-1024-v1-0"),
    z.literal("asiryan/meina-mix-v11"),
    z.literal("asiryan/blue-pencil-xl-v2"),
    z.literal("charlesmccarthy/animagine-xl"),
    z.literal("daun-io/openroleplay.ai-animagine-v3"),
    z.literal("asiryan/juggernaut-xl-v7"),
    z.literal("dall-e-3"),
    z.literal("pagebrain/dreamshaper-v8"),
    z.literal("lucataco/sdxl-lightning-4step"),
  ]),
  isPrivate: z.boolean(),
});

const Images = () => {
  const { t } = useTranslation();
  const searchQuery = useSearchParams();
  const isMy = searchQuery.get("isMy");
  const posthog = usePostHog();

  const { setImageId, setIsGenerating } = useImageStore();
  const { openDialog } = useCrystalDialog();
  const generate = useMutation(api.images.generate);

  const me = useCurrentUser();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: searchQuery.get("prompt") || "",
      model: "asiryan/blue-pencil-xl-v2",
      isPrivate: isMy ? true : false,
    },
  });
  const price = useQuery(api.crystals.imageModelPrice, {
    modelName: form.getValues("model"),
  }) as number;
  const onSubmitHandler = (
    values: z.infer<typeof formSchema>,
    showToast: boolean = true,
  ) => {
    const { prompt, model, isPrivate } = values;
    const promise = generate({ prompt, model, isPrivate });
    posthog.capture("imagine");
    setIsGenerating(true);
    promise
      .then((image) => {
        setImageId(image);
        if (showToast) {
          toast.success("Your request has been queued");
        }
      })
      .catch((error) => {
        setIsGenerating(false);
        openDialog();
      });
  };

  useEffect(() => {
    form.reset({
      prompt: searchQuery.get("prompt") || "",
      model: (searchQuery.get("model") as any) || "asiryan/blue-pencil-xl-v2",
    });
  }, [searchQuery]);
  const isPlus = me?.subscriptionTier === "plus";

  const InputField = React.memo(({ field }: { field: any }) => (
    <FormItem className="flex w-full flex-col">
      <FormControl>
        <Input
          placeholder="Self-portrait of an AI"
          className="w-full truncate"
          {...field}
          autoFocus
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  ));
  const [selectedImages, setSelectedImages] = useState("2");
  const ToggleField = React.memo(({ field }: { field: any }) => {
    return (
      <div className="flex w-full flex-col justify-between gap-1">
        <div className="flex items-center gap-1">
          {me?.name ? (
            <Button
              className="w-full gap-1 text-xs"
              variant="cta"
              type="submit"
              onClick={() => {
                for (let i = 0; i < Number(selectedImages); i++) {
                  onSubmitHandler(form.getValues(), i === 0 ? true : false);
                }
              }}
            >
              {t("Generate")}
              <Crystal className="h-4 w-4" /> x{" "}
              {field.value
                ? isPlus
                  ? price * Number(selectedImages)
                  : price * 2 * Number(selectedImages)
                : price * Number(selectedImages)}
            </Button>
          ) : (
            <Link href="/sign-in" className="w-full">
              <Button className="w-full gap-1 text-xs">{t("Generate")}</Button>
            </Link>
          )}
          <Select
            value={selectedImages.toString()}
            onValueChange={(value: string) => setSelectedImages(value)}
          >
            <SelectTrigger className="h-8 max-w-fit bg-background text-xs font-normal">
              <SelectValue placeholder={t("Select number of images")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"1"}>1 Image</SelectItem>
              <SelectItem value={"2"}>2 Images</SelectItem>
              <SelectItem value={"4"}>4 Images</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  });

  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col gap-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="fixed bottom-20 z-10 flex w-full flex-col gap-4 rounded-t-xl border-t bg-background/90 p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.36)] backdrop-blur lg:static lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none">
          <CollapsibleTrigger className="flex w-full items-center justify-center gap-2">
            {isMy ? t("My Images") : t("Imagine anything")}
            <ChevronDown
              className={`h-4 w-4 ${
                isOpen ? "" : "-rotate-90"
              } text-muted-foreground duration-200`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex items-center gap-2 lg:pl-0 lg:pr-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((value) =>
                    onSubmitHandler(value),
                  )}
                  className="mt-1 flex w-full flex-col items-center gap-4"
                  autoFocus
                >
                  <ModelSelect form={form} />
                  <div className="flex w-full flex-col gap-4">
                    <FormField
                      control={form.control}
                      name="prompt"
                      render={({ field }) => <InputField field={field} />}
                    />

                    <FormField
                      control={form.control}
                      name="isPrivate"
                      render={({ field }) => <ToggleField field={field} />}
                    />
                  </div>
                </form>
              </Form>
            </div>
            <div className="w-full pt-2 text-center">
              <span className="text-xs text-muted-foreground underline">
                <Link href="/empty-canvas">
                  <span>
                    {t("Or, generate stunning images at Empty Canvas")}
                  </span>
                </Link>
              </span>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <Gallery isMy={Boolean(isMy)} />
    </div>
  );
};

export default Images;
