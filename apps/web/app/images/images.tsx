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
import Spinner from "@repo/ui/src/components/spinner";
import { Crystal } from "@repo/ui/src/components/icons";
import { Id } from "../../convex/_generated/dataModel";
import React from "react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import Gallery from "./gallery";
import { ModelSelect } from "./model-select";
import Link from "next/link";

const formSchema = z.object({
  prompt: z.string().max(512),
  model: z.union([
    z.literal("stable-diffusion-xl-1024-v1-0"),
    z.literal("charlesmccarthy/animagine-xl"),
    z.literal("cagliostrolab/animagine-xl-3.0"),
    z.literal("asiryan/juggernaut-xl-v7"),
    z.literal("dall-e-3"),
  ]),
});

const Images = () => {
  const { t } = useTranslation();

  const [isGenerating, setIsGenerating] = useState(false);
  const [imageId, setImageID] = useState("" as Id<"images">);
  const generate = useMutation(api.images.generate);
  const generatedImage = useQuery(
    api.images.get,
    imageId ? { imageId } : "skip",
  );
  const me = useCurrentUser();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      model: "charlesmccarthy/animagine-xl",
    },
  });
  const price = useQuery(api.crystals.imageModelPrice, {
    modelName: form.getValues("model"),
  });

  const onSubmitHandler = (values: z.infer<typeof formSchema>) => {
    const { prompt, model } = values;
    const promise = generate({ prompt, model });
    setIsGenerating(true);
    toast.promise(promise, {
      loading: "Generating image...",
      success: (image) => {
        setImageID(image);
        return "Your request has been queued";
      },
      error: (error) => {
        setIsGenerating(false);
        return error instanceof ConvexError
          ? (error.data as { message: string }).message
          : "Unexpected error occurred";
      },
    });
  };

  useEffect(() => {
    if (generatedImage?.imageUrl) {
      setIsGenerating(false);
    }
  }, [generatedImage]);

  const InputField = React.memo(({ field }: { field: any }) => (
    <FormItem className="relative w-full">
      <FormControl>
        <Input
          placeholder="a pixel room for gamer girl"
          className="w-full truncate"
          {...field}
          autoFocus
        />
      </FormControl>
      {me?.name ? (
        <Button
          className="absolute bottom-1.5 right-1.5 flex h-7 gap-1 text-xs"
          type="submit"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Spinner />
              {t("Generating...")}
            </>
          ) : (
            <>
              {t("Generate")}
              <Crystal className="h-4 w-4" /> x {price}
            </>
          )}
        </Button>
      ) : (
        <Link href="/sign-in">
          <Button className="absolute bottom-1.5 right-1.5 flex h-7 gap-1 text-xs">
            {t("Generate")}
          </Button>
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
                <ModelSelect form={form} model={form.getValues("model")} />
              </div>
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => <InputField field={field} />}
              />
            </form>
          </Form>
        </div>
      </div>
      <Gallery isGenerating={isGenerating} />
    </div>
  );
};

export default Images;
