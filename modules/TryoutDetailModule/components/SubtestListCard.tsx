"use client";

import React from "react";
import { ArrowRight, Clock, FileText, CheckCircle2 } from "lucide-react";
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

  return (
    <Card className="border-border shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-ink-100 bg-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base sm:text-lg font-bold text-text">
                Daftar Subtes ({totalSubtests})
              </CardTitle>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Standar UTBK BP3
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Urutan dan alokasi waktu pengerjaan resmi sesuai format SNBT 2026.
            </p>
          </div>

          <div className="text-xs font-mono font-medium text-text-muted">
            Total {categories.reduce((acc, c) => acc + (c.duration || 0), 0)} menit
          </div>
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
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/70 group"
            >
              {/* Left: Icon + Title & Metadata */}
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                {/* Custom Jitu Subtest Icon with Gradient Container */}
                <div
                  className={`size-11 sm:size-12 rounded-xl bg-linear-to-br ${info.bgGradient} text-white shadow-xs flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200`}
                >
                  <Icon size={24} className="stroke-[2.2]" />
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-surface-muted border border-border text-text-muted tabular-nums">
                      0{index + 1}
                    </span>
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      {info.code}
                    </span>
                    <span className="text-text-muted/40">•</span>
                    <h4 className="font-bold text-text text-sm sm:text-base group-hover:text-primary transition-colors truncate">
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

                  {/* Tagline / Deskripsi subtes */}
                  <p className="text-xs text-text-muted hidden sm:block truncate max-w-lg">
                    {info.tagline}
                  </p>

                  {/* Pills: Jumlah Soal & Durasi */}
                  <div className="flex items-center gap-3 text-xs text-text-muted pt-0.5">
                    <span className="inline-flex items-center gap-1.5 font-medium tabular-nums">
                      <FileText className="w-3.5 h-3.5 text-text-muted/70" />
                      <span>{category.questionCount} Soal</span>
                    </span>
                    <span className="text-text-muted/40">•</span>
                    <span className="inline-flex items-center gap-1.5 font-medium tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-text-muted/70" />
                      <span>{category.duration} Menit</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Action Button (when review available) */}
              <div className="shrink-0 flex items-center justify-end">
                {isFinished && isUnlocked ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStartSubtest(index + 1, true)}
                    className="w-full sm:w-auto font-medium hover:border-primary hover:text-primary"
                  >
                    <span>Bahas Subtes</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                ) : (
                  <div className="hidden sm:block text-[11.5px] font-mono text-text-muted/60 bg-surface-muted px-2.5 py-1 rounded-md border border-border/50">
                    Sesi #{index + 1}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
