"use client";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertCircleIcon, Loader2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { contactInfos } from "../../ShopModule/payload";
import { PendingTransaction, TransactionData } from "../interface";
import { BACKEND_URL } from "@/lib/api";

interface PendingTransactionListProps {
  onCountChange?: (count: number) => void;
}

const PendingTransactionList = ({ onCountChange }: PendingTransactionListProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const onCountChangeRef = useRef(onCountChange);
  useEffect(() => {
    onCountChangeRef.current = onCountChange;
  }, [onCountChange]);

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
        const list = Array.isArray(data) ? data : [];
        setTransactions(list);
        onCountChangeRef.current?.(list.length);
      } catch (error: any) {
        toast.error(error.message || "Data gagal dimuat.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPendingTransactions();
  }, []);

  const handleOpenQris = (txId: string) => {
    setIsModalLoading(true);
    setIsModalOpened(true);

    fetch(`${BACKEND_URL}/shop/data/${txId}`, {
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
        setRedirectUrl(data.metadata?.redirect_url || null);
        setShowContact(false);
      })
      .catch(() => {
        setIsModalLoading(false);
        toast.error("Gagal mengambil kode QRIS.");
      });
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const res = await fetch(`${BACKEND_URL}/shop/cancel/${id}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Gagal membatalkan transaksi.");
      }

      toast.success("Transaksi berhasil dibatalkan.");
      if (transactionId === id) {
        setIsModalOpened(false);
        setTransactionId(null);
      }

      setTransactions((prev) => prev.filter((t) => t.id !== id));
      const nextCount = transactions.filter((t) => t.id !== id).length;
      onCountChangeRef.current?.(nextCount);
    } catch (err: any) {
      toast.error(err.message || "Gagal membatalkan transaksi.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-12 bg-surface border border-border rounded-lg">
          <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
          <span className="text-[13px] font-medium text-text-muted">
            Memuat transaksi...
          </span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-10 text-center">
          <p className="text-label text-text-subtle mb-1">
            KOSONG
          </p>
          <p className="text-[14px] text-text-muted">Belum ada transaksi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-surface border border-border rounded-xl p-5 hover:border-slate-300 transition-colors flex flex-col justify-between gap-4 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-xs text-text-subtle uppercase mb-1">
                    ID #{String(tx.id).slice(0, 8)}
                  </div>
                  <h3 className="font-bold text-text text-base">
                    {tx.packageName}
                  </h3>
                </div>
                <Badge variant="warn">Menunggu</Badge>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between font-mono text-xs">
                <span className="text-text font-semibold tabular-nums">
                  Rp{Number(tx.totalPrice || 0).toLocaleString("id-ID")} ·{" "}
                  {tx.amount} coin
                </span>
                <span className="text-text-muted inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(tx.createdAt).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  disabled={cancellingId === tx.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel(tx.id);
                  }}
                >
                  {cancellingId === tx.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      Membatalkan...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Batalkan
                    </>
                  )}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs flex-1 bg-primary hover:bg-primary/90 text-white font-medium"
                  onClick={() => handleOpenQris(tx.id)}
                >
                  Bayar Sekarang
                </Button>
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
              <Loader2 className="w-7 h-7 animate-spin text-primary mb-3" />
              <div className="text-[13px] font-medium text-text-muted">
                Memuat QRIS...
              </div>
            </div>
          )}

          {!isModalLoading && transactionId && !showContact && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="text-center">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary">
                  PEMBAYARAN QRIS
                </p>
                <h2 className="text-[20px] font-bold text-text mt-1">
                  Scan QRIS untuk bayar
                </h2>
              </div>

              <div className="w-full max-w-[280px] p-4 bg-white border border-border rounded-2xl flex items-center justify-center shadow-sm">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Kode QRIS"
                    className="w-56 h-56 object-contain rounded-lg"
                  />
                ) : qrCode ? (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                      qrCode,
                    )}&size=300x300`}
                    alt="Kode QRIS"
                    className="w-56 h-56 object-contain rounded-lg"
                  />
                ) : redirectUrl ? (
                  <div className="w-full flex flex-col items-center gap-3 text-center py-8">
                    <p className="text-sm text-slate-600">
                      Buka halaman Midtrans untuk melanjutkan pembayaran.
                    </p>
                    <a
                      href={redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                    >
                      Lanjutkan pembayaran
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-text-muted py-12 text-center">
                    Waktu bayar habis. Buat kode QRIS baru untuk lanjut.
                  </p>
                )}
              </div>

              <p className="font-mono text-xs text-text-muted">
                ID transaksi: {transactionId}
              </p>

              <div className="w-full flex flex-col gap-2 pt-1">
                <Button
                  variant="default"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-sm shadow-sm"
                  onClick={() => setShowContact(true)}
                >
                  Cek status bayar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={cancellingId === transactionId}
                  onClick={() => transactionId && handleCancel(transactionId)}
                >
                  {cancellingId === transactionId ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      Membatalkan transaksi...
                    </>
                  ) : (
                    "Batalkan transaksi ini"
                  )}
                </Button>
              </div>
            </div>
          )}

          {!isModalLoading && transactionId && showContact && (
            <div className="space-y-4">
              <h2 className="text-[20px] font-bold text-text">
                Menunggu verifikasi
              </h2>
              <p className="text-[14px] text-text-body">
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
