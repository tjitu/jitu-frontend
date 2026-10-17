"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PendingTransactionList from "./components/PendingTransactionList";

const PendingTransactionsModule = () => {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-blue-900">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600 mb-1">
            TRANSAKSI KUOTA
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-blue-900">
            Menunggu pembayaran
          </h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/shop">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Kembali ke paket kuota
          </Link>
        </Button>
      </div>

      <PendingTransactionList />
    </div>
  );
};

export default PendingTransactionsModule;
