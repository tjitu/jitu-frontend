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
  variant = "light",
}) => {
  const isDark = variant === "dark";
  return (
    <div
      className={`inline-flex items-center border-[1.5px] font-mono text-xs ${
        isDark
          ? "border-blue-400 bg-blue-900 text-white"
          : "border-blue-900 bg-white text-blue-900"
      }`}
    >
      <button
        type="button"
        onClick={onDecrease}
        title="Perkecil tulisan"
        className={`h-8 px-2.5 font-medium transition-colors ${
          isDark ? "hover:bg-blue-700" : "hover:bg-blue-100"
        }`}
      >
        A-
      </button>
      <span
        className={`px-2 py-1 border-x-[1.5px] text-[11px] ${
          isDark
            ? "border-blue-400 text-blue-200"
            : "border-blue-900 text-slate-600"
        }`}
      >
        {fontSize}px
      </span>
      <button
        type="button"
        onClick={onIncrease}
        title="Perbesar tulisan"
        className={`h-8 px-2.5 font-medium transition-colors ${
          isDark ? "hover:bg-blue-700" : "hover:bg-blue-100"
        }`}
      >
        A+
      </button>
    </div>
  );
};
