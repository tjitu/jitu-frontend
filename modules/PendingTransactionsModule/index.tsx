"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PendingTransactionList from "./components/PendingTransactionList";

const PendingTransactionsModule = () => {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <p className="text-label text-primary mb-1">
            TRANSAKSI COIN
          </p>
          <h1 className="text-h2 font-bold text-text">
            Menunggu pembayaran
          </h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/shop">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Kembali ke paket coin
          </Link>
        </Button>
      </div>

      <PendingTransactionList />
    </div>
  );
};

export default PendingTransactionsModule;
