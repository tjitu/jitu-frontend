"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  AlertCircleIcon,
  Loader2,
  Smartphone,
  Monitor,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import TokenCard from "./components/TokenCard";
import { PixelCoin } from "@/components/ui/pixel-coin";
import { contactInfos, tokenPackages as fallbackTokenPackages } from "./payload";
import { BACKEND_URL } from "@/lib/api";
import { getUserStats } from "@/lib/api/DashboardApi";
import PendingTransactionList from "../PendingTransactionsModule/components/PendingTransactionList";
import PastTransactionList from "../PastTransactionsModule/components/PastTransactionList";

interface TokenPackage {
  id: string;
  name: string;
  tokenAmount: number;
  price: number;
}

interface EWalletPaymentResponse {
  transactionId: string;
  orderId: string;
  amount: number;
  tokenAmount: number;
  status: string;
  paymentMethod: string;
  qrCodeUrl?: string;
  deeplinkUrl?: string;
  expiryTime?: string;
  packageName: string;
}

interface PendingPayment {
  id: string;
  orderId: string;
  amount: number;
  tokenAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
  tokenPackage: {
    id: string;
    name: string;
    tokenAmount: number;
    price: number;
  };
  metadata?: {
    qr_code_url?: string;
    deeplink_url?: string;
    midtrans_transaction_id?: string;
  };
}

const ShopModule = () => {
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const [isModalOpened, setIsModalOpened] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<TokenPackage | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [paymentData, setPaymentData] = useState<EWalletPaymentResponse | null>(
    null,
  );
  const [isMobile, setIsMobile] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");

  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(
    null,
  );
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [cancellingPayment, setCancellingPayment] = useState(false);
  const [checkingPending, setCheckingPending] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ),
    );
  }, []);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const stats = await getUserStats();
        setUserBalance(stats.tokenBalance ?? 0);
      } catch (e) {
        console.error(e);
      }

      try {
        const res = await fetch(`${BACKEND_URL}/shop/pending`, {
          credentials: "include",
        });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) setPendingCount(list.length);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadSummary();
  }, []);

  // Poll payment status when transaction is created
  useEffect(() => {
    if (!transactionId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/shop/check/${transactionId}`, {
          method: "POST",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setPaymentStatus(data.status);

          if (data.status === "CONFIRMED") {
            clearInterval(pollInterval);
            toast.success("Pembayaran diterima. Coins bertambah.");
            setIsModalOpened(false);
            setTimeout(() => router.refresh(), 1000);
          } else if (
            data.status === "CANCELLED" ||
            data.status === "DECLINED"
          ) {
            clearInterval(pollInterval);
            toast.error(
              "Waktu bayar habis. Buat kode QRIS baru untuk lanjut.",
            );
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 3000);

    const timeout = setTimeout(
      () => clearInterval(pollInterval),
      15 * 60 * 1000,
    );

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [transactionId, router]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/shop/packages`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPackages(data);
          } else {
            setPackages(
              fallbackTokenPackages.map((p) => ({
                id: String(p.id),
                name: p.title,
                tokenAmount: p.tokenAmount,
                price: p.finalPrice,
              })),
            );
          }
        } else {
          setPackages(
            fallbackTokenPackages.map((p) => ({
              id: String(p.id),
              name: p.title,
              tokenAmount: p.tokenAmount,
              price: p.finalPrice,
            })),
          );
        }
      } catch (error) {
        console.error(error);
        setPackages(
          fallbackTokenPackages.map((p) => ({
            id: String(p.id),
            name: p.title,
            tokenAmount: p.tokenAmount,
            price: p.finalPrice,
          })),
        );
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  const checkPendingPayment = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/shop/pending-payment`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        return data.pending;
      }
    } catch (error) {
      console.error("Failed to check pending payment:", error);
    }
    return null;
  };

  const handlePurchaseClick = async (pkg: TokenPackage) => {
    setSelectedPkg(pkg);
    setCheckingPending(true);

    const pending = await checkPendingPayment();
    setCheckingPending(false);

    if (pending) {
      setPendingPayment(pending);
      setShowPendingDialog(true);
    } else {
      setIsModalOpened(true);
    }
  };

  const handleCreatePayment = async () => {
    setIsModalLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/shop/create/${selectedPkg?.id}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || res.statusText);
      }

      const data: EWalletPaymentResponse = await res.json();
      setPaymentData(data);
      setTransactionId(data.transactionId);
      setIsModalLoading(false);
      setShowContact(false);

      if (isMobile && data.deeplinkUrl) {
        toast.info("Membuka aplikasi GoPay...");
        window.location.href = data.deeplinkUrl;
      }
    } catch (e: Error | any) {
      setIsModalLoading(false);
      toast.error(e.message || "Gagal membuat kode QRIS.");
    }
  };

  const handleCancelPayment = async () => {
    if (!pendingPayment) return;

    setCancellingPayment(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/shop/cancel/${pendingPayment.id}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Gagal membatalkan transaksi.");
      }

      toast.success("Transaksi dibatalkan.");
      setShowPendingDialog(false);
      setPendingPayment(null);
      setIsModalOpened(true);
    } catch (error: any) {
      toast.error(error.message || "Gagal membatalkan transaksi.");
    } finally {
      setCancellingPayment(false);
    }
  };

  const handleContinuePendingPayment = () => {
    if (!pendingPayment?.metadata) {
      toast.error("Data transaksi tidak lengkap.");
      return;
    }

    setPaymentData({
      transactionId: pendingPayment.id,
      orderId: pendingPayment.orderId,
      amount: pendingPayment.amount,
      tokenAmount: pendingPayment.tokenAmount,
      status: pendingPayment.status,
      paymentMethod: pendingPayment.paymentMethod,
      qrCodeUrl: pendingPayment.metadata.qr_code_url,
      deeplinkUrl: pendingPayment.metadata.deeplink_url,
      expiryTime: pendingPayment.expiresAt,
      packageName: pendingPayment.tokenPackage.name,
    });

    setTransactionId(pendingPayment.id);
    setShowPendingDialog(false);
    setIsModalOpened(true);

    if (isMobile && pendingPayment.metadata.deeplink_url) {
      window.location.href = pendingPayment.metadata.deeplink_url;
    }
  };

  const handleManualCheck = async () => {
    if (!paymentData?.orderId) return;

    setIsCheckingStatus(true);

    try {
      const res = await fetch(
        `${BACKEND_URL}/shop/midtrans/check-status/${paymentData.orderId}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Gagal memeriksa status.");
      }

      const data = await res.json();

      if (data.status === "PENDING") {
        toast.warning("Pembayaran belum masuk. Coba cek beberapa saat lagi.");
      } else if (data.status === "CONFIRMED") {
        // Handled by poller
      } else {
        toast.error(
          "Waktu bayar habis. Buat kode QRIS baru untuk lanjut.",
        );
      }
    } catch (e: any) {
      toast.error(e.message || "Gagal memeriksa status pembayaran.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Summary Bar: Current Coin Balance */}
      <div className="bg-slate-900 text-white border border-slate-800 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-slate-400 mb-1">
            BELI COINS TRYOUT · BAYAR SEKALI VIA QRIS
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Paket coins tanpa langganan
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-[58ch]">
            1 coin membuka skor IRT, persentil nasional, dan pembahasan 155
            soal untuk 1 tryout. Coins tidak hangus sampai SNBT selesai.
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 px-5 py-3.5 shrink-0 shadow-xs">
          <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400 mb-1">
            SALDO COINS KAMU
          </div>
          <div className="flex items-center gap-2">
            <PixelCoin size={26} glow />
            <div className="font-mono text-[28px] leading-tight font-bold text-amber-400">
              {userBalance} coins
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Beli Coins | Menunggu (n) | Riwayat */}
      <Tabs defaultValue="buy" className="space-y-6">
        <TabsList>
          <TabsTrigger value="buy">Beli Coins</TabsTrigger>
          <TabsTrigger value="pending">
            Menunggu ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="buy">
          {loadingPackages ? (
            <div className="bg-white border border-slate-200 p-12 text-center font-mono text-xs uppercase tracking-wider text-slate-500">
              MEMUAT PAKET COINS...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg, index) => {
                const basePerToken = 15000;
                const standardPrice = basePerToken * pkg.tokenAmount;
                const originalPrice = Math.max(
                  standardPrice,
                  Math.round(pkg.price * 1.2),
                );
                const savings = originalPrice - pkg.price;
                const pricePerToken = Math.round(
                  pkg.price / Math.max(1, pkg.tokenAmount),
                );
                const isRecommended = pkg.tokenAmount === 5;
                const isBestValue = pkg.tokenAmount === 10;

                const displayTitle =
                  pkg.name.toLowerCase().includes("coin") ||
                  pkg.name.toLowerCase().includes("koin") ||
                  pkg.name.toLowerCase().includes("kuota")
                    ? pkg.name.replace(/kuota/gi, "Coins").replace(/koin/gi, "Coins")
                    : `${pkg.tokenAmount} ${pkg.tokenAmount === 1 ? "Coin" : "Coins"}`;

                return (
                  <TokenCard
                    key={pkg.id}
                    pkg={{
                      id: Number(pkg.id) || index + 1,
                      title: displayTitle,
                      subtitle: "Skor IRT + pembahasan lengkap",
                      tokenAmount: pkg.tokenAmount,
                      originalPrice,
                      finalPrice: pkg.price,
                      discount:
                        originalPrice > pkg.price
                          ? Math.round(
                              ((originalPrice - pkg.price) / originalPrice) *
                                100,
                            )
                          : 0,
                      savings,
                      pricePerToken: String(pricePerToken),
                      categoryBg: "",
                      popular: isRecommended,
                      badge: isRecommended
                        ? "PALING BANYAK DIPILIH"
                        : isBestValue
                          ? "PALING HEMAT"
                          : undefined,
                    }}
                    onPressBuy={() => handlePurchaseClick(pkg)}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          <PendingTransactionList />
        </TabsContent>

        <TabsContent value="history">
          <PastTransactionList />
        </TabsContent>
      </Tabs>

      {/* Loading Dialog while checking pending */}
      {checkingPending && (
        <Dialog open={checkingPending} onOpenChange={() => {}}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="sr-only">Memeriksa transaksi</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600 mb-3" />
              <div className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600">
                MEMERIKSA TRANSAKSI...
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Pending Payment Dialog */}
      <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-blue-900">
              Ada pembayaran yang belum selesai
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-700">
              Selesaikan pembayaran QRIS sebelumnya atau batalkan untuk membuat
              kode baru.
            </DialogDescription>
          </DialogHeader>

          {pendingPayment && (
            <div className="space-y-4">
              <div className="space-y-2 p-4 bg-blue-50 border-2 border-blue-900 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">ORDER ID</span>
                  <span className="text-blue-900">{pendingPayment.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">PAKET</span>
                  <span className="font-sans font-semibold text-blue-900">
                    {pendingPayment.tokenPackage.name} (
                    {pendingPayment.tokenAmount} coins)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">TOTAL BAYAR</span>
                  <span className="font-medium text-blue-900">
                    Rp{pendingPayment.amount.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">BATAS WAKTU</span>
                  <span className="text-danger font-medium">
                    {new Date(pendingPayment.expiresAt).toLocaleTimeString(
                      "id-ID",
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleContinuePendingPayment}
                  variant="default"
                  className="w-full"
                >
                  Lanjutkan bayar
                </Button>

                <Button
                  onClick={handleCancelPayment}
                  variant="destructive"
                  className="w-full"
                  disabled={cancellingPayment}
                >
                  {cancellingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Membatalkan...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Batalkan transaksi
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setShowPendingDialog(false)}
                  variant="outline"
                  className="w-full"
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QRIS Payment Modal */}
      <Dialog
        open={isModalOpened}
        onOpenChange={(state) => {
          setIsModalOpened(state);

          if (!state) {
            setIsModalLoading(false);
            setTransactionId(null);
            setSelectedPkg(null);
            setShowContact(false);
            setPaymentData(null);
            setPaymentStatus("pending");
          }
        }}
        modal
      >
        <DialogContent className="sm:max-w-[460px]">
          {!isModalLoading && !transactionId && (
            <>
              <DialogHeader>
                <div className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600 mb-1">
                  PEMBAYARAN INSTAN
                </div>
                <DialogTitle className="font-display text-xl font-bold text-blue-900">
                  Bayar {selectedPkg?.tokenAmount} coins via QRIS
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-700">
                  Total tagihan{" "}
                  <span className="font-mono font-medium text-blue-900">
                    Rp{(selectedPkg?.price ?? 0).toLocaleString("id-ID")}
                  </span>
                  . Bisa dibayar pakai GoPay, OVO, DANA, ShopeePay, atau
                  m-banking.
                </DialogDescription>
              </DialogHeader>
              <div className="pt-2">
                <Button
                  className="w-full"
                  variant="default"
                  size="lg"
                  onClick={handleCreatePayment}
                >
                  {isMobile ? (
                    <Smartphone className="w-4 h-4 mr-2" />
                  ) : (
                    <Monitor className="w-4 h-4 mr-2" />
                  )}
                  Buat kode QRIS
                </Button>
              </div>
            </>
          )}

          {isModalLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600 mb-3" />
              <div className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600">
                MEMBUAT KODE QRIS...
              </div>
            </div>
          )}

          {!isModalLoading && transactionId && !showContact && (
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600">
                  ORDER #{paymentData?.orderId}
                </p>
                <h2 className="font-display text-xl font-bold text-blue-900 mt-1">
                  Scan QRIS untuk bayar
                </h2>
                <div className="font-mono text-2xl font-medium text-blue-900 mt-1">
                  Rp{(paymentData?.amount ?? selectedPkg?.price ?? 0).toLocaleString("id-ID")}
                </div>
              </div>

              {isMobile && paymentData?.deeplinkUrl && (
                <Button
                  onClick={() => {
                    if (paymentData?.deeplinkUrl) {
                      window.location.href = paymentData.deeplinkUrl;
                    }
                  }}
                  variant="default"
                  className="w-full"
                >
                  Buka aplikasi GoPay
                </Button>
              )}

              {paymentData?.qrCodeUrl && (
                <div className="p-4 border-2 border-blue-900 bg-white">
                  <img
                    src={paymentData.qrCodeUrl}
                    alt="Kode QRIS"
                    className="w-60 h-60 object-contain"
                  />
                </div>
              )}

              <div className="w-full bg-blue-50 border-[1.5px] border-blue-900 p-3 flex items-center justify-between font-mono text-xs">
                <span className="inline-flex items-center gap-2 text-blue-900">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  {paymentStatus === "PENDING" || paymentStatus === "pending"
                    ? "Menunggu pembayaran…"
                    : paymentStatus}
                </span>
                <span className="text-slate-600">
                  BATAS:{" "}
                  {paymentData?.expiryTime
                    ? new Date(paymentData.expiryTime).toLocaleTimeString(
                        "id-ID",
                      )
                    : "15 MENIT"}
                </span>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleManualCheck}
                disabled={isCheckingStatus}
              >
                {isCheckingStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memeriksa...
                  </>
                ) : (
                  "Cek status bayar"
                )}
              </Button>
            </div>
          )}

          {!isModalLoading && transactionId && showContact && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-blue-900">
                Pembayaran diproses
              </h2>
              <p className="text-sm text-slate-700">
                Jika dalam 1x24 jam coins belum masuk, hubungi kontak bantuan:
              </p>
              {contactInfos.map((contact) => (
                <Alert key={contact.name}>
                  <AlertCircleIcon className="h-4 w-4 shrink-0" />
                  <div>
                    <AlertTitle className="font-semibold">
                      {contact.name}
                    </AlertTitle>
                    <AlertDescription className="text-xs font-mono mt-1">
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
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowContact(false)}
              >
                Tampilkan QRIS
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShopModule;
