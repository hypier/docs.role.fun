import { Card, CardHeader } from "@repo/ui/src/components";
import { AspectRatio } from "@repo/ui/src/components/aspect-ratio";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import ModelBadge from "../../components/characters/model-badge";

const ImageCard = (props: {
  id: string;
  imageUrl?: string;
  model?: any;
  isDraft?: boolean;
  isNSFW?: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <AspectRatio
      ratio={1 / 1.75}
      className="group h-full w-full place-content-center overflow-hidden rounded-lg duration-200 hover:shadow-lg"
    >
      <Card className="flex h-full w-full items-end rounded-lg p-2">
        <div className="absolute top-4 z-[3] hover:z-[4]">
          <ModelBadge modelName={props.model as string} />
        </div>
        <CardHeader className="relative z-[2] w-full p-4">
          {props.imageUrl && (
            <div className="absolute -bottom-[9px] -left-[10px] h-[calc(100%+2rem)] w-[calc(100%+20px)] rounded-b-lg bg-gradient-to-b from-transparent via-black/60 to-black" />
          )}
        </CardHeader>
        {props.imageUrl && (
          <>
            {props?.isNSFW ? (
              <Image
                src={props.imageUrl}
                alt={""}
                width={7.5}
                height={13}
                quality={50}
                className="pointer-events-none absolute left-0 top-0 h-full w-full rounded-lg object-cover blur-md"
              />
            ) : (
              <Image
                src={props.imageUrl}
                alt={""}
                width={300}
                height={525}
                quality={60}
                className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-full rounded-lg object-cover"
              />
            )}
          </>
        )}
      </Card>
    </AspectRatio>
  );
};

export default ImageCard;
