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
import { contactInfos } from "../ShopModule/payload";
import { PendingTransaction, TransactionData } from "./interface";

import { BACKEND_URL } from "@/lib/api";

const PendingTransactionsModule = () => {
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
    <div className="min-h-screen pl-20 bg-gray-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="pt-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Transaksi Pending
            </h1>
          </div>
          <p className="text-gray-600">
            Cek status transaksi token try out yang belum selesai
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-gray-600 py-20">
            Tidak ada transaksi pending.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      // console.error(e);
                      setIsModalLoading(false);

                      toast.error("Gagal Mengambil Data Transaksi", {
                        description:
                          "Terjadi kesalahan saat mengambil data transaksi. Silahkan coba lagi.",
                      });
                    });
                }}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer"
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        PENDING
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-4 group-hover:text-[#1A7BFF] transition-colors">
                    {tx.packageName}
                  </h3>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        Rp{tx.totalPrice.toLocaleString("id")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                      <CoinsIcon className="w-4 h-4" />
                      {tx.amount} Token
                    </div>
                  </div>

                  <div className="flex items-center pt-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-600 ml-1">
                      Dibuat pada:{" "}
                      {new Date(tx.createdAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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
              <h2 className="text-2xl font-bold mb-4">
                Silahkan Lakukan Pembayaran
              </h2>
              <div className="flex flex-col items-center gap-2">
                <div className="flex justify-center items-center py-12 w-full border border-black">
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
                      className="w-48 h-48"
                    />
                  ) : (
                    <p>QRIS tidak tersedia</p>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Transaction ID: {transactionId}
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowContact(true);
                }}
              >
                Saya sudah melakukan pembayaran
              </Button>
            </div>
          )}

          {!isModalLoading && transactionId && showContact && (
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-4">Pembayaran Diproses</h2>
              <div className="flex flex-col items-center gap-2">
                <p className="text-center">
                  Pembayaran kamu akan segera kami proses. Apabila dalam 1x24
                  jam belum terverifikasi, silahkan hubungi kontak berikut:
                </p>
                {contactInfos.map((contact) => (
                  <Alert key={contact.name} className="w-full max-w-md">
                    <AlertCircleIcon className="h-5 w-5 shrink-0" />
                    <div>
                      <AlertTitle className="font-medium">
                        {contact.name}
                      </AlertTitle>
                      <AlertDescription className="text-sm mt-2">
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
                <p className="text-xs text-gray-500">
                  Transaction ID: {transactionId}
                </p>
              </div>
              <Button
                className="mt-4"
                onClick={() => {
                  setShowContact(false);
                }}
              >
                Tunjukkan kembali QRIS
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingTransactionsModule;
