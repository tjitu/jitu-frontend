"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PastTransaction } from "../interface";
import { BACKEND_URL } from "@/lib/api";

const PastTransactionList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<PastTransaction[]>([]);

  useEffect(() => {
    async function fetchPastTransactions() {
      setIsLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/shop/past`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Data gagal dimuat. Muat ulang halaman.");
        }

        const data = await response.json();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (error: any) {
        toast.error(error.message || "Data gagal dimuat.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPastTransactions();
  }, []);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-12 bg-white border-2 border-blue-900">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600">
            MEMUAT RIWAYAT...
          </span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white border-2 border-blue-900 p-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-slate-500 mb-1">
            KOSONG
          </p>
          <p className="text-sm text-slate-700">Belum ada transaksi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white border-2 border-blue-900 p-5 flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-xs text-slate-500 uppercase mb-1">
                    ID #{String(tx.id).slice(0, 8)}
                  </div>
                  <h3 className="font-display font-bold text-blue-900 text-base">
                    {tx.packageName}
                  </h3>
                </div>
                {tx.type === "PAID" || tx.type === "CONFIRMED" ? (
                  <Badge variant="success">LUNAS</Badge>
                ) : tx.type === "CANCELLED" || tx.type === "DECLINED" ? (
                  <Badge variant="danger">BATAL</Badge>
                ) : (
                  <Badge variant="default">{tx.type}</Badge>
                )}
              </div>

              <div className="pt-3 border-t border-blue-100 flex items-center justify-between font-mono text-xs">
                <span className="text-blue-900 font-medium">
                  Rp{Number(tx.totalPrice || 0).toLocaleString("id-ID")} ·{" "}
                  {tx.amount} kuota
                </span>
                <span className="text-slate-600 inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(tx.createdAt).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastTransactionList;