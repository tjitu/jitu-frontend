"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, CircleAlert, Plus, RefreshCw, Sparkles } from "lucide-react";
import {
  AiBatch,
  AiDraft,
  AiStatus,
  AiUsageSummary,
  approveAiDraft,
  cancelAiBatch,
  generateAiDraftImage,
  generateAiDraftVideo,
  getAiBatchDrafts,
  getAiBatchUsage,
  getAiBatches,
  getAiStatus,
  publishAiBatch,
  regenerateAiDraft,
  rejectAiDraft,
  startAiBatch,
} from "@/lib/api/AdminAiApi";
import { BatchCreateDialog } from "./components/BatchCreateDialog";
import { BatchDetail } from "./components/BatchDetail";
import { BatchTable } from "./components/BatchTable";
import { DraftReviewDialog } from "./components/DraftReviewDialog";
import { EnvironmentBadge } from "./components/EnvironmentBadge";

const AdminAiGeneratorModule = () => {
  const [initialTryoutId, setInitialTryoutId] = useState<string | null>(null);
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [batches, setBatches] = useState<AiBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<AiBatch | null>(null);
  const [drafts, setDrafts] = useState<AiDraft[]>([]);
  const [usage, setUsage] = useState<AiUsageSummary | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<AiDraft | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);

  const selectedBatchId = selectedBatch?.id;

  const loadStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    setStatusError(null);
    try {
      const data = await getAiStatus();
      setStatus(data);
    } catch (error) {
      setStatus(null);
      setStatusError(
        error instanceof Error ? error.message : "AI service tidak tersedia"
      );
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  const loadBatches = useCallback(async () => {
    setIsLoadingBatches(true);
    try {
      const data = await getAiBatches();
      setBatches(data);
      setSelectedBatch((current) => current || data[0] || null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal memuat batch AI"
      );
    } finally {
      setIsLoadingBatches(false);
    }
  }, []);

  const loadBatchDetail = useCallback(async (batch: AiBatch) => {
    setSelectedBatch(batch);
    setIsLoadingDrafts(true);
    try {
      const [draftData, usageData] = await Promise.all([
        getAiBatchDrafts(batch.id),
        getAiBatchUsage(batch.id).catch(() => null),
      ]);
      setDrafts(draftData);
      setUsage(usageData);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal memuat detail batch"
      );
    } finally {
      setIsLoadingDrafts(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    loadBatches();
  }, [loadBatches, loadStatus]);

  useEffect(() => {
    if (!selectedBatchId) return;
    const batch = batches.find((item) => item.id === selectedBatchId);
    if (batch) loadBatchDetail(batch);
  }, [batches, loadBatchDetail, selectedBatchId]);

  useEffect(() => {
    setInitialTryoutId(
      new URLSearchParams(window.location.search).get("tryoutId")
    );
  }, []);

  useEffect(() => {
    if (initialTryoutId) setIsCreateOpen(true);
  }, [initialTryoutId]);

  const stats = useMemo(
    () => ({
      total: batches.length,
      running: batches.filter((batch) =>
        ["QUEUED", "RUNNING"].includes(batch.status)
      ).length,
      completed: batches.filter((batch) => batch.status === "COMPLETED").length,
      published: batches.filter((batch) => batch.status === "PUBLISHED").length,
    }),
    [batches]
  );

  const refreshSelectedBatch = async () => {
    await loadBatches();
    if (selectedBatch) await loadBatchDetail(selectedBatch);
  };

  const handleStart = async (batch: AiBatch) => {
    try {
      const updated = await startAiBatch(batch.id);
      toast.success("Batch AI mulai diproses");
      setSelectedBatch(updated);
      await loadBatches();
      await loadBatchDetail(updated);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal start batch");
    }
  };

  const handleCancel = async (batch: AiBatch) => {
    try {
      const updated = await cancelAiBatch(batch.id);
      toast.success("Batch AI dibatalkan");
      setSelectedBatch(updated);
      await loadBatches();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal cancel batch");
    }
  };

  const handleApprove = async (draft: AiDraft) => {
    try {
      const updated = await approveAiDraft(draft.id);
      toast.success("Draft disetujui");
      updateDraftState(updated);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal approve draft");
    }
  };

  const handleReject = async (draft: AiDraft) => {
    try {
      const updated = await rejectAiDraft(draft.id, "Rejected by admin QC");
      toast.success("Draft ditolak");
      updateDraftState(updated);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal reject draft");
    }
  };

  const handleRegenerate = async (draft: AiDraft) => {
    try {
      const updated = await regenerateAiDraft(draft.id);
      toast.success("Draft berhasil diregenerate");
      updateDraftState(updated);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal regenerate draft"
      );
    }
  };

  const handlePublish = async (batch: AiBatch) => {
    try {
      const response = await publishAiBatch(batch.id);
      toast.success(
        `${response.importedQuestions || 0} soal masuk question bank`
      );
      await refreshSelectedBatch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal publish batch");
    }
  };

  const handleReview = (draft: AiDraft) => {
    setSelectedDraft(draft);
    setIsReviewOpen(true);
  };

  const updateDraftState = (updated: AiDraft) => {
    setDrafts((current) =>
      current.map((draft) => (draft.id === updated.id ? updated : draft))
    );
    setSelectedDraft((current) =>
      current?.id === updated.id ? updated : current
    );
  };

  const handleGenerateImage = async (draft: AiDraft) => {
    try {
      const updated = await generateAiDraftImage(draft.id);
      toast.success("Placeholder image dibuat");
      updateDraftState(updated);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat image");
    }
  };

  const handleGenerateVideo = async (draft: AiDraft) => {
    try {
      const updated = await generateAiDraftVideo(draft.id);
      toast.success("Placeholder video dibuat");
      updateDraftState(updated);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat video");
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              AI Generator
            </h1>
            <EnvironmentBadge status={status} isLoading={isLoadingStatus} />
          </div>
          <p className="text-muted-foreground">
            Generate draft soal Tryout untuk proses QC sebelum dipublish ke
            question bank utama.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button variant="outline" onClick={() => refreshSelectedBatch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Batch
          </Button>
        </div>
      </div>

      {statusError && (
        <Alert variant="destructive">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>AI service belum siap</AlertTitle>
          <AlertDescription>{statusError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Batch</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Bot className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Running</p>
              <p className="text-2xl font-bold">{stats.running}</p>
            </div>
            <RefreshCw className="h-8 w-8 text-amber-600" />
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <Sparkles className="h-8 w-8 text-emerald-600" />
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Published</p>
              <p className="text-2xl font-bold">{stats.published}</p>
            </div>
            <Sparkles className="h-8 w-8 text-violet-600" />
          </CardContent>
        </Card>
      </div>

      <BatchTable
        batches={batches}
        isLoading={isLoadingBatches}
        selectedBatchId={selectedBatch?.id}
        onView={loadBatchDetail}
        onStart={handleStart}
        onCancel={handleCancel}
      />

      <BatchDetail
        batch={selectedBatch}
        drafts={drafts}
        usage={usage}
        isLoading={isLoadingDrafts}
        onReview={handleReview}
        onApprove={handleApprove}
        onReject={handleReject}
        onRegenerate={handleRegenerate}
        onPublish={handlePublish}
      />

      <BatchCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        initialTryoutId={initialTryoutId}
        onCreated={(batch) => {
          setBatches((current) => [batch, ...current]);
          setSelectedBatch(batch);
          setDrafts([]);
          setUsage(null);
        }}
      />

      <DraftReviewDialog
        draft={selectedDraft}
        open={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        onSaved={updateDraftState}
        onApprove={handleApprove}
        onGenerateImage={handleGenerateImage}
        onGenerateVideo={handleGenerateVideo}
      />
    </div>
  );
};

export default AdminAiGeneratorModule;
