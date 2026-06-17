import {
  AiBatch,
  AiDraft,
  AiDraftStatus,
  AiStatus,
  AiUsageSummary,
} from "@/lib/api/AdminAiApi";

export interface BatchCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTryoutId?: string | null;
  onCreated: (batch: AiBatch) => void;
}

export interface BatchTableProps {
  batches: AiBatch[];
  isLoading: boolean;
  selectedBatchId?: string;
  onView: (batch: AiBatch) => void;
  onStart: (batch: AiBatch) => void;
  onCancel: (batch: AiBatch) => void;
}

export interface BatchDetailProps {
  batch?: AiBatch | null;
  drafts: AiDraft[];
  usage?: AiUsageSummary | null;
  isLoading: boolean;
  onReview: (draft: AiDraft) => void;
  onApprove: (draft: AiDraft) => void;
  onReject: (draft: AiDraft) => void;
  onRegenerate: (draft: AiDraft) => void;
  onPublish: (batch: AiBatch) => void;
}

export interface DraftReviewDialogProps {
  draft?: AiDraft | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (draft: AiDraft) => void;
  onApprove: (draft: AiDraft) => void;
  onGenerateImage: (draft: AiDraft) => void;
  onGenerateVideo: (draft: AiDraft) => void;
}

export interface EnvironmentBadgeProps {
  status?: AiStatus | null;
  isLoading: boolean;
}

export interface StatusBadgeProps {
  status: AiBatch["status"] | AiDraftStatus;
}
