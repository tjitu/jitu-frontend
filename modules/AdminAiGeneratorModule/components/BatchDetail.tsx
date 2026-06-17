"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  DollarSign,
  Eye,
  FileQuestion,
  ImageIcon,
  Loader2,
  RefreshCw,
  Send,
  Video,
  XCircle,
} from "lucide-react";
import { AiAsset, AiDraft } from "@/lib/api/AdminAiApi";
import { BatchDetailProps } from "../interface";
import { StatusBadge } from "./StatusBadge";

function getAsset(draft: AiDraft, kind: AiAsset["kind"]) {
  return draft.assets?.find((asset) => asset.kind === kind);
}

export function BatchDetail({
  batch,
  drafts,
  usage,
  isLoading,
  onReview,
  onApprove,
  onReject,
  onRegenerate,
  onPublish,
}: BatchDetailProps) {
  if (!batch) {
    return (
      <Card className="border-dashed">
        <CardContent className="h-48 flex items-center justify-center text-muted-foreground">
          Pilih batch untuk membuka QC draft.
        </CardContent>
      </Card>
    );
  }

  const approved = drafts.filter((draft) => draft.status === "APPROVED").length;
  const rejected = drafts.filter((draft) => draft.status === "REJECTED").length;
  const published = drafts.filter((draft) => draft.status === "PUBLISHED").length;
  const aiReviewed = drafts.filter((draft) =>
    draft.qcNotes?.toLowerCase().includes("ai review")
  ).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="text-2xl font-bold">
                {batch.completedCount}/{batch.totalQuestions}
              </p>
            </div>
            <FileQuestion className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">{approved}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold">{rejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Usage Cost</p>
              <p className="text-2xl font-bold">
                ${usage?.totals.costUsd.toFixed(4) || "0.0000"}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-amber-600" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Draft QC
              <StatusBadge status={batch.status} />
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {batch.subject} - {batch.topic} - {batch.subtestName}
              {aiReviewed > 0 && ` - AI reviewed ${aiReviewed} draft`}
            </p>
          </div>
          <Button
            onClick={() => onPublish(batch)}
            disabled={approved === 0 || batch.status === "PUBLISHED"}
            className="w-full md:w-auto"
          >
            <Send className="mr-2 h-4 w-4" />
            Publish AI Approved
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memuat draft...
            </div>
          ) : drafts.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              Draft belum tersedia. Jalankan batch untuk mulai generate.
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => {
                const image = getAsset(draft, "IMAGE");
                const video = getAsset(draft, "VIDEO");

                return (
                  <div
                    key={draft.id}
                    className="rounded-md border p-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">#{draft.order}</Badge>
                        {draft.subtestName && (
                          <Badge variant="outline">{draft.subtestName}</Badge>
                        )}
                        <StatusBadge status={draft.status} />
                        <Badge variant="secondary">{draft.type}</Badge>
                        {draft.qcNotes
                          ?.toLowerCase()
                          .includes("ai review") && (
                          <Badge className="bg-emerald-600 text-white">
                            AI Reviewed
                          </Badge>
                        )}
                        {published > 0 && draft.status === "PUBLISHED" && (
                          <Badge className="bg-violet-600 text-white">
                            Published
                          </Badge>
                        )}
                      </div>
                      <div
                        className="text-sm leading-relaxed line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: draft.content }}
                      />
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <ImageIcon className="h-3.5 w-3.5" />
                          {image?.status || "No image"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Video className="h-3.5 w-3.5" />
                          {video?.status || "No video"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReview(draft)}
                      >
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        Inspect
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-emerald-600 border-emerald-200"
                        onClick={() => onApprove(draft)}
                        disabled={draft.status === "APPROVED"}
                      >
                        <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                        Override
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200"
                        onClick={() => onReject(draft)}
                        disabled={draft.status === "REJECTED"}
                      >
                        <XCircle className="mr-2 h-3.5 w-3.5" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRegenerate(draft)}
                      >
                        <RefreshCw className="mr-2 h-3.5 w-3.5" />
                        Regen
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
