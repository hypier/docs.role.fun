import useMediaQuery from "../hooks/use-media-query";

export default function TextLogo({
  className,
  isPlus,
}: {
  className?: string;
  isPlus?: boolean;
}) {
  const { isMobile } = useMediaQuery();
  return (
    <span
      className={`flex items-center font-medium ${className} hover:opacity-50`}
    >
      {isMobile
        ? `ORP${isPlus ? "+" : ""}`
        : `openroleplay.ai${isPlus ? "+" : ""}`}
    </span>
  );
}
