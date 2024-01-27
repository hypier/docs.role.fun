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

const formSchema = z.object({
  prompt: z.string().max(1024).min(5),
  model: z.union([
    z.literal("stable-diffusion-xl-1024-v1-0"),
    z.literal("charlesmccarthy/animagine-xl"),
    z.literal("daun-io/animagine-xl-v3"),
    z.literal("asiryan/juggernaut-xl-v7"),
    z.literal("dall-e-3"),
    z.literal("pagebrain/dreamshaper-v8"),
  ]),
});

const Images = () => {
  const { t } = useTranslation();
  const searchQuery = useSearchParams();

  const [isGenerating, setIsGenerating] = useState(false);
  const [imageId, setImageID] = useState("" as Id<"images">);
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
      model: "daun-io/animagine-xl-v3",
    },
  });
  const price = useQuery(api.crystals.imageModelPrice, {
    modelName: form.getValues("model"),
  });

  const onSubmitHandler = (values: z.infer<typeof formSchema>) => {
    const { prompt, model } = values;
    const promise = generate({ prompt, model });
    setIsGenerating(true);
    promise
      .then((image) => {
        setImageID(image);
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
      model: (searchQuery.get("model") as any) || "daun-io/animagine-xl-v3",
    });
  }, [searchQuery]);

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
      {me?.name ? (
        <Button className="h-7 gap-1 text-xs" type="submit">
          <>
            {t("Generate")}
            <Crystal className="h-4 w-4" /> x {price}
          </>
        </Button>
      ) : (
        <Link href="/sign-in" className="w-full">
          <Button className="h-7 w-full gap-1 text-xs">{t("Generate")}</Button>
        </Link>
      )}
      <FormMessage />
    </FormItem>
  ));

  return (
    <div className="flex flex-col gap-8">
      <div className="fixed bottom-16 z-10 flex w-full flex-col gap-4 border-t bg-background p-4 lg:static lg:border-none lg:bg-transparent lg:p-0">
        <div className="flex items-center gap-2 lg:pl-0 lg:pr-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitHandler)}
              className="mt-1 flex w-full flex-col gap-4"
              autoFocus
            >
              <div className="flex w-full flex-col items-center gap-2 text-base font-medium lg:text-xl">
                {t("Imagine anything")}
                <ModelSelect form={form} />
              </div>
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => <InputField field={field} />}
              />
            </form>
          </Form>
        </div>
        <span className="text-xs text-muted-foreground underline">
          <Link href="/content-rules">
            By clicking 'Generate', you agree to our content rules. Offending
            content will be removed.
          </Link>
        </span>
      </div>
      <Gallery isGenerating={isGenerating} />
    </div>
  );
};

export default Images;
