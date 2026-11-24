"use client";

import React, { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

import { RegisterModal } from "../DashboardModule/components/RegisterModal";
import { UnlockSolutionModal } from "./components/UnlockSolutionModal";
import { TryoutHeroHeader } from "./components/TryoutHeroHeader";
import { TryoutActionBar } from "./components/TryoutActionBar";
import { SubtestListCard } from "./components/SubtestListCard";
import { ExecutionPeriodCard } from "./components/ExecutionPeriodCard";
import { TryoutResultSummary } from "./components/TryoutResultSummary";
import { useTryoutDetail } from "./hooks/useTryoutDetail";
import { parsePtnTargets } from "@/lib/target";
import { StartTryoutDialog } from "./components/StartTryoutDialog";
import { SandboxRestartButton } from "./components/SandboxRestartButton";
import { NotStartedDialog } from "./components/NotStartedDialog";
import { isTryoutBeforeStart } from "@/lib/tryout-start";

const TryoutDetailModule = () => {
  const [confirmStart, setConfirmStart] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const startPending = useRef(false);
  const {
    tryoutData,
    leaderboardData,
    isLoading,
    error,
    actionError,
    notStartedOpen,
    setNotStartedOpen,
    questionsUnavailableOpen,
    setQuestionsUnavailableOpen,
    leaderboardError,
    isRegistering,
    isStartingAttempt,
    registerModalOpen,
    registerLoading,
    registerError,
    setRegisterModalOpen,
    unlockModalOpen,
    unlockLoading,
    unlockError,
    setUnlockModalOpen,
    userBalance,
    fetchDetail,
    handleRegister,
    onConfirmRegister,
    onConfirmUnlock,
    handleStart,
    handleStartSubtest,
    formatDate,
    router,
    session,
  } = useTryoutDetail();
  const requestStart = () => {
    if (tryoutData && isTryoutBeforeStart(tryoutData)) { setNotStartedOpen(true); return; }
    if (tryoutData?.actualQuestionCount === 0 && tryoutData.latestAttemptStatus !== "FINISHED") { setQuestionsUnavailableOpen(true); return; }
    if (tryoutData?.latestAttemptStatus === "IN_PROGRESS" || tryoutData?.latestAttemptStatus === "FINISHED") {
      void handleStart();
    } else {
      setConfirmStart(true);
    }
  };
  const confirmAndStart = async () => {
    if (startPending.current) return;
    startPending.current = true;
    setStartLoading(true);
    try {
      await handleStart();
      setConfirmStart(false);
    } finally {
      startPending.current = false;
      setStartLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-text-muted">
          MEMUAT LEMBAR UJIAN...
        </p>
      </div>
    );
  }

  if (error || !tryoutData) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8 max-w-lg mx-auto text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-danger mx-auto" />
          <h3 className="font-display text-xl font-bold text-text">
            Data gagal dimuat
          </h3>
          <p className="text-sm text-text-muted">
            {error || "Tryout tidak ditemukan."}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button onClick={() => router.push("/tryout")} variant="outline">
              Kembali
            </Button>
            <Button onClick={fetchDetail} variant="default">
              Muat ulang
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isFinished = tryoutData.latestAttemptStatus === "FINISHED";
  const summaryOnly = isFinished && !tryoutData.resultsAvailable;
  const isUnlocked =
    tryoutData.isFree ||
    (Array.isArray(tryoutData.unlockedSolutions) &&
      tryoutData.unlockedSolutions.length > 0);
  const cost = tryoutData.tokenCost ?? 0;
  const finalScore = Math.round(tryoutData.latestScore ?? 0);
  const targets = parsePtnTargets((session?.user as any)?.target);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Back navigation */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/tryout")}
          className="text-text-muted hover:text-text -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Kembali ke daftar
        </Button>
      </div>

      {/* QC Sandbox Notice */}
      {tryoutData.isSandboxAccount && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs sm:text-sm text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div>
            <span className="font-bold uppercase tracking-wider text-blue-700 mr-2">
              MODE QC SANDBOX
            </span>
            <span>
              {tryoutData.curationStatus === "PUBLISHED"
                ? "Kamu sedang melakukan simulasi. Hasil akun sandbox tidak masuk peringkat peserta."
                : "Tryout ini sedang diuji di Sandbox dan belum dirilis ke siswa umum."}
            </span>
          </div>
          {tryoutData.latestAttemptId && (isFinished || tryoutData.latestAttemptStatus === "IN_PROGRESS") ? (
            <SandboxRestartButton tryoutId={tryoutData.id} attemptId={tryoutData.latestAttemptId} title={tryoutData.title} />
          ) : <Badge variant="default" className="shrink-0 bg-blue-600 text-white">
            {tryoutData.curationStatus === "PUBLISHED" ? "Simulasi" : "Antrean QC"}
          </Badge>}
        </div>
      )}

      {/* Hero Header */}
      <TryoutHeroHeader
        tryoutData={tryoutData}
        formatDate={formatDate}
        isFinished={isFinished}
        isUnlocked={isUnlocked}
        finalScore={finalScore}
        onStart={summaryOnly ? undefined : requestStart}
      />

      {/* Action Bar or Result Summary */}
      {actionError && (
        <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger-text">
          {actionError}
        </div>
      )}
      {isFinished ? (
        <TryoutResultSummary
          tryoutData={tryoutData}
          isUnlocked={isUnlocked}
          cost={cost}
          finalScore={finalScore}
          userBalance={userBalance}
          onUnlockClick={() => setUnlockModalOpen(true)}
          onStart={requestStart}
          leaderboardData={leaderboardData}
          targets={targets}
        />
      ) : (
        <TryoutActionBar
          tryoutData={tryoutData}
          isStartingAttempt={isStartingAttempt}
          isRegistering={isRegistering}
          onStart={requestStart}
          onRegister={handleRegister}
        />
      )}

      {/* Subtests & Execution Period Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (8 cols): Subtests */}
        <div className="lg:col-span-8">
          <SubtestListCard
            categories={tryoutData.categories || []}
            summaryOnly={summaryOnly}
            isFinished={isFinished}
            isUnlocked={isUnlocked}
            cost={cost}
            onUnlockClick={() => setUnlockModalOpen(true)}
            onStartSubtest={handleStartSubtest}
          />
        </div>

        {/* Right (4 cols): Execution Period Card */}
        <div className="lg:col-span-4">
          <ExecutionPeriodCard
            startDate={tryoutData.startDate}
            endDate={tryoutData.endDate}
            formatDate={formatDate}
          />
        </div>
      </div>

      {/* Registration & Unlock Modals */}
      <StartTryoutDialog open={confirmStart} loading={startLoading} onOpenChange={setConfirmStart} onConfirm={confirmAndStart} />
      <NotStartedDialog open={notStartedOpen} onOpenChange={setNotStartedOpen} startDate={tryoutData.startDate} />
      <NotStartedDialog open={questionsUnavailableOpen} onOpenChange={setQuestionsUnavailableOpen} startDate={tryoutData.startDate} questionsUnavailable />
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onConfirm={onConfirmRegister}
        tryoutTitle={tryoutData?.title || ""}
        tokenCost={tryoutData?.tokenCost || 0}
        scheduledStart={tryoutData?.startDate}
        scheduledEnd={tryoutData?.endDate}
        duration={tryoutData?.duration || 195}
        isLoading={registerLoading}
        error={registerError}
      />

      <UnlockSolutionModal
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        onConfirm={onConfirmUnlock}
        tryoutTitle={tryoutData?.title || ""}
        tryoutNumber={tryoutData?.number}
        tokenCost={tryoutData?.tokenCost ?? 0}
        userBalance={userBalance}
        isLoading={unlockLoading}
        error={unlockError}
      />
    </div>
  );
};

export default TryoutDetailModule;
