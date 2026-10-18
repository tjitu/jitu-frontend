import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface PixelCoinProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  glow?: boolean;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 36,
  xl: 48,
  "2xl": 64,
};

/**
 * Pixelated Yellow Coin for Jitu.
 * Renders authentic retro 16-bit pixelated golden coins.
 */
export function PixelCoin({
  size = "md",
  className,
  glow = false,
  ...props
}: PixelCoinProps) {
  const pixelSize = typeof size === "number" ? size : sizeMap[size] || 24;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 select-none",
        glow && "drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]",
        className,
      )}
      style={{ width: pixelSize, height: pixelSize }}
      {...props}
    >
      <Image
        src="/icons/coin-pixel-128.png"
        alt="Yellow Pixel Coin"
        width={pixelSize}
        height={pixelSize}
        className="rendering-pixelated object-contain select-none pointer-events-none"
        style={{ imageRendering: "pixelated" }}
        unoptimized
      />
    </span>
  );
}

/**
 * Pixel Coin Stack for Pricing Cards (1, 3, 5, 10 coins).
 */
export function PixelCoinStack({
  amount,
  size = 32,
  className,
}: {
  amount: number;
  size?: number;
  className?: string;
}) {
  if (amount <= 1) {
    return <PixelCoin size={size} className={className} />;
  }

  if (amount === 3) {
    return (
      <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size * 1.5, height: size }}>
        <PixelCoin size={size} className="absolute left-0 top-0 opacity-90" />
        <PixelCoin size={size} className="absolute left-[20%] top-0 z-10" />
        <PixelCoin size={size} className="absolute left-[40%] top-0 z-20" />
      </div>
    );
  }

  if (amount === 5) {
    return (
      <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size * 1.7, height: size }}>
        <PixelCoin size={size} className="absolute left-0 top-0 opacity-80" />
        <PixelCoin size={size} className="absolute left-[15%] top-0 opacity-90" />
        <PixelCoin size={size} className="absolute left-[30%] top-0 z-10" />
        <PixelCoin size={size} className="absolute left-[45%] top-0 z-20" />
        <PixelCoin size={size} className="absolute left-[60%] top-0 z-30" />
      </div>
    );
  }

  // 10 coins: Treasure stack
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size * 2.1, height: size * 1.1 }}>
      <PixelCoin size={size * 0.9} className="absolute left-0 top-0 opacity-75" />
      <PixelCoin size={size * 0.9} className="absolute left-[15%] top-[5%] opacity-85" />
      <PixelCoin size={size * 0.9} className="absolute left-[30%] top-0 opacity-90" />
      <PixelCoin size={size * 0.9} className="absolute left-[45%] top-[5%] z-10" />
      <PixelCoin size={size * 0.9} className="absolute left-[60%] top-0 z-20" />
      <PixelCoin size={size} className="absolute left-[75%] -top-[10%] z-30" glow />
    </div>
  );
}

export default PixelCoin;

