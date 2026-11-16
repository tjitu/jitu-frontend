import { useState } from "react";
import { toast } from "sonner";
import { registerTryout } from "@/lib/api/exam";
import { invalidateDashboardCache } from "@/lib/api/DashboardApi";
import { TryOutData } from "../types";
import { getTryoutDetail } from "@/lib/api/tryout";

export function useTryoutRegistration(
  setTryouts: React.Dispatch<React.SetStateAction<TryOutData[]>>,
  onSuccessRegistered?: (updatedTryouts: TryOutData[]) => void
) {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedTryout, setSelectedTryout] = useState<TryOutData | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const handleRegisterClick = async (tryout: TryOutData) => {
    try {
      const detail = await getTryoutDetail(tryout.id);
      setSelectedTryout({ ...tryout, solutionPrice: detail.tokenCost ?? 0 });
      setRegisterError("");
      setRegisterModalOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat biaya pembahasan.");
    }
  };

  const onConfirmRegister = async (mode: "FREE" | "PREMIUM") => {
    if (!selectedTryout) return;
    setRegisterLoading(true);
    setRegisterError("");

    try {
      const data = await registerTryout(selectedTryout.id, mode, selectedTryout.solutionPrice);
      toast.success(data.message || "Terdaftar di tryout.");
      setRegisterModalOpen(false);
      invalidateDashboardCache();

      setTryouts((prev) => {
        const next = prev.map((t) =>
          t.id === selectedTryout.id
            ? {
                ...t,
                solutionPrice: selectedTryout.solutionPrice,
                isRegistered: true,
                participants: t.isRegistered
                  ? t.participants
                  : (t.participants || 0) + 1,
              }
            : t
        );
        onSuccessRegistered?.(next);
        return next;
      });
    } catch (err: unknown) {
      setRegisterError(
        err instanceof Error ? err.message : "Gagal mendaftar tryout."
      );
    } finally {
      setRegisterLoading(false);
    }
  };

  return {
    registerModalOpen,
    setRegisterModalOpen,
    selectedTryout,
    registerLoading,
    registerError,
    handleRegisterClick,
    onConfirmRegister,
  };
}
