"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  AlertCircleIcon,
  CoinsIcon,
  Loader2,
  DollarSign,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
          throw new Error("Gagal mengambil data transaksi pending.");
        }

        const data = await response.json();
        setTransactions(data);
      } catch (error: any) {
        toast.error(error.message || "Terjadi kesalahan tak terduga.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPendingTransactions();
  }, []);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center text-gray-500 py-10 text-sm">
          Tidak ada transaksi pending saat ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactions.map((tx) => (
            <Card
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
                  .catch((e: Error) => {
                    setIsModalLoading(false);
                    toast.error("Gagal Mengambil Data Transaksi");
                  });
              }}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 cursor-pointer"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full">
                    PENDING
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-3 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {tx.packageName}
                </h3>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xs font-medium text-slate-600">
                      Rp{tx.totalPrice.toLocaleString("id")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <CoinsIcon className="w-3 h-3" />
                    {tx.amount} Token
                  </div>
                </div>

                <div className="flex items-center mt-2 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(tx.createdAt).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </CardContent>
            </Card>
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
        <DialogTitle className="hidden"></DialogTitle>
        <DialogContent>
          {isModalLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-gray-500 mb-4" />
              <div className="text-gray-600">Mengambil data transaksi...</div>
            </div>
          )}

          {!isModalLoading && transactionId && !showContact && (
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-xl font-bold mb-2 text-center">
                Selesaikan Pembayaran
              </h2>
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="flex justify-center items-center py-8 w-full border border-slate-200 rounded-lg bg-white">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="QRIS code"
                      className="w-64 h-64"
                    />
                  ) : qrCode ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                        qrCode,
                      )}`}
                      alt="QRIS code"
                      className="w-40 h-40"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">QRIS tidak tersedia</p>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-mono mt-2">
                  ID: {transactionId}
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setShowContact(true);
                }}
              >
                Saya sudah membayar
              </Button>
            </div>
          )}

          {!isModalLoading && transactionId && showContact && (
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold mb-4">Pembayaran Diproses</h2>
              <div className="flex flex-col items-center gap-2 w-full">
                <p className="text-center text-sm text-gray-600 mb-4">
                  Pembayaran kamu akan segera kami proses. Apabila dalam 1x24
                  jam belum masuk, hubungi:
                </p>
                {contactInfos.map((contact) => (
                  <Alert key={contact.name} className="w-full">
                    <AlertCircleIcon className="h-4 w-4 shrink-0" />
                    <div>
                      <AlertTitle className="font-medium text-sm">
                        {contact.name}
                      </AlertTitle>
                      <AlertDescription className="text-xs mt-1">
                        {Object.entries(contact.contacts).map(
                          ([method, info]) => (
                            <div key={method}>
                              <strong>{method}:</strong> {info || "-"}
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
                className="mt-4 w-full"
                onClick={() => {
                  setShowContact(false);
                }}
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