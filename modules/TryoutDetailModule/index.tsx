"use client";

import React from "react";
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
import { Leaderboard } from "@/components/elements/Leaderboard";
import { useTryoutDetail } from "./hooks/useTryoutDetail";

const TryoutDetailModule = () => {
  const {
    tryoutData,
    leaderboardData,
    isLoading,
    error,
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
  } = useTryoutDetail();

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
  const isUnlocked =
    tryoutData.isFree ||
    (Array.isArray(tryoutData.unlockedSolutions) &&
      tryoutData.unlockedSolutions.length > 0);
  const cost = tryoutData.tokenCost || 1;
  const finalScore = Math.round(tryoutData.latestScore ?? 0);

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
      {(tryoutData.isSandboxPreview ||
        tryoutData.curationStatus === "QC_SANDBOX") && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs sm:text-sm text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div>
            <span className="font-bold uppercase tracking-wider text-blue-700 mr-2">
              MODE QC SANDBOX
            </span>
            <span>
              Tryout ini sedang diuji di Sandbox dan belum dirilis ke siswa umum.
            </span>
          </div>
          <Badge variant="default" className="shrink-0 bg-blue-600 text-white">
            Antrean QC
          </Badge>
        </div>
      )}

      {/* Hero Header */}
      <TryoutHeroHeader
        tryoutData={tryoutData}
        formatDate={formatDate}
        isFinished={isFinished}
        isUnlocked={isUnlocked}
        finalScore={finalScore}
        onUnlockClick={() => setUnlockModalOpen(true)}
      />

      {/* Action Bar or Result Summary */}
      {isFinished ? (
        <TryoutResultSummary
          tryoutData={tryoutData}
          isUnlocked={isUnlocked}
          cost={cost}
          finalScore={finalScore}
          userBalance={userBalance}
          onUnlockClick={() => setUnlockModalOpen(true)}
          onStart={handleStart}
        />
      ) : (
        <TryoutActionBar
          tryoutData={tryoutData}
          isStartingAttempt={isStartingAttempt}
          isRegistering={isRegistering}
          onStart={handleStart}
          onRegister={handleRegister}
        />
      )}

      {/* Leaderboard if tryout has ended */}
      {leaderboardData && <Leaderboard leaderboardData={leaderboardData} />}
      {leaderboardError && (
        <div className="p-4 rounded-xl bg-danger-soft border border-danger/30 text-danger-text text-sm">
          {leaderboardError}
        </div>
      )}

      {/* Subtests & Execution Period Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (8 cols): Subtests */}
        <div className="lg:col-span-8">
          <SubtestListCard
            categories={tryoutData.categories || []}
            isFinished={isFinished}
            isUnlocked={isUnlocked}
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
        tokenCost={tryoutData?.tokenCost || 1}
        userBalance={userBalance}
        isLoading={unlockLoading}
        error={unlockError}
      />
    </div>
  );
};

export default TryoutDetailModule;
