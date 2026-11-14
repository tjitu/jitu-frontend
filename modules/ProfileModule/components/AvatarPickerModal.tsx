"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  PRESET_AVATARS,
  generateRandomAvatars,
  PresetAvatar,
  getStudentAvatarUrl,
} from "@/lib/avatar";
import { Check, Dices, Loader2, Sparkles } from "lucide-react";

interface AvatarPickerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentImage?: string | null;
  userId?: string | null;
  onSaveAvatar: (avatarUrl: string) => Promise<void>;
  isSaving: boolean;
}

export function AvatarPickerModal({
  isOpen,
  onOpenChange,
  currentImage,
  userId,
  onSaveAvatar,
  isSaving,
}: AvatarPickerModalProps) {
  const initialUrl = getStudentAvatarUrl(currentImage, userId);
  const [selectedUrl, setSelectedUrl] = useState<string>(initialUrl);
  const [randomBatch, setRandomBatch] = useState(0);
  const [randomAvatars, setRandomAvatars] = useState<PresetAvatar[]>([]);
  const [activeTab, setActiveTab] = useState<"preset" | "random">("preset");

  // Keep selectedUrl in sync when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedUrl(getStudentAvatarUrl(currentImage, userId));
    }
  }, [isOpen, currentImage, userId]);

  const handleShuffle = () => {
    const nextBatch = randomBatch + 1;
    setRandomBatch(nextBatch);
    const generated = generateRandomAvatars(8, nextBatch);
    setRandomAvatars(generated);
    setActiveTab("random");
    if (generated.length > 0) {
      setSelectedUrl(generated[0].url);
    }
  };

  const currentList = activeTab === "preset" ? PRESET_AVATARS : randomAvatars;

  const handleApply = async () => {
    if (!selectedUrl) return;
    await onSaveAvatar(selectedUrl);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden bg-surface">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-primary">
            <Sparkles className="w-4 h-4 stroke-[2]" />
            <span>PILIHAN AVATAR JITU</span>
          </div>
          <DialogTitle className="text-[20px] font-bold text-text">
            Pilih Avatar Karaktermu
          </DialogTitle>
          <p className="text-[13px] text-text-muted mt-1">
            Pilih avatar yang mewakili semangat belajarmu. Avatar ini akan tampil di profil, dashboard, dan leaderboard.
          </p>
        </DialogHeader>

        {/* Selected Preview Bar */}
        <div className="px-6 py-3.5 bg-surface-muted/60 border-b border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-primary bg-white overflow-hidden relative shadow-2xs shrink-0">
              <Image
                src={selectedUrl}
                alt="Avatar terpilih"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <div className="text-[13px] font-bold text-text">
                Pratinjau Avatar
              </div>
              <div className="text-[11px] text-text-muted">
                Klik salah satu avatar di bawah untuk memilih
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShuffle}
            className="text-[12px] font-medium gap-1.5 h-8"
          >
            <Dices className="w-3.5 h-3.5 stroke-[2]" />
            <span>Acak avatar</span>
          </Button>
        </div>

        {/* Avatar List Tabs */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-ink-100">
          <button
            type="button"
            onClick={() => setActiveTab("preset")}
            className={`pb-2.5 text-[13px] font-semibold transition-colors cursor-pointer border-b-2 -mb-[1px] ${
              activeTab === "preset"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            Koleksi Siswa JITU ({PRESET_AVATARS.length})
          </button>
          {randomAvatars.length > 0 ? (
            <button
              type="button"
              onClick={() => setActiveTab("random")}
              className={`pb-2.5 text-[13px] font-semibold transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                activeTab === "random"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              Hasil Acak ({randomAvatars.length})
            </button>
          ) : null}
        </div>

        {/* Grid of Avatars */}
        <div className="p-6 max-h-[320px] overflow-y-auto">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3.5">
            {currentList.map((avatar) => {
              const isSelected = selectedUrl === avatar.url;

              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedUrl(avatar.url)}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-2 group relative ${
                    isSelected
                      ? "border-primary bg-blue-50/70 shadow-sm ring-2 ring-blue-300"
                      : "border-border bg-surface hover:border-blue-300 hover:bg-surface-muted"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white relative border border-ink-100 shadow-2xs group-hover:scale-105 transition-transform">
                    <Image
                      src={avatar.url}
                      alt={avatar.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="min-w-0 w-full">
                    <div className="text-[12px] font-bold text-text truncate">
                      {avatar.name}
                    </div>
                    <div className="text-[10px] text-text-muted truncate">
                      {avatar.tag}
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shadow-2xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <DialogFooter className="p-4 sm:p-5 border-t border-border bg-surface-muted/30 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>

          <Button
            type="button"
            variant="primary"
            disabled={isSaving}
            onClick={handleApply}
            className="min-w-[140px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                Menyimpan...
              </>
            ) : (
              "Gunakan Avatar Ini"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
