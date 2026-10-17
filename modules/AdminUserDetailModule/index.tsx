"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  getUserById,
  getUserTransactions,
  getUserTryouts,
  resetUserTryout,
} from "@/lib/api/AdminUserApi";
import {
  AdminUserResponse,
  TokenTransaction,
  TryOutAttempt,
} from "@/modules/AdminUserModule/interface";
import { UserInfoCard } from "./components/UserInfoCard";
import { UserTransactionsTable } from "./components/UserTransactionsTable";
import { UserTryoutsTable } from "./components/UserTryoutsTable";

interface AdminUserDetailModuleProps {
  userId: string;
}

const AdminUserDetailModule: React.FC<AdminUserDetailModuleProps> = ({
  userId,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<AdminUserResponse | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [tryouts, setTryouts] = useState<TryOutAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [txPage] = useState(1);
  const [tryoutPage] = useState(1);

  const fetchUser = useCallback(async () => {
    try {
      const data = await getUserById(userId);
      setUser(data);
    } catch (error) {
      console.error(error);
      toast.error("Data peserta gagal dimuat.");
    }
  }, [userId]);

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await getUserTransactions(userId, txPage);
      if (data.data) setTransactions(data.data);
    } catch (error) {
      console.error(error);
    }
  }, [userId, txPage]);

  const fetchTryouts = useCallback(async () => {
    try {
      const data = await getUserTryouts(userId, tryoutPage);
      if (data.data) setTryouts(data.data);
    } catch (error) {
      console.error(error);
    }
  }, [userId, tryoutPage]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchUser(), fetchTransactions(), fetchTryouts()]);
      setIsLoading(false);
    };
    init();
  }, [fetchUser, fetchTransactions, fetchTryouts]);

  const handleResetAttempt = async (attemptId: string) => {
    if (
      confirm(
        "Reset pengerjaan ini? Peserta harus mengerjakan ulang dari awal. Data jawaban akan dihapus permanen.",
      )
    ) {
      try {
        await resetUserTryout(attemptId);
        toast.success("Pengerjaan tryout berhasil direset.");
        fetchTryouts();
      } catch (error) {
        console.error(error);
        toast.error("Gagal mereset pengerjaan tryout.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600">
          MEMUAT DETAIL PESERTA...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 bg-white border-2 border-blue-900 text-center text-danger font-medium">
        Peserta tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 pb-5 border-b-2 border-blue-900">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600">
            DATA PENGGUNA
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-blue-900">
            Detail peserta
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <UserInfoCard user={user} />
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="tryouts" className="w-full space-y-4">
            <TabsList>
              <TabsTrigger value="tryouts">Riwayat Tryout</TabsTrigger>
              <TabsTrigger value="transactions">Riwayat Transaksi</TabsTrigger>
            </TabsList>

            <TabsContent value="tryouts">
              <UserTryoutsTable
                attempts={tryouts}
                isLoading={isLoading}
                onReset={handleResetAttempt}
              />
            </TabsContent>

            <TabsContent value="transactions">
              <UserTransactionsTable
                transactions={transactions}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetailModule;
