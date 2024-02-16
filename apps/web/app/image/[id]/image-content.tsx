"use client";

import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  Tooltip,
  TooltipContent,
} from "@repo/ui/src/components";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Images from "../../images/images";
import { useStableQuery } from "../../lib/hooks/use-stable-query";
import useAllModels from "../../lib/hooks/use-all-models";
import { Label } from "@repo/ui/src/components/label";
import { ClipboardIcon, Download, Plus, Repeat } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import Link from "next/link";

type Props = {
  params: { id: string };
};

const ImageContent = ({ params }: Props) => {
  const image = useStableQuery(api.images.get, {
    imageId: params.id as Id<"images">,
  });
  const creatorName = useStableQuery(
    api.users.getUsername,
    image?.creatorId
      ? {
          id: image?.creatorId as Id<"users">,
        }
      : "skip",
  );
  const modelData = useAllModels();
  const modelInfo =
    modelData?.find((item: any) => item.value === image?.model) || {};

  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col gap-8">
      {image && (
        <Card className="flex w-fit flex-col items-center justify-center self-center">
          <CardHeader>
            {image?.title
              ? image?.title
              : image.prompt.split(" ").slice(0, 5).join(" ") +
                " " +
                t("AI Image")}
          </CardHeader>
          <CardFooter className="flex flex-col items-center gap-4 p-4 text-sm lg:flex-row lg:items-start">
            {image.imageUrl && (
              <img
                src={image.imageUrl}
                alt={image.prompt}
                className="h-[30rem] w-[20rem] rounded-lg object-cover"
              />
            )}
            <div className="flex w-full flex-col gap-8 text-center text-muted-foreground lg:text-start">
              <div className="flex w-full flex-col gap-2">
                <Label className="text-foreground">Prompt</Label>
                {image?.prompt}
                <div className="grid w-full grid-cols-3 justify-between gap-2">
                  <Tooltip content={"Create new image by remixing this image"}>
                    <Link
                      href={`/images?prompt=${image.prompt}&model=${image.model}`}
                      className="w-full"
                    >
                      <Button className="w-full gap-1" variant="outline">
                        <Repeat className="h-4 w-4" />
                        {t("Remix")}
                      </Button>
                    </Link>
                  </Tooltip>
                  <Tooltip content={"Create character using this image"}>
                    <Link
                      href={`/my-characters/create?cardImageUrl=${image.imageUrl}`}
                      className="w-full"
                    >
                      <Button className="w-full gap-1" variant="outline">
                        <Plus className="h-4 w-4" />
                        {t("New Character")}
                      </Button>
                    </Link>
                  </Tooltip>
                  {image.imageUrl && (
                    <a
                      href={image.imageUrl}
                      download={true}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Button className="h-7 w-full gap-1" variant="outline">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </a>
                  )}
                </div>
                <Button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(image.prompt);
                      toast.success("Copied to clipboard");
                    } catch (err) {
                      toast.error("Failed to copy text");
                    }
                  }}
                  className="flex gap-1"
                >
                  <ClipboardIcon className="h-4 w-4" />
                  Copy Prompt
                </Button>
              </div>
              <div className="flex w-full flex-col gap-2">
                <Label className="text-foreground">Model</Label>
                <p>{modelInfo.description || image?.model}</p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <Label className="text-foreground">Created by</Label>
                <p>@{creatorName}</p>
              </div>
            </div>
          </CardFooter>
        </Card>
      )}
      <Images />
    </div>
  );
};

export default ImageContent;
