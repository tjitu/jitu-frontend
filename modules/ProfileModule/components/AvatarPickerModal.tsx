"use client";

import React, { useState, useEffect } from "react";
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
  const [avatarList, setAvatarList] = useState<PresetAvatar[]>(PRESET_AVATARS);
  const [randomBatch, setRandomBatch] = useState(0);

  // Keep selectedUrl in sync when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(getStudentAvatarUrl(currentImage, userId));
      setAvatarList(PRESET_AVATARS);
    }
  }, [isOpen, currentImage, userId]);

  const handleShuffle = () => {
    const nextBatch = randomBatch + 1;
    setRandomBatch(nextBatch);
    const generated = generateRandomAvatars(24, nextBatch);
    setAvatarList(generated);
    if (generated.length > 0) {
      setSelectedUrl(generated[0].url);
    }
  };

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
            Pilih avatar yang mewakili karakter belajarmu di JITU.
          </p>
        </DialogHeader>

        {/* Selected Preview & Shuffle Bar */}
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
                Klik lingkaran avatar untuk memilih
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShuffle}
            className="text-[12px] font-medium gap-1.5 h-8 cursor-pointer hover:bg-surface"
          >
            <Dices className="w-3.5 h-3.5 stroke-[2]" />
            <span>Acak avatar</span>
          </Button>
        </div>

        {/* Grid of Circular Avatars (No cards, no labels, clean modern circles) */}
        <div className="p-6 max-h-[360px] overflow-y-auto">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3.5 sm:gap-4 place-items-center">
            {avatarList.map((avatar) => {
              const isSelected = selectedUrl === avatar.url;

              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedUrl(avatar.url)}
                  className={`group relative rounded-full transition-all duration-150 focus:outline-none cursor-pointer ${
                    isSelected
                      ? "ring-3 ring-primary ring-offset-2 scale-105"
                      : "hover:scale-110 opacity-90 hover:opacity-100"
                  }`}
                  aria-label="Pilih avatar"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white relative border border-border/80 shadow-2xs">
                    <Image
                      src={avatar.url}
                      alt="Avatar"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {isSelected && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center border-2 border-surface shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
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
            className="cursor-pointer"
          >
            Batal
          </Button>

          <Button
            type="button"
            variant="primary"
            disabled={isSaving}
            onClick={handleApply}
            className="min-w-[140px] cursor-pointer"
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
