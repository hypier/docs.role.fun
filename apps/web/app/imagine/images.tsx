"use client";
import { api } from "../../convex/_generated/api";
import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useStablePaginatedQuery } from "../lib/hooks/use-stable-query";
import CharacterCardPlaceholder from "../../components/cards/character-card-placeholder";
import { useTranslation } from "react-i18next";
import useCurrentUser from "../lib/hooks/use-current-user";
import ImageCard from "./image-card";
import { Input } from "@repo/ui/src/components/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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

const formSchema = z.object({
  prompt: z.string().max(256),
  model: z.union([
    z.literal("stable-diffusion-xl-1024-v1-0"),
    z.literal("dalle-3"),
  ]),
});

const Images = () => {
  const { t } = useTranslation();
  const { results, status, loadMore } = useStablePaginatedQuery(
    api.imagine.listImages,
    {},
    { initialNumItems: 10 },
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageId, setImageID] = useState("" as Id<"images">);
  const generate = useMutation(api.imagine.generate);
  const generatedImage = useQuery(
    api.imagine.get,
    imageId ? { imageId } : "skip",
  );
  const allImages = results || [];
  const images = allImages.filter((image) => image.imageUrl);
  const ref = useRef(null);
  const inView = useInView(ref);
  const me = useCurrentUser();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      model: "stable-diffusion-xl-1024-v1-0",
    },
  });

  const onSubmitHandler = async (values: z.infer<typeof formSchema>) => {
    setIsGenerating(true);
    const { prompt, model } = values;
    const image = await generate({ prompt, model });
    setImageID(image);
  };

  useEffect(() => {
    if (generatedImage?.imageUrl) {
      setIsGenerating(false);
    }
  }, [generatedImage]);

  useEffect(() => {
    if (inView) {
      loadMore(10);
    }
  }, [inView, loadMore]);

  return (
    <div className="flex flex-col gap-8">
      <div className="fixed bottom-16 z-10 flex w-full flex-col gap-4 border-t bg-background p-4 lg:static lg:border-none lg:bg-transparent lg:p-0">
        <div className="flex items-center gap-2 lg:pl-0 lg:pr-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitHandler)}
              className="w-full"
            >
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem className="relative w-full">
                    <FormLabel className="flex items-center gap-1 text-xl font-medium">
                      {t("Imagine anything")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="a pixel room for gamer girl"
                        className="w-full truncate"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      className="absolute bottom-1.5 right-1.5 flex h-7 gap-1 text-xs"
                      type="submit"
                    >
                      {isGenerating ? (
                        <>
                          <Spinner />
                          {t("Generating...")}
                        </>
                      ) : (
                        <>
                          {t("Generate")}
                          <Crystal className="h-4 w-4" /> x 25
                        </>
                      )}
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>

      <div className="flex w-full grid-cols-2 flex-col gap-4 px-4 sm:grid md:grid-cols-3 lg:grid-cols-4 lg:pl-0 xl:grid-cols-5">
        {images?.length > 0
          ? images.map((image, index) => (
              <ImageCard
                id={image._id}
                key={image._id}
                imageUrl={image.imageUrl as string}
                model={image.model}
                showRemix={true}
                isNSFW={image?.isNSFW && me?.nsfwPreference !== "allow"}
              />
            ))
          : Array.from({ length: 10 }).map((_, index) => (
              <CharacterCardPlaceholder key={index} />
            ))}
        {status === "LoadingMore" &&
          Array.from({ length: 10 }).map((_, index) => (
            <CharacterCardPlaceholder key={index} />
          ))}
        <div ref={ref} />
      </div>
    </div>
  );
};

export default Images;
