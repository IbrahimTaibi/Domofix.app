import Link from "next/link";
import { brandFont } from "@/shared/utils/fonts";

type LogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function Logo({ href = "/", size = "md", className = "" }: LogoProps) {
  const iconSize =
    size === "lg"
      ? "w-10 h-10 md:w-11 md:h-11"
      : size === "sm"
        ? "w-7 h-7"
        : "w-9 h-9";
  const iconTextSize =
    size === "lg"
      ? "text-xl md:text-2xl"
      : size === "sm"
        ? "text-base"
        : "text-lg";

  const content = (
    <div
      className={`${iconSize} bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm ${className}`}>
      <span
        className={`${brandFont.className} ${iconTextSize} text-white font-bold`}>
        D
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} prefetch={false} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
