import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface KuotaPixelIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "coin" | "ticket";
  size?: number | "sm" | "md" | "lg" | "xl";
  mode?: "svg" | "image";
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/**
 * Pixelated Kuota Icon for Jitu.
 * Represents tryout credits/quota in retro 16-bit pixel art style.
 */
export function KuotaPixelIcon({
  variant = "coin",
  size = "md",
  mode = "svg",
  className,
  ...props
}: KuotaPixelIconProps) {
  const pixelSize = typeof size === "number" ? size : sizeMap[size];

  if (mode === "image") {
    const src =
      variant === "coin"
        ? "/icons/kuota-token-pixel.png"
        : "/icons/kuota-ticket-pixel.png";

    return (
      <span
        className={cn("inline-flex items-center justify-center shrink-0 select-none", className)}
        style={{ width: pixelSize, height: pixelSize }}
        {...props}
      >
        <Image
          src={src}
          alt={`Kuota ${variant}`}
          width={pixelSize}
          height={pixelSize}
          className="rendering-pixelated object-contain"
          unoptimized
        />
      </span>
    );
  }

  // Pure SVG vector pixel art rendering
  return (
    <span
      className={cn("inline-flex items-center justify-center shrink-0 select-none", className)}
      style={{ width: pixelSize, height: pixelSize }}
      {...props}
    >
      {variant === "coin" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={pixelSize}
          height={pixelSize}
          shapeRendering="crispEdges"
          className="w-full h-full"
        >
          <g id="kuota-pixel-coin">
            <rect x="8" y="2" width="8" height="1" fill="#0B1B3F" />
            <rect x="6" y="3" width="2" height="1" fill="#0B1B3F" />
            <rect x="8" y="3" width="6" height="1" fill="#FFF4C2" />
            <rect x="14" y="3" width="2" height="1" fill="#FFD43B" />
            <rect x="16" y="3" width="2" height="1" fill="#0B1B3F" />
            <rect x="5" y="4" width="1" height="1" fill="#0B1B3F" />
            <rect x="6" y="4" width="6" height="1" fill="#FFF4C2" />
            <rect x="12" y="4" width="6" height="1" fill="#FFD43B" />
            <rect x="18" y="4" width="1" height="1" fill="#0B1B3F" />
            <rect x="4" y="5" width="1" height="1" fill="#0B1B3F" />
            <rect x="5" y="5" width="2" height="1" fill="#FFF4C2" />
            <rect x="7" y="5" width="2" height="1" fill="#FFFFFF" />
            <rect x="9" y="5" width="2" height="1" fill="#FFF4C2" />
            <rect x="11" y="5" width="8" height="1" fill="#FFD43B" />
            <rect x="19" y="5" width="1" height="1" fill="#0B1B3F" />
            <rect x="3" y="6" width="1" height="1" fill="#0B1B3F" />
            <rect x="4" y="6" width="2" height="1" fill="#FFF4C2" />
            <rect x="6" y="6" width="2" height="1" fill="#FFFFFF" />
            <rect x="8" y="6" width="2" height="1" fill="#FFF4C2" />
            <rect x="10" y="6" width="2" height="1" fill="#FFD43B" />
            <rect x="12" y="6" width="2" height="1" fill="#1747E8" />
            <rect x="14" y="6" width="6" height="1" fill="#FFD43B" />
            <rect x="20" y="6" width="1" height="1" fill="#7A5C00" />
            <rect x="3" y="7" width="1" height="1" fill="#0B1B3F" />
            <rect x="4" y="7" width="4" height="1" fill="#FFF4C2" />
            <rect x="8" y="7" width="4" height="1" fill="#FFD43B" />
            <rect x="12" y="7" width="2" height="1" fill="#1747E8" />
            <rect x="14" y="7" width="3" height="1" fill="#FFD43B" />
            <rect x="17" y="7" width="2" height="1" fill="#1747E8" />
            <rect x="19" y="7" width="1" height="1" fill="#FFD43B" />
            <rect x="20" y="7" width="1" height="1" fill="#7A5C00" />
            <rect x="2" y="8" width="1" height="1" fill="#0B1B3F" />
            <rect x="3" y="8" width="4" height="1" fill="#FFF4C2" />
            <rect x="7" y="8" width="5" height="1" fill="#FFD43B" />
            <rect x="12" y="8" width="2" height="1" fill="#1747E8" />
            <rect x="14" y="8" width="2" height="1" fill="#FFD43B" />
            <rect x="16" y="8" width="2" height="1" fill="#1747E8" />
            <rect x="18" y="8" width="3" height="1" fill="#FFD43B" />
            <rect x="21" y="8" width="1" height="1" fill="#7A5C00" />
            <rect x="2" y="9" width="1" height="1" fill="#0B1B3F" />
            <rect x="3" y="9" width="4" height="1" fill="#FFF4C2" />
            <rect x="7" y="9" width="5" height="1" fill="#FFD43B" />
            <rect x="12" y="9" width="2" height="1" fill="#1747E8" />
            <rect x="15" y="9" width="1" height="1" fill="#1747E8" />
            <rect x="16" y="9" width="4" height="1" fill="#FFD43B" />
            <rect x="21" y="9" width="1" height="1" fill="#7A5C00" />
            <rect x="2" y="10" width="1" height="1" fill="#0B1B3F" />
            <rect x="3" y="10" width="2" height="1" fill="#FFF4C2" />
            <rect x="5" y="10" width="7" height="1" fill="#FFD43B" />
            <rect x="12" y="10" width="3" height="1" fill="#1747E8" />
            <rect x="15" y="10" width="6" height="1" fill="#FFD43B" />
            <rect x="21" y="10" width="1" height="1" fill="#7A5C00" />
            <rect x="2" y="11" width="1" height="1" fill="#0B1B3F" />
            <rect x="3" y="11" width="2" height="1" fill="#FFF4C2" />
            <rect x="5" y="11" width="7" height="1" fill="#FFD43B" />
            <rect x="12" y="11" width="4" height="1" fill="#1747E8" />
            <rect x="16" y="11" width="5" height="1" fill="#FFD43B" />
            <rect x="21" y="11" width="1" height="1" fill="#7A5C00" />
            <rect x="2" y="12" width="1" height="1" fill="#0B1B3F" />
            <rect x="3" y="12" width="2" height="1" fill="#FFF4C2" />
            <rect x="5" y="12" width="7" height="1" fill="#FFD43B" />
            <rect x="12" y="12" width="3" height="1" fill="#1747E8" />
            <rect x="15" y="12" width="6" height="1" fill="#FFD43B" />
            <rect x="21" y="12" width="1" height="1" fill="#7A5C00" />
            <rect x="2" y="13" width="1" height="1" fill="#0B1B3F" />
            <rect x="3" y="13" width="2" height="1" fill="#FFF4C2" />
            <rect x="5" y="13" width="7" height="1" fill="#FFD43B" />
            <rect x="12" y="13" width="2" height="1" fill="#1747E8" />
            <rect x="15" y="13" width="1" height="1" fill="#1747E8" />
            <rect x="16" y="13" width="4" height="1" fill="#FFD43B" />
            <rect x="21" y="13" width="1" height="1" fill="#7A5C00" />
            <rect x="2" y="14" width="1" height="1" fill="#0B1B3F" />
            <rect x="3" y="14" width="4" height="1" fill="#FFF4C2" />
            <rect x="7" y="14" width="5" height="1" fill="#FFD43B" />
            <rect x="12" y="14" width="2" height="1" fill="#1747E8" />
            <rect x="14" y="14" width="2" height="1" fill="#FFD43B" />
            <rect x="16" y="14" width="2" height="1" fill="#1747E8" />
            <rect x="18" y="14" width="3" height="1" fill="#FFD43B" />
            <rect x="21" y="14" width="1" height="1" fill="#7A5C00" />
            <rect x="2" y="15" width="1" height="1" fill="#0B1B3F" />
            <rect x="3" y="15" width="4" height="1" fill="#FFF4C2" />
            <rect x="7" y="15" width="5" height="1" fill="#FFD43B" />
            <rect x="12" y="15" width="2" height="1" fill="#1747E8" />
            <rect x="14" y="15" width="3" height="1" fill="#FFD43B" />
            <rect x="17" y="15" width="2" height="1" fill="#1747E8" />
            <rect x="19" y="15" width="1" height="1" fill="#FFD43B" />
            <rect x="20" y="15" width="1" height="1" fill="#7A5C00" />
            <rect x="3" y="16" width="1" height="1" fill="#0B1B3F" />
            <rect x="4" y="16" width="8" height="1" fill="#FFD43B" />
            <rect x="12" y="16" width="2" height="1" fill="#1747E8" />
            <rect x="14" y="16" width="6" height="1" fill="#FFD43B" />
            <rect x="20" y="16" width="1" height="1" fill="#7A5C00" />
            <rect x="3" y="17" width="1" height="1" fill="#0B1B3F" />
            <rect x="4" y="17" width="1" height="1" fill="#C99700" />
            <rect x="5" y="17" width="15" height="1" fill="#FFD43B" />
            <rect x="20" y="17" width="1" height="1" fill="#7A5C00" />
            <rect x="4" y="18" width="1" height="1" fill="#0B1B3F" />
            <rect x="5" y="18" width="2" height="1" fill="#C99700" />
            <rect x="7" y="18" width="12" height="1" fill="#FFD43B" />
            <rect x="19" y="18" width="1" height="1" fill="#7A5C00" />
            <rect x="5" y="19" width="1" height="1" fill="#0B1B3F" />
            <rect x="6" y="19" width="12" height="1" fill="#C99700" />
            <rect x="18" y="19" width="1" height="1" fill="#0B1B3F" />
            <rect x="6" y="20" width="2" height="1" fill="#0B1B3F" />
            <rect x="8" y="20" width="8" height="1" fill="#7A5C00" />
            <rect x="16" y="20" width="2" height="1" fill="#0B1B3F" />
            <rect x="8" y="21" width="8" height="1" fill="#0B1B3F" />
          </g>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={pixelSize}
          height={pixelSize}
          shapeRendering="crispEdges"
          className="w-full h-full"
        >
          <g id="kuota-pixel-ticket">
            <rect x="2" y="4" width="20" height="1" fill="#0B1B3F" />
            <rect x="2" y="5" width="1" height="1" fill="#0B1B3F" />
            <rect x="3" y="5" width="2" height="1" fill="#FFFFFF" />
            <rect x="5" y="5" width="8" height="1" fill="#FFF4C2" />
            <rect x="13" y="5" width="1" height="1" fill="#0B1B3F" />
            <rect x="14" y="5" width="7" height="1" fill="#FFD43B" />
            <rect x="21" y="5" width="1" height="1" fill="#0B1B3F" />
            <rect x="2" y="6" width="1" height="1" fill="#0B1B3F" />
            <rect x="3" y="6" width="1" height="1" fill="#FFFFFF" />
            <rect x="4" y="6" width="2" height="1" fill="#FFF4C2" />
            <rect x="6" y="6" width="7" height="1" fill="#FFD43B" />
            <rect x="13" y="6" width="1" height="1" fill="#0B1B3F" />
            <rect x="14" y="6" width="7" height="1" fill="#FFD43B" />
            <rect x="21" y="6" width="1" height="1" fill="#0B1B3F" />
            <rect x="0" y="7" width="3" height="1" fill="#0B1B3F" />
            <rect x="3" y="7" width="2" height="1" fill="#FFF4C2" />
            <rect x="5" y="7" width="8" height="1" fill="#FFD43B" />
            <rect x="14" y="7" width="7" height="1" fill="#FFD43B" />
            <rect x="21" y="7" width="3" height="1" fill="#0B1B3F" />
            <rect x="0" y="8" width="2" height="1" fill="#0B1B3F" />
            <rect x="2" y="8" width="1" height="1" fill="#C99700" />
            <rect x="3" y="8" width="2" height="1" fill="#FFF4C2" />
            <rect x="5" y="8" width="6" height="1" fill="#FFD43B" />
            <rect x="11" y="8" width="2" height="1" fill="#0B1B3F" />
            <rect x="14" y="8" width="2" height="1" fill="#0B1B3F" />
            <rect x="16" y="8" width="4" height="1" fill="#FFD43B" />
            <rect x="20" y="8" width="1" height="1" fill="#C99700" />
            <rect x="21" y="8" width="2" height="1" fill="#0B1B3F" />
            <rect x="0" y="9" width="2" height="1" fill="#0B1B3F" />
            <rect x="2" y="9" width="1" height="1" fill="#C99700" />
            <rect x="3" y="9" width="8" height="1" fill="#FFD43B" />
            <rect x="11" y="9" width="2" height="1" fill="#0B1B3F" />
            <rect x="14" y="9" width="2" height="1" fill="#0B1B3F" />
            <rect x="16" y="9" width="4" height="1" fill="#FFD43B" />
            <rect x="20" y="9" width="1" height="1" fill="#C99700" />
            <rect x="21" y="9" width="2" height="1" fill="#0B1B3F" />
            <rect x="0" y="10" width="3" height="1" fill="#0B1B3F" />
            <rect x="3" y="10" width="10" height="1" fill="#FFD43B" />
            <rect x="14" y="10" width="7" height="1" fill="#FFD43B" />
            <rect x="21" y="10" width="3" height="1" fill="#0B1B3F" />
            <rect x="2" y="11" width="1" height="1" fill="#0B1B3F" />
            <rect x="3" y="11" width="1" height="1" fill="#C99700" />
            <rect x="4" y="11" width="7" height="1" fill="#FFD43B" />
            <rect x="11" y="11" width="1" height="1" fill="#1747E8" />
            <rect x="12" y="11" width="1" height="1" fill="#0B1B3F" />
            <rect x="14" y="11" width="1" height="1" fill="#0B1B3F" />
            <rect x="15" y="11" width="1" height="1" fill="#1747E8" />
            <rect x="16" y="11" width="4" height="1" fill="#FFD43B" />
            <rect x="20" y="11" width="1" height="1" fill="#C99700" />
            <rect x="21" y="11" width="1" height="1" fill="#0B1B3F" />
            <rect x="2" y="12" width="1" height="1" fill="#0B1B3F" />
            <rect x="3" y="12" width="1" height="1" fill="#C99700" />
            <rect x="4" y="12" width="6" height="1" fill="#FFD43B" />
            <rect x="10" y="12" width="2" height="1" fill="#1747E8" />
            <rect x="12" y="12" width="1" height="1" fill="#0B1B3F" />
            <rect x="14" y="12" width="1" height="1" fill="#0B1B3F" />
            <rect x="15" y="12" width="2" height="1" fill="#1747E8" />
            <rect x="17" y="12" width="3" height="1" fill="#FFD43B" />
            <rect x="20" y="12" width="1" height="1" fill="#C99700" />
            <rect x="21" y="12" width="1" height="1" fill="#0B1B3F" />
            <rect x="0" y="13" width="3" height="1" fill="#0B1B3F" />
            <rect x="3" y="13" width="7" height="1" fill="#FFD43B" />
            <rect x="10" y="13" width="6" height="1" fill="#1747E8" />
            <rect x="16" y="13" width="5" height="1" fill="#FFD43B" />
            <rect x="21" y="13" width="3" height="1" fill="#0B1B3F" />
            <rect x="0" y="14" width="2" height="1" fill="#0B1B3F" />
            <rect x="2" y="14" width="1" height="1" fill="#C99700" />
            <rect x="3" y="14" width="7" height="1" fill="#FFD43B" />
            <rect x="10" y="14" width="4" height="1" fill="#0B1B3F" />
            <rect x="14" y="14" width="6" height="1" fill="#FFD43B" />
            <rect x="20" y="14" width="1" height="1" fill="#C99700" />
            <rect x="21" y="14" width="2" height="1" fill="#0B1B3F" />
            <rect x="0" y="15" width="2" height="1" fill="#0B1B3F" />
            <rect x="2" y="15" width="1" height="1" fill="#C99700" />
            <rect x="3" y="15" width="6" height="1" fill="#FFD43B" />
            <rect x="9" y="15" width="6" height="1" fill="#0B1B3F" />
            <rect x="15" y="15" width="5" height="1" fill="#FFD43B" />
            <rect x="20" y="15" width="1" height="1" fill="#C99700" />
            <rect x="21" y="15" width="2" height="1" fill="#0B1B3F" />
            <rect x="0" y="16" width="3" height="1" fill="#0B1B3F" />
            <rect x="3" y="16" width="1" height="1" fill="#C99700" />
            <rect x="4" y="16" width="9" height="1" fill="#FFD43B" />
            <rect x="14" y="16" width="6" height="1" fill="#FFD43B" />
            <rect x="20" y="16" width="1" height="1" fill="#C99700" />
            <rect x="21" y="16" width="3" height="1" fill="#0B1B3F" />
            <rect x="2" y="17" width="1" height="1" fill="#0B1B3F" />
            <rect x="3" y="17" width="2" height="1" fill="#C99700" />
            <rect x="5" y="17" width="8" height="1" fill="#FFD43B" />
            <rect x="13" y="17" width="1" height="1" fill="#0B1B3F" />
            <rect x="14" y="17" width="6" height="1" fill="#FFD43B" />
            <rect x="20" y="17" width="1" height="1" fill="#C99700" />
            <rect x="21" y="17" width="1" height="1" fill="#0B1B3F" />
            <rect x="2" y="18" width="1" height="1" fill="#0B1B3F" />
            <rect x="3" y="18" width="2" height="1" fill="#7A5C00" />
            <rect x="5" y="18" width="8" height="1" fill="#C99700" />
            <rect x="13" y="18" width="1" height="1" fill="#0B1B3F" />
            <rect x="14" y="18" width="4" height="1" fill="#C99700" />
            <rect x="18" y="18" width="2" height="1" fill="#7A5C00" />
            <rect x="20" y="18" width="1" height="1" fill="#C99700" />
            <rect x="21" y="18" width="1" height="1" fill="#0B1B3F" />
            <rect x="2" y="19" width="20" height="1" fill="#0B1B3F" />
          </g>
        </svg>
      )}
    </span>
  );
}
export { KuotaPixelIcon as CoinPixelIcon, KuotaPixelIcon as CoinsPixelIcon, KuotaPixelIcon as PixelCoinIcon };
export default KuotaPixelIcon;
