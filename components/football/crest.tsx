import Image from "next/image";
import { cn } from "@/lib/utils";

type CrestProps = { src: string | null; alt: string; size?: number; className?: string };

function initial(alt: string) {
  return alt.trim().charAt(0).toUpperCase() || "F";
}

export function Crest({ alt, className, size = 32, src }: CrestProps) {
  if (src) {
    return <Image src={src} alt={alt} width={size} height={size} className={cn("object-contain", className)} />;
  }

  return (
    <span
      aria-label={alt}
      className={cn("grid shrink-0 place-items-center rounded bg-surface-raised font-display font-semibold text-floodlight", className)}
      style={{ width: size, height: size }}
    >
      {initial(alt)}
    </span>
  );
}
