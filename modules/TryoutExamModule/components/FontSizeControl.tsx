import React from "react";

interface FontSizeControlProps {
  fontSize: number;
  onIncrease: () => void;
  onDecrease: () => void;
  variant?: "light" | "dark";
}

export const FontSizeControl: React.FC<FontSizeControlProps> = ({
  fontSize,
  onIncrease,
  onDecrease,
}) => {
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-surface text-text font-mono text-xs overflow-hidden">
      <button
        type="button"
        onClick={onDecrease}
        title="Perkecil tulisan"
        className="h-8 px-2.5 font-medium hover:bg-surface-muted transition-colors cursor-pointer"
      >
        A-
      </button>
      <span className="px-2 py-1 border-x border-border text-[11px] text-text-muted tabular-nums">
        {fontSize}px
      </span>
      <button
        type="button"
        onClick={onIncrease}
        title="Perbesar tulisan"
        className="h-8 px-2.5 font-medium hover:bg-surface-muted transition-colors cursor-pointer"
      >
        A+
      </button>
    </div>
  );
};
