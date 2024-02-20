import { Card } from "@repo/ui/src/components";
import { AspectRatio } from "@repo/ui/src/components/aspect-ratio";

const CharacterCardPlaceholder = ({ ratio = 1 / 1.5 }: { ratio?: number }) => {
  return (
    <AspectRatio
      ratio={ratio}
      className="group h-full w-full place-content-center rounded-xl duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <Card className="flex h-full w-full items-end rounded-xl p-2">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-full rounded-xl bg-muted object-cover" />
      </Card>
    </AspectRatio>
  );
};

export default CharacterCardPlaceholder;
