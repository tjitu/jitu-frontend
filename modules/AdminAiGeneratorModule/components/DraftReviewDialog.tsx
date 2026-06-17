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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ImageIcon, Save, Video } from "lucide-react";
import { AiDraftOption, updateAiDraft } from "@/lib/api/AdminAiApi";
import { DraftReviewDialogProps } from "../interface";
import { StatusBadge } from "./StatusBadge";

const decodeHtmlEntities = (value: string) => {
  if (typeof document === "undefined") return value;

  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
};

const htmlToPlainText = (value?: string | null) => {
  if (!value) return "";

  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*<p>/gi, "\n\n")
      .replace(/<\/?(p|strong|em|b|i|u|span)[^>]*>/gi, "")
      .replace(/<[^>]+>/g, "")
  ).trim();
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const plainTextToHtml = (value: string) =>
  value
    .trim()
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph) => {
      const formatted = escapeHtml(paragraph.trim())
        .replace(/\n/g, "<br />")
        .replace(
          /^(Pertanyaan|Pernyataan 1|Pernyataan 2|Pembahasan):/u,
          "<strong>$1:</strong>"
        );

      return `<p>${formatted}</p>`;
    })
    .join("");

export function DraftReviewDialog({
  draft,
  open,
  onOpenChange,
  onSaved,
  onApprove,
  onGenerateImage,
  onGenerateVideo,
}: DraftReviewDialogProps) {
  const [content, setContent] = useState("");
  const [explanation, setExplanation] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [points, setPoints] = useState(1);
  const [qcNotes, setQcNotes] = useState("");
  const [options, setOptions] = useState<AiDraftOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!draft) return;

    setContent(htmlToPlainText(draft.content));
    setExplanation(htmlToPlainText(draft.explanation));
    setCorrectAnswer(draft.correctAnswer || "");
    setPoints(draft.points || 1);
    setQcNotes(draft.qcNotes || "");
    setOptions(
      Array.isArray(draft.options)
        ? draft.options.map((option) => ({
            ...option,
            content: htmlToPlainText(option.content),
          }))
        : []
    );
  }, [draft]);

  const imageAsset = useMemo(
    () => draft?.assets?.find((asset) => asset.kind === "IMAGE"),
    [draft]
  );
  const videoAsset = useMemo(
    () => draft?.assets?.find((asset) => asset.kind === "VIDEO"),
    [draft]
  );

  if (!draft) return null;

  const handleOptionChange = (
    index: number,
    field: keyof AiDraftOption,
    value: string | boolean
  ) => {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [field]: value } : option
      )
    );
  };

  const handleCorrectChange = (index: number) => {
    setOptions((current) =>
      current.map((option, optionIndex) => ({
        ...option,
        isCorrect: optionIndex === index,
      }))
    );
    setCorrectAnswer(options[index]?.label || "");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const updated = await updateAiDraft(draft.id, {
        content: plainTextToHtml(content),
        explanation: plainTextToHtml(explanation),
        correctAnswer,
        points,
        qcNotes,
        options,
      });
      toast.success("Draft berhasil disimpan");
      onSaved(updated);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan draft"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Review Draft #{draft.order}
            <StatusBadge status={draft.status} />
          </DialogTitle>
          <DialogDescription>
            Draft sudah direview otomatis oleh AI. Pakai layar ini untuk inspeksi
            atau override manual bila diperlukan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Tabs defaultValue="content" className="w-full">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
                <div className="space-y-2">
                  <Label>Question content</Label>
                  <Textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    className="min-h-44 text-sm leading-relaxed"
                  />
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Correct answer</Label>
                      <Input
                        value={correctAnswer}
                        onChange={(event) =>
                          setCorrectAnswer(event.target.value)
                        }
                        className="pl-3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={points}
                        onChange={(event) =>
                          setPoints(Number(event.target.value))
                        }
                        className="pl-3"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>QC notes</Label>
                    <Textarea
                      value={qcNotes}
                      onChange={(event) => setQcNotes(event.target.value)}
                      className="min-h-24"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                {options.length === 0 ? (
                  <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                    Tipe soal ini tidak menggunakan opsi pilihan.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <div
                        key={`${option.label}-${index}`}
                        className="grid grid-cols-[2rem_1fr_6rem] items-center gap-2"
                      >
                        <Badge variant="outline">{option.label}</Badge>
                        <Input
                          value={option.content}
                          onChange={(event) =>
                            handleOptionChange(
                              index,
                              "content",
                              event.target.value
                            )
                          }
                          className="pl-3"
                        />
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="radio"
                            name="correct-option"
                            checked={option.isCorrect}
                            onChange={() => handleCorrectChange(index)}
                          />
                          Correct
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Explanation</Label>
                <Textarea
                  value={explanation}
                  onChange={(event) => setExplanation(event.target.value)}
                  className="min-h-32 text-sm leading-relaxed"
                />
              </div>
            </TabsContent>

            <TabsContent value="assets" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-md border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Image
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {imageAsset?.status || "No image asset"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onGenerateImage(draft)}
                    >
                      Generate
                    </Button>
                  </div>
                  {imageAsset?.secureUrl || imageAsset?.sourceUrl ? (
                    <img
                      src={imageAsset.secureUrl || imageAsset.sourceUrl || ""}
                      alt="Draft image preview"
                      className="aspect-video w-full rounded-md border object-cover"
                    />
                  ) : (
                    <div className="aspect-video rounded-md border border-dashed flex items-center justify-center text-sm text-muted-foreground">
                      Belum ada preview gambar.
                    </div>
                  )}
                </div>

                <div className="rounded-md border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Video
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {videoAsset?.status || "No video asset"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onGenerateVideo(draft)}
                    >
                      Generate
                    </Button>
                  </div>
                  {videoAsset?.secureUrl || videoAsset?.sourceUrl ? (
                    <video
                      controls
                      src={videoAsset.secureUrl || videoAsset.sourceUrl || ""}
                      className="aspect-video w-full rounded-md border bg-black"
                    />
                  ) : (
                    <div className="aspect-video rounded-md border border-dashed flex items-center justify-center text-sm text-muted-foreground">
                      Belum ada preview video.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <div className="rounded-md border p-5 space-y-4">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: plainTextToHtml(content) }}
                />
                {options.length > 0 && (
                  <div className="space-y-2">
                    {options.map((option) => (
                      <div
                        key={option.label}
                        className={`rounded-md border p-3 text-sm ${
                          option.isCorrect ? "border-emerald-300 bg-emerald-50" : ""
                        }`}
                      >
                        <span className="font-semibold">{option.label}. </span>
                        {option.content}
                      </div>
                    ))}
                  </div>
                )}
                <div className="rounded-md bg-muted p-4 text-sm">
                  <span className="font-semibold">Pembahasan: </span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: plainTextToHtml(explanation),
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onApprove(draft)}
              disabled={draft.status === "APPROVED"}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Override Approve
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              Simpan Draft
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
