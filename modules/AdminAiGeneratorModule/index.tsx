"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/elements/Admin/StatCard";
import { CircleAlert, Plus, RefreshCw } from "lucide-react";
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
        error instanceof Error ? error.message : "Layanan AI belum tersedia.",
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
        error instanceof Error ? error.message : "Gagal memuat batch AI.",
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
        error instanceof Error ? error.message : "Gagal memuat detail batch.",
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
      new URLSearchParams(window.location.search).get("tryoutId"),
    );
  }, []);

  useEffect(() => {
    if (initialTryoutId) setIsCreateOpen(true);
  }, [initialTryoutId]);

  const stats = useMemo(
    () => ({
      total: batches.length,
      running: batches.filter((batch) =>
        ["QUEUED", "RUNNING"].includes(batch.status),
      ).length,
      completed: batches.filter((batch) => batch.status === "COMPLETED").length,
      published: batches.filter((batch) => batch.status === "PUBLISHED").length,
    }),
    [batches],
  );

  const refreshSelectedBatch = async () => {
    await loadBatches();
    if (selectedBatch) await loadBatchDetail(selectedBatch);
  };

  const handleStart = async (batch: AiBatch) => {
    try {
      const updated = await startAiBatch(batch.id);
      toast.success("Batch AI mulai diproses.");
      setSelectedBatch(updated);
      await loadBatches();
      await loadBatchDetail(updated);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal memulai batch.",
      );
    }
  };

  const handleCancel = async (batch: AiBatch) => {
    try {
      const updated = await cancelAiBatch(batch.id);
      toast.success("Batch AI dibatalkan.");
      setSelectedBatch(updated);
      await loadBatches();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal membatalkan batch.",
      );
    }
  };

  const handleApprove = async (draft: AiDraft) => {
    try {
      const updated = await approveAiDraft(draft.id);
      toast.success("Draft disetujui.");
      updateDraftState(updated);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menyetujui draft.",
      );
    }
  };

  const handleReject = async (draft: AiDraft) => {
    try {
      const updated = await rejectAiDraft(draft.id, "Rejected by admin QC");
      toast.success("Draft ditolak.");
      updateDraftState(updated);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menolak draft.",
      );
    }
  };

  const handleRegenerate = async (draft: AiDraft) => {
    try {
      const updated = await regenerateAiDraft(draft.id);
      toast.success("Draft dibuat ulang.");
      updateDraftState(updated);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat ulang draft.",
      );
    }
  };

  const handlePublish = async (batch: AiBatch) => {
    try {
      const response = await publishAiBatch(batch.id);
      toast.success(
        `${response.importedQuestions || 0} soal diterbitkan ke bank soal.`,
      );
      await refreshSelectedBatch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menerbitkan batch.",
      );
    }
  };

  const handleReview = (draft: AiDraft) => {
    setSelectedDraft(draft);
    setIsReviewOpen(true);
  };

  const updateDraftState = (updated: AiDraft) => {
    setDrafts((current) =>
      current.map((draft) => (draft.id === updated.id ? updated : draft)),
    );
    setSelectedDraft((current) =>
      current?.id === updated.id ? updated : current,
    );
  };

  const handleGenerateImage = async (draft: AiDraft) => {
    try {
      const updated = await generateAiDraftImage(draft.id);
      toast.success("Ilustrasi dibuat.");
      updateDraftState(updated);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat ilustrasi.",
      );
    }
  };

  const handleGenerateVideo = async (draft: AiDraft) => {
    try {
      const updated = await generateAiDraftVideo(draft.id);
      toast.success("Video pembahasan dibuat.");
      updateDraftState(updated);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat video.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-5 border-b-2 border-blue-900">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600 mb-1">
            GENERATOR BANK SOAL
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-blue-900">
              AI generator soal
            </h1>
            <EnvironmentBadge status={status} isLoading={isLoadingStatus} />
          </div>
          <p className="text-sm text-slate-700 mt-1">
            Buat dan kurasi draf soal SNBT sebelum diterbitkan ke bank soal.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => refreshSelectedBatch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Muat ulang
          </Button>
          <Button variant="default" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Buat batch
          </Button>
        </div>
      </div>

      {statusError && (
        <Alert variant="destructive">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Layanan AI belum siap</AlertTitle>
          <AlertDescription>{statusError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="TOTAL BATCH" value={stats.total} />
        <StatCard label="SEDANG BERJALAN" value={stats.running} />
        <StatCard label="SELESAI" value={stats.completed} />
        <StatCard label="DITERBITKAN" value={stats.published} />
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
