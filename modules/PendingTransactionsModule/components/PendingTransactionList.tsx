"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertCircleIcon, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { contactInfos } from "../../ShopModule/payload";
import { PendingTransaction, TransactionData } from "../interface";
import { BACKEND_URL } from "@/lib/api";

const PendingTransactionList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPendingTransactions() {
      setIsLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/shop/pending`, {
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

    fetchPendingTransactions();
  }, []);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-12 bg-white border border-slate-200">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
          <span className="font-mono text-xs uppercase tracking-wider text-slate-500">
            MEMUAT TRANSAKSI...
          </span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white border border-slate-200 p-10 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-slate-400 mb-1">
            KOSONG
          </p>
          <p className="text-sm text-slate-600">Belum ada transaksi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => {
                setIsModalLoading(true);
                setIsModalOpened(true);

                fetch(`${BACKEND_URL}/shop/data/${tx.id}`, {
                  method: "GET",
                  credentials: "include",
                })
                  .then((res) => {
                    if (!res.ok) {
                      throw new Error(res.statusText);
                    }
                    return res.json();
                  })
                  .then((data: TransactionData) => {
                    setIsModalLoading(false);
                    setTransactionId(data.id);
                    setQrCode(data.qris);
                    if (data.metadata?.qr_code_url) {
                      setQrCodeUrl(data.metadata.qr_code_url);
                    } else {
                      setQrCodeUrl(null);
                    }
                    setShowContact(false);
                  })
                  .catch(() => {
                    setIsModalLoading(false);
                    toast.error("Gagal mengambil kode QRIS.");
                  });
              }}
              className="bg-white border border-slate-200 shadow-xs p-5 cursor-pointer hover:border-slate-300 transition-colors flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-xs text-slate-400 uppercase mb-1">
                    ID #{String(tx.id).slice(0, 8)}
                  </div>
                  <h3 className="font-display font-bold text-slate-900 text-base">
                    {tx.packageName}
                  </h3>
                </div>
                <Badge variant="warn">MENUNGGU</Badge>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between font-mono text-xs">
                <span className="text-slate-900 font-medium">
                  Rp{Number(tx.totalPrice || 0).toLocaleString("id-ID")} ·{" "}
                  {tx.amount} coin
                </span>
                <span className="text-slate-500 inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(tx.createdAt).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={isModalOpened}
        onOpenChange={(state) => {
          setIsModalOpened(state);
          if (!state) {
            setTransactionId(null);
            setQrCode("");
            setQrCodeUrl(null);
            setShowContact(false);
          }
        }}
        modal
      >
        <DialogTitle className="sr-only">Pembayaran QRIS</DialogTitle>
        <DialogContent className="sm:max-w-[440px]">
          {isModalLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600 mb-3" />
              <div className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600">
                MEMUAT QRIS...
              </div>
            </div>
          )}

          {!isModalLoading && transactionId && !showContact && (
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600">
                  PEMBAYARAN QRIS
                </p>
                <h2 className="font-display text-xl font-bold text-blue-900 mt-1">
                  Scan QRIS untuk bayar
                </h2>
              </div>

              <div className="flex justify-center items-center p-4 w-full border border-slate-200 bg-white">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Kode QRIS"
                    className="w-60 h-60 object-contain"
                  />
                ) : qrCode ? (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                      qrCode,
                    )}`}
                    alt="Kode QRIS"
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  <p className="text-sm text-slate-600 py-12">
                    Waktu bayar habis. Buat kode QRIS baru untuk lanjut.
                  </p>
                )}
              </div>

              <p className="font-mono text-xs text-slate-600">
                ID TRANSAKSI: {transactionId}
              </p>

              <Button
                variant="default"
                className="w-full"
                onClick={() => setShowContact(true)}
              >
                Cek status bayar
              </Button>
            </div>
          )}

          {!isModalLoading && transactionId && showContact && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-blue-900">
                Menunggu verifikasi
              </h2>
              <p className="text-sm text-slate-700">
                Coin otomatis masuk setelah pembayaran terkonfirmasi. Jika
                belum masuk, hubungi kontak bantuan:
              </p>
              <div className="space-y-2">
                {contactInfos.map((contact) => (
                  <Alert key={contact.name}>
                    <AlertCircleIcon className="h-4 w-4 shrink-0" />
                    <div>
                      <AlertTitle className="font-semibold text-sm">
                        {contact.name}
                      </AlertTitle>
                      <AlertDescription className="text-xs mt-1 font-mono">
                        {Object.entries(contact.contacts).map(
                          ([method, info]) => (
                            <div key={method}>
                              {method}: {info || "-"}
                            </div>
                          ),
                        )}
                      </AlertDescription>
                    </div>
                  </Alert>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowContact(false)}
              >
                Kembali ke QRIS
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingTransactionList;