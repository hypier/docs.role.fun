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
import { Id } from "../../convex/_generated/dataModel";
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

const formSchema = z.object({
  prompt: z.string().max(1024).min(5),
  model: z.union([
    z.literal("stable-diffusion-xl-1024-v1-0"),
    z.literal("charlesmccarthy/animagine-xl"),
    z.literal("daun-io/openroleplay.ai-animagine-v3"),
    z.literal("asiryan/juggernaut-xl-v7"),
    z.literal("dall-e-3"),
    z.literal("pagebrain/dreamshaper-v8"),
  ]),
  isPrivate: z.boolean(),
});

const Images = () => {
  const { t } = useTranslation();
  const searchQuery = useSearchParams();
  const isMy = searchQuery.get("isMy");
  const posthog = usePostHog();

  const { imageId, setImageId, isGenerating, setIsGenerating } =
    useImageStore();
  const { openDialog } = useCrystalDialog();
  const generate = useMutation(api.images.generate);
  const generatedImage = useQuery(
    api.images.get,
    imageId ? { imageId } : "skip",
  );
  const me = useCurrentUser();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: searchQuery.get("prompt") || "",
      model: "daun-io/openroleplay.ai-animagine-v3",
      isPrivate: isMy ? true : false,
    },
  });
  const price = useQuery(api.crystals.imageModelPrice, {
    modelName: form.getValues("model"),
  }) as number;

  const onSubmitHandler = (values: z.infer<typeof formSchema>) => {
    const { prompt, model, isPrivate } = values;
    const promise = generate({ prompt, model, isPrivate });
    posthog.capture("imagine");
    setIsGenerating(true);
    promise
      .then((image) => {
        setImageId(image);
        toast.success("Your request has been queued");
      })
      .catch((error) => {
        setIsGenerating(false);
        openDialog();
      });
  };

  useEffect(() => {
    if (generatedImage?.imageUrl) {
      setIsGenerating(false);
    }
  }, [generatedImage]);

  useEffect(() => {
    form.reset({
      prompt: searchQuery.get("prompt") || "",
      model:
        (searchQuery.get("model") as any) ||
        "daun-io/openroleplay.ai-animagine-v3",
    });
  }, [searchQuery]);
  const isPlus = me?.subscriptionTier === "plus";

  const InputField = React.memo(({ field }: { field: any }) => (
    <FormItem className="flex w-full flex-col">
      <FormControl>
        <Input
          placeholder="a pixel room for gamer girl"
          className="w-full truncate"
          {...field}
          autoFocus
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  ));
  const ToggleField = React.memo(({ field }: { field: any }) => (
    <div className="flex w-full justify-between gap-1">
      {me?.name ? (
        <Button className="h-7 w-full gap-1 text-xs" type="submit">
          <>
            {t("Generate")}
            <Crystal className="h-4 w-4" /> x{" "}
            {field.value ? (isPlus ? price : price * 2) : price}
          </>
        </Button>
      ) : (
        <Link href="/sign-in" className="w-full">
          <Button className="h-7 w-full gap-1 text-xs">{t("Generate")}</Button>
        </Link>
      )}
      <Toggle
        className="h-7 gap-1 text-xs"
        variant="outline"
        pressed={field.value}
        onPressedChange={field.onChange}
      >
        {field.value ? (
          <>
            <Lock className="h-4 w-4 p-0.5" /> {t("Private")}
          </>
        ) : (
          <>
            <Unlock className="h-4 w-4 p-0.5" /> {t("Public")}
          </>
        )}
      </Toggle>
    </div>
  ));

  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col gap-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="fixed bottom-16 z-10 flex w-full flex-col gap-4 border-t bg-background p-4 lg:static lg:border-none lg:bg-transparent lg:p-0">
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
                  onSubmit={form.handleSubmit(onSubmitHandler)}
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
            <span className="text-xs text-muted-foreground underline">
              <Link href="/content-rules">
                By clicking 'Generate', you agree to our content rules.
                Offending content will be removed.
              </Link>
            </span>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <Gallery isGenerating={isGenerating} isMy={Boolean(isMy)} />
    </div>
  );
};

export default Images;
