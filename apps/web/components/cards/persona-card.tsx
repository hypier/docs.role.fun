import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components";
import { AspectRatio } from "@repo/ui/src/components/aspect-ratio";
import { Badge } from "@repo/ui/src/components/badge";
import Image from "next/image";

const PersonaCard = (props: {
  id: string;
  name: any;
  cardImageUrl?: string;
  description: any;
  onEdit?: any;
  isDefault?: boolean;
}) => {
  return (
    <AspectRatio
      ratio={1 / 1.75}
      className="group h-full w-full place-content-center rounded-lg shadow duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <Card className="flex h-full w-full items-end rounded-lg p-2">
        {props.onEdit && (
          <Button
            className="absolute right-4 top-4 z-[3] h-8 rounded-full"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              props.onEdit();
            }}
          >
            Edit
          </Button>
        )}
        <CardHeader className="relative z-[2] w-full p-4">
          {props.cardImageUrl && (
            <div className="absolute -bottom-2 -left-2 h-[calc(100%+2rem)] w-[calc(100%+16px)] rounded-b-lg bg-gradient-to-b from-transparent via-black/60 to-black" />
          )}
          <CardTitle
            className={`${
              props.cardImageUrl ? "text-white" : "text-black"
            } z-[3] line-clamp-1 flex select-none justify-between text-lg duration-200 group-hover:opacity-80`}
          >
            <div className="w-[80%] truncate">{props.name}</div>
            {props.isDefault && <Badge>Default</Badge>}
          </CardTitle>
          <CardDescription
            className={`${
              props.cardImageUrl ? "text-white" : "text-black"
            } z-[3] line-clamp-3 select-none text-xs duration-200 group-hover:opacity-80`}
          >
            {props.description}
          </CardDescription>
        </CardHeader>
        {props.cardImageUrl && (
          <Image
            src={props.cardImageUrl}
            alt={""}
            width={300}
            height={525}
            quality={60}
            className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-full rounded-lg object-cover"
          />
        )}
      </Card>
    </AspectRatio>
  );
};

export default PersonaCard;
