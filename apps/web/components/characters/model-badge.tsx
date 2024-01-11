import { Badge } from "@repo/ui/src/components/badge";
import { useQuery } from "convex/react";
import { AlertCircle, Package, Sparkles } from "lucide-react";
import { Crystal } from "@repo/ui/src/components/icons";
import Image from "next/image";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import useModelData from "../../app/lib/hooks/use-model-data";

const ModelBadge = ({
  modelName,
  showCredits,
}: {
  modelName: string;
  showCredits?: boolean;
}) => {
  const model = modelName
    ? modelName.replace("accounts/fireworks/models/", "")
    : "gpt-3.5-turbo-1106";
  const modelData = useModelData();
  const price = useQuery(api.crystals.price, { modelName: model });
  const crystalUnit = showCredits && price && (
    <div className="flex gap-[0.5]">
      /<Crystal className="h-4 w-4 p-0.5" />
      {`x ${price}`}
    </div>
  );
  const modelInfo = modelData.find((item: any) => item.value === model) || {};
  const { src, alt, isNSFW } = modelInfo;

  return (
    <Link href={`/?model=${model}`}>
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
          <span className="text-yellow-500">18+</span>
        ) : (
          <Package className="h-4 w-4 p-0.5 text-white" />
        )}
        <span className="hidden group-hover/badge:inline">{model}</span>
        {crystalUnit}
      </Badge>
    </Link>
  );
};

export default ModelBadge;
