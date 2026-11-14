"use client";

import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryDetail } from "../interface";
import { getSubtestInfo } from "./SubtestIcons";

interface SubtestListCardProps {
  categories: CategoryDetail[];
  isFinished: boolean;
  isUnlocked: boolean;
  onStartSubtest: (subtestOrder: number, isCompleted?: boolean) => void;
}

export function SubtestListCard({
  categories,
  isFinished,
  isUnlocked,
  onStartSubtest,
}: SubtestListCardProps) {
  const totalSubtests = categories.length;
  const totalDuration = categories.reduce(
    (acc, c) => acc + (c.duration || 0),
    0,
  );

  return (
    <Card className="border-border shadow-xs overflow-hidden">
      <CardHeader className="py-4 px-5 border-b border-ink-100 bg-surface">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg font-bold text-text">
            Daftar Subtes ({totalSubtests})
          </CardTitle>
          {totalDuration > 0 && (
            <span className="text-xs font-mono font-medium text-text-muted tabular-nums">
              Total {totalDuration} menit
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-ink-100">
        {categories.map((category, index) => {
          const info = getSubtestInfo(category.name, index);
          const Icon = info.IconComponent;
          const isDone = category.isCompleted;

          return (
            <div
              key={category.id || index}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors hover:bg-slate-50/70"
            >
              {/* Left: Icon + Title & Metadata */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="size-9 flex items-center justify-center text-primary shrink-0">
                  <Icon size={22} className="stroke-[2.2]" />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-text text-sm sm:text-base truncate">
                      {category.name && category.name.length > 5
                        ? category.name
                        : info.name}
                    </h4>
                    {isDone && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Selesai
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs tabular-nums pt-0.5">
                    <span className="text-text-muted">{category.duration} menit</span>
                    {isFinished && (
                      <>
                        <span className="text-border">·</span>
                        <span className="text-emerald-600 font-semibold">
                          {category.correctCount ?? 0} Benar
                        </span>
                        <span className="text-border">·</span>
                        <span className="text-rose-600 font-semibold">
                          {category.wrongCount ?? 0} Salah
                        </span>
                        <span className="text-border">·</span>
                        <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
                          {category.emptyCount ?? 0} Kosong
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Action Button (when review available) */}
              {isFinished && isUnlocked && (
                <div className="shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStartSubtest(index + 1, true)}
                    className="font-medium"
                  >
                    <span>Bahas Subtes</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
