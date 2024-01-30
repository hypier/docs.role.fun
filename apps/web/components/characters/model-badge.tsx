import { Badge } from "@repo/ui/src/components/badge";
import { FilterX, Package } from "lucide-react";
import { Crystal } from "@repo/ui/src/components/icons";
import Image from "next/image";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { Tooltip } from "@repo/ui/src/components";
import { useStableQuery } from "../../app/lib/hooks/use-stable-query";
import useAllModels from "../../app/lib/hooks/use-all-models";

const ModelBadge = ({
  modelName,
  showCredits,
  collapse = true,
}: {
  modelName: string;
  showCredits?: boolean;
  collapse?: boolean;
}) => {
  const model = modelName
    ? modelName
        .replace("accounts/fireworks/models/", "")
        .replace("openrouter/auto", "auto")
    : "gpt-3.5-turbo-1106";
  const modelData = useAllModels();
  const modelInfo = modelData?.find((item: any) => item.value === model) || {};
  const price = modelInfo?.crystalPrice;
  const crystalUnit = showCredits && price && (
    <div className="flex gap-[0.5]">
      /<Crystal className="h-4 w-4 p-0.5" />
      {`x ${price}`}
    </div>
  );
  const { src, alt, isNSFW } = modelInfo;

  const tooltipContent = isNSFW
    ? "This model is uncensored. By interacting this model, you confirm you are over the age of 18."
    : modelInfo?.description;

  const badge = (
    <Badge className="group/badge flex w-fit gap-1" variant="model">
      {src ? (
        <Image
          src={src}
          width={32}
          height={32}
          className="h-4 w-4 p-0.5"
          alt={alt}
        />
      ) : isNSFW ? (
        <FilterX className="h-4 w-4 p-0.5 text-yellow-500" />
      ) : (
        <Package className="h-4 w-4 p-0.5 text-white" />
      )}
      <span className={collapse ? "hidden group-hover/badge:inline" : ""}>
        {modelInfo.description || model}
      </span>
      {price ? (
        crystalUnit
      ) : price === 0 ? (
        <span className="text-teal-500">free</span>
      ) : (
        <></>
      )}
    </Badge>
  );

  return tooltipContent ? (
    <Tooltip content={tooltipContent} desktopOnly>
      <Link href={`/?model=${model}`}>{badge}</Link>
    </Tooltip>
  ) : (
    <Link href={`/?model=${model}`}>{badge}</Link>
  );
};

export default ModelBadge;
