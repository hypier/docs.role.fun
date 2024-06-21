export default function TextLogo({
  className,
  isPlus,
}: {
  className?: string;
  isPlus?: boolean;
}) {
  return (
    <span
      className={`flex items-center font-medium ${className} hover:opacity-50`}
    >
      <span className="lg:hidden">{`ORP${isPlus ? "+" : ""}`}</span>
      <span className="hidden lg:inline">{`RoleFun${
        isPlus ? "+" : ""
      }`}</span>
    </span>
  );
}
