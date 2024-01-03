import Link from "next/link";
import useCurrentUser from "./lib/hooks/use-current-user";
import { Crystal } from "@repo/ui/src/components/icons";

const CurrentCrystals = () => {
  const currentUser = useCurrentUser();
  const crystals = currentUser?.crystals;
  return (
    <Link href="/shop">
      <div
        className={`text-xs font-medium flex gap-0.5 ${
          crystals < 10 ? " text-rose-500 " : ""
        }`}
      >
        <Crystal className="w-4 h-4" />
        {crystals}
      </div>
    </Link>
  );
};

export default CurrentCrystals;
