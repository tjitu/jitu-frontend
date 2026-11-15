import * as React from "react";
import { cn } from "@/lib/utils";

export interface PixelBookIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

/**
 * Pixelated Book Icon for Jitu.
 * Renders an authentic retro 16-bit open book with amber cover and red bookmark ribbon.
 * Designed with crisp vector pixel art (shapeRendering="crispEdges") without using blue.
 */
export function PixelBookIcon({
  size = 24,
  className,
  ...props
}: PixelBookIconProps) {
  // 20x16 pixel art
  const width = size;
  const height = Math.round((size * 16) / 20);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 16"
      width={width}
      height={height}
      shapeRendering="crispEdges"
      className={cn("inline-block shrink-0 select-none", className)}
      aria-hidden="true"
      {...props}
    >
      <g id="pixel-book">
        {/* Outline & Page Top Curves */}
        <rect x="4" y="0" width="4" height="1" fill="#18181B" />
        <rect x="12" y="0" width="4" height="1" fill="#18181B" />
        <rect x="2" y="1" width="2" height="1" fill="#18181B" />
        <rect x="4" y="1" width="4" height="1" fill="#FFFFFF" />
        <rect x="8" y="1" width="1" height="1" fill="#18181B" />
        <rect x="11" y="1" width="1" height="1" fill="#18181B" />
        <rect x="12" y="1" width="4" height="1" fill="#FFFFFF" />
        <rect x="16" y="1" width="2" height="1" fill="#18181B" />

        {/* Row 2 */}
        <rect x="1" y="2" width="1" height="1" fill="#18181B" />
        <rect x="2" y="2" width="2" height="1" fill="#FFFFFF" />
        <rect x="4" y="2" width="4" height="1" fill="#FFFBEB" />
        <rect x="8" y="2" width="1" height="1" fill="#FFFFFF" />
        <rect x="9" y="2" width="2" height="1" fill="#18181B" />
        <rect x="11" y="2" width="1" height="1" fill="#FFFFFF" />
        <rect x="12" y="2" width="4" height="1" fill="#FFFBEB" />
        <rect x="16" y="2" width="2" height="1" fill="#FFFFFF" />
        <rect x="18" y="2" width="1" height="1" fill="#18181B" />

        {/* Row 3 - Text lines */}
        <rect x="0" y="3" width="1" height="1" fill="#18181B" />
        <rect x="1" y="3" width="2" height="1" fill="#FFFFFF" />
        <rect x="3" y="3" width="4" height="1" fill="#94A3B8" />
        <rect x="7" y="3" width="2" height="1" fill="#FFFFFF" />
        <rect x="9" y="3" width="2" height="1" fill="#18181B" />
        <rect x="11" y="3" width="2" height="1" fill="#FFFFFF" />
        <rect x="13" y="3" width="4" height="1" fill="#94A3B8" />
        <rect x="17" y="3" width="2" height="1" fill="#FFFFFF" />
        <rect x="19" y="3" width="1" height="1" fill="#18181B" />

        {/* Row 4 - Page body */}
        <rect x="0" y="4" width="1" height="1" fill="#18181B" />
        <rect x="1" y="4" width="8" height="1" fill="#FFFFFF" />
        <rect x="9" y="4" width="2" height="1" fill="#18181B" />
        <rect x="11" y="4" width="8" height="1" fill="#FFFFFF" />
        <rect x="19" y="4" width="1" height="1" fill="#18181B" />

        {/* Row 5 - Text lines & Red bookmark ribbon */}
        <rect x="0" y="5" width="1" height="1" fill="#18181B" />
        <rect x="1" y="5" width="2" height="1" fill="#FFFFFF" />
        <rect x="3" y="5" width="4" height="1" fill="#94A3B8" />
        <rect x="7" y="5" width="2" height="1" fill="#FFFFFF" />
        <rect x="9" y="5" width="1" height="1" fill="#18181B" />
        <rect x="10" y="5" width="1" height="1" fill="#EF4444" />
        <rect x="11" y="5" width="2" height="1" fill="#FFFFFF" />
        <rect x="13" y="5" width="4" height="1" fill="#94A3B8" />
        <rect x="17" y="5" width="2" height="1" fill="#FFFFFF" />
        <rect x="19" y="5" width="1" height="1" fill="#18181B" />

        {/* Row 6 */}
        <rect x="0" y="6" width="1" height="1" fill="#18181B" />
        <rect x="1" y="6" width="8" height="1" fill="#FFFFFF" />
        <rect x="9" y="6" width="1" height="1" fill="#18181B" />
        <rect x="10" y="6" width="1" height="1" fill="#EF4444" />
        <rect x="11" y="6" width="8" height="1" fill="#FFFFFF" />
        <rect x="19" y="6" width="1" height="1" fill="#18181B" />

        {/* Row 7 - Text lines */}
        <rect x="0" y="7" width="1" height="1" fill="#18181B" />
        <rect x="1" y="7" width="2" height="1" fill="#FFFFFF" />
        <rect x="3" y="7" width="4" height="1" fill="#94A3B8" />
        <rect x="7" y="7" width="2" height="1" fill="#FFFFFF" />
        <rect x="9" y="7" width="1" height="1" fill="#18181B" />
        <rect x="10" y="7" width="1" height="1" fill="#EF4444" />
        <rect x="11" y="7" width="2" height="1" fill="#FFFFFF" />
        <rect x="13" y="7" width="4" height="1" fill="#94A3B8" />
        <rect x="17" y="7" width="2" height="1" fill="#FFFFFF" />
        <rect x="19" y="7" width="1" height="1" fill="#18181B" />

        {/* Row 8 */}
        <rect x="0" y="8" width="1" height="1" fill="#18181B" />
        <rect x="1" y="8" width="8" height="1" fill="#FFFFFF" />
        <rect x="9" y="8" width="1" height="1" fill="#18181B" />
        <rect x="10" y="8" width="1" height="1" fill="#EF4444" />
        <rect x="11" y="8" width="8" height="1" fill="#FFFFFF" />
        <rect x="19" y="8" width="1" height="1" fill="#18181B" />

        {/* Row 9 - Warm Amber cover bottom border */}
        <rect x="1" y="9" width="1" height="1" fill="#18181B" />
        <rect x="2" y="9" width="5" height="1" fill="#D97706" />
        <rect x="7" y="9" width="1" height="1" fill="#FEF3C7" />
        <rect x="8" y="9" width="1" height="1" fill="#FFFFFF" />
        <rect x="9" y="9" width="1" height="1" fill="#18181B" />
        <rect x="10" y="9" width="1" height="1" fill="#EF4444" />
        <rect x="11" y="9" width="1" height="1" fill="#FFFFFF" />
        <rect x="12" y="9" width="1" height="1" fill="#FEF3C7" />
        <rect x="13" y="9" width="5" height="1" fill="#D97706" />
        <rect x="18" y="9" width="1" height="1" fill="#18181B" />

        {/* Row 10 - Bottom edge outline & ribbon */}
        <rect x="2" y="10" width="7" height="1" fill="#18181B" />
        <rect x="10" y="10" width="1" height="1" fill="#EF4444" />
        <rect x="12" y="10" width="6" height="1" fill="#18181B" />

        {/* Row 11-12 - Ribbon tip hanging down */}
        <rect x="9" y="11" width="2" height="1" fill="#EF4444" />
        <rect x="10" y="12" width="1" height="1" fill="#EF4444" />
      </g>
    </svg>
  );
}

export default PixelBookIcon;
