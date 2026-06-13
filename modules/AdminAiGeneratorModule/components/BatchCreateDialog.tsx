"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X } from "lucide-react";
import {
  AiDifficulty,
  AiQuestionType,
  AiVideoStrategy,
  createAiBatch,
} from "@/lib/api/AdminAiApi";
import { getAllTryouts } from "@/lib/api/AdminTryoutApi";
import { BatchCreateDialogProps } from "../interface";

interface TryoutOption {
  id: string;
  title: string;
}

const questionTypes: AiQuestionType[] = [
  "PILIHAN_GANDA",
  "ISIAN_SINGKAT",
  "BENAR_SALAH",
];

const utbkPackageItems = [
  { name: "PU", label: "Penalaran Umum", questions: 30, minutes: 30 },
  {
    name: "PPU",
    label: "Pengetahuan dan Pemahaman Umum",
    questions: 20,
    minutes: 15,
  },
  {
    name: "PBM",
    label: "Pemahaman Bacaan dan Menulis",
    questions: 20,
    minutes: 25,
  },
  {
    name: "PK",
    label: "Pengetahuan Kuantitatif",
    questions: 20,
    minutes: 20,
  },
  {
    name: "LBI",
    label: "Literasi Bahasa Indonesia",
    questions: 30,
    minutes: 43,
  },
  {
    name: "LBE",
    label: "Literasi Bahasa Inggris",
    questions: 20,
    minutes: 30,
  },
  {
    name: "PM",
    label: "Penalaran Matematika",
    questions: 20,
    minutes: 30,
  },
];

const totalPackageQuestions = utbkPackageItems.reduce(
  (sum, item) => sum + item.questions,
  0
);

export function BatchCreateDialog({
  open,
  onOpenChange,
  initialTryoutId,
  onCreated,
}: BatchCreateDialogProps) {
  const [tryouts, setTryouts] = useState<TryoutOption[]>([]);
  const [isLoadingTryouts, setIsLoadingTryouts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tryoutId, setTryoutId] = useState(initialTryoutId || "");
  const [difficulty, setDifficulty] = useState<AiDifficulty>("MEDIUM");
  const [selectedTypes, setSelectedTypes] = useState<AiQuestionType[]>([
    "PILIHAN_GANDA",
  ]);
  const [includeImages, setIncludeImages] = useState(true);
  const [includeVideos, setIncludeVideos] = useState(false);
  const [videoStrategy, setVideoStrategy] =
    useState<AiVideoStrategy>("SLIDES_TTS");

  const selectedTryout = useMemo(
    () => tryouts.find((tryout) => tryout.id === tryoutId),
    [tryoutId, tryouts]
  );

  useEffect(() => {
    if (!open) return;

    const loadTryouts = async () => {
      setIsLoadingTryouts(true);
      try {
        const response = await getAllTryouts(1, 100);
        const data = response.data || response;
        setTryouts(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat tryout"
        );
      } finally {
        setIsLoadingTryouts(false);
      }
    };

    loadTryouts();
  }, [open]);

  useEffect(() => {
    if (initialTryoutId) setTryoutId(initialTryoutId);
  }, [initialTryoutId]);

  const toggleType = (type: AiQuestionType) => {
    setSelectedTypes((current) => {
      if (current.includes(type)) {
        const next = current.filter((item) => item !== type);
        return next.length ? next : current;
      }

      return [...current, type];
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!tryoutId) {
      toast.error("Pilih tryout terlebih dahulu");
      return;
    }

    setIsSubmitting(true);
    try {
      const batch = await createAiBatch({
        title: `${
          selectedTryout?.title || "Tryout"
        } - Paket UTBK SNBT (${totalPackageQuestions} Soal)`,
        tryoutId,
        tryoutTitle: selectedTryout?.title,
        difficulty,
        questionTypes: selectedTypes,
        includeImages,
        includeVideos,
        videoStrategy: includeVideos ? videoStrategy : undefined,
      });
      toast.success("Batch AI berhasil dibuat");
      onCreated(batch);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat batch AI"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Generation Batch</DialogTitle>
          <DialogDescription>
            Tentukan target Tryout dan parameter draft soal yang akan masuk QC.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tryout</Label>
              <Select value={tryoutId} onValueChange={setTryoutId}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingTryouts ? "Memuat tryout..." : "Pilih tryout"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {tryouts.map((tryout) => (
                    <SelectItem key={tryout.id} value={tryout.id}>
                      {tryout.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(value) => setDifficulty(value as AiDifficulty)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border bg-muted/20 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">Paket UTBK SNBT</p>
                <p className="text-xs text-muted-foreground">
                  Selalu generate 7 subtest lengkap untuk batch ini.
                </p>
              </div>
              <Badge variant="secondary">{totalPackageQuestions} soal</Badge>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {utbkPackageItems.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.name}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {item.questions} soal / {item.minutes} menit
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Question Types</Label>
            <div className="flex flex-wrap gap-2">
              {questionTypes.map((type) => {
                const isSelected = selectedTypes.includes(type);

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {type}
                    {isSelected && <X className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-md border p-4">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Include images</span>
              <Switch checked={includeImages} onCheckedChange={setIncludeImages} />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Include videos</span>
              <Switch checked={includeVideos} onCheckedChange={setIncludeVideos} />
            </label>
            <div className="space-y-2">
              <Label>Video strategy</Label>
              <Select
                value={videoStrategy}
                onValueChange={(value) =>
                  setVideoStrategy(value as AiVideoStrategy)
                }
                disabled={!includeVideos}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SLIDES_TTS">SLIDES_TTS</SelectItem>
                  <SelectItem value="AI_VIDEO">AI_VIDEO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-50 text-amber-700">
              Production-ready
            </Badge>
            <span className="text-xs text-muted-foreground">
              Provider aktif membuat draft, aset placeholder, dan usage cost.
            </span>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Buat Batch
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
