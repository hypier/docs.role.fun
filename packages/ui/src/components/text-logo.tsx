import useMediaQuery from "../hooks/use-media-query";

export default function TextLogo({ className }: { className?: string }) {
  const { isMobile } = useMediaQuery();
  return (
    <span
      className={`flex items-center font-medium ${className} hover:opacity-50`}
    >
      {isMobile ? "ORP" : "openroleplay.ai"}
    </span>
  );
}
