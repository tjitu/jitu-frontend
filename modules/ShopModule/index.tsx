"use client";
import { useState, useEffect, useRef } from "react";
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
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import TokenCard from "./components/TokenCard";
import PaymentOptions from "./components/PaymentOptions";
import { PremiumPassCard } from "@/components/premium/PremiumPassCard";
import { PremiumPassPurchaseDialog } from "@/components/premium/PremiumPassPurchaseDialog";
import { getShopPackageAccess, getShopPackageName, PREMIUM_PASS_COPY } from "@/lib/premium-pass-copy";
import { contactInfos, tokenPackages as fallbackTokenPackages } from "./payload";
import { BACKEND_URL } from "@/lib/api";
import { getUserStats, getCachedDashboardData } from "@/lib/api/DashboardApi";
import PendingTransactionList from "../PendingTransactionsModule/components/PendingTransactionList";
import SnapQrisEmbed from "@/components/payment/SnapQrisEmbed";
import PastTransactionList from "../PastTransactionsModule/components/PastTransactionList";

interface TokenPackage {
  id: string;
  name: string;
  tokenAmount: number;
  price: number;
  originalPrice?: number;
  badgeText?: string;
  badgeStyle?: string;
  campaignName?: string;
}

let cachedShopPackages: TokenPackage[] | null = null;

interface EWalletPaymentResponse {
  transactionId: string;
  orderId: string;
  amount: number;
  tokenAmount: number;
  status: string;
  paymentMethod: string;
  qrCodeUrl?: string;
  qrCode?: string;
  deeplinkUrl?: string;
  expiryTime?: string;
  packageName: string;
  snapToken?: string;
  clientKey?: string;
  redirectUrl?: string;
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
  packageName?: string;
  tokenPackage?: {
    id: string;
    name: string;
    tokenAmount: number;
    price: number;
  };
  snapToken?: string;
  clientKey?: string;
  metadata?: {
    qr_code_url?: string;
    qr_string?: string;
    deeplink_url?: string;
    redirect_url?: string;
    snap_token?: string;
    midtrans_transaction_id?: string;
    package_name?: string;
  };
}

const ShopModule = () => {
  const initialDashboardStats = getCachedDashboardData()?.stats;
  const [packages, setPackages] = useState<TokenPackage[]>(
    cachedShopPackages ?? []
  );
  const [loadingPackages, setLoadingPackages] = useState(!cachedShopPackages);
  const [userBalance, setUserBalance] = useState<number>(
    initialDashboardStats?.tokenBalance ?? 0
  );
  const [pendingCount, setPendingCount] = useState<number>(0);

  const [isModalOpened, setIsModalOpened] = useState(false);
  const [showOuterSnapClose, setShowOuterSnapClose] = useState(false);
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
  const pendingPackageName =
    pendingPayment?.tokenPackage?.name ||
    pendingPayment?.packageName ||
    pendingPayment?.metadata?.package_name ||
    "Paket coin";

  // PTN Premium Pass State
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isHighlightPass, setIsHighlightPass] = useState(false);
  const [isActivatingPass, setIsActivatingPass] = useState(false);
  const passCardRef = useRef<HTMLDivElement>(null);
  const [isPassSelected, setIsPassSelected] = useState(false);

  // Voucher / Referral Code state
  const [voucherInput, setVoucherInput] = useState("");
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discountPercent: number;
    discountAmount: number;
    finalPrice: number;
    originalPrice: number;
    description?: string;
    referrerName?: string;
  } | null>(null);

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim() || !selectedPkg) return;
    setValidatingVoucher(true);
    try {
      const res = await fetch("/api/proxy/shop/voucher/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: voucherInput.trim(),
          packageId: selectedPkg.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.message || "Kode voucher tidak valid.");
      }
      setAppliedVoucher(data);
      toast.success(
        `Voucher ${data.code} berhasil diterapkan! Diskon ${data.discountPercent}%`
      );
    } catch (err: any) {
      toast.error(err.message || "Gagal menerapkan kode voucher.");
    } finally {
      setValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput("");
  };

  const router = useRouter();

  useEffect(() => {
    if (!passCardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsPassSelected(true);
            }, 100);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(passCardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get("highlight") === "premium-pass" ||
        window.location.hash === "#ptn-premium-pass-card"
      ) {
        setIsHighlightPass(true);
        setTimeout(() => {
          const el = document.getElementById("ptn-premium-pass-card");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 200);
        setTimeout(() => {
          setIsHighlightPass(false);
        }, 5000);
      }
    }
  }, []);

  const premiumPassPkg = packages.find(
    (p) => p.name.toLowerCase().includes("pass"),
  ) || {
    id: "f5f69e7c-9a5f-4214-917e-213a3cb000d9",
    name: PREMIUM_PASS_COPY.name,
    tokenAmount: 4,
    price: 55000,
  };

  const coinPackages = packages.filter(
    (p) => !p.name.toLowerCase().includes("pass"),
  );

  const handleActivatePremiumPass = () => {
    setIsPremiumModalOpen(false);
    handlePurchaseClick(premiumPassPkg);
  };

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
        if (typeof stats.isPremium === "boolean") {
          setIsPremiumUser(stats.isPremium);
        }
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
            toast.success("Pembayaran berhasil. Coin sudah masuk ke akunmu.");
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
    if (cachedShopPackages && cachedShopPackages.length > 0) {
      setLoadingPackages(false);
      return;
    }

    const fetchPackages = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/shop/packages`);
        if (res.ok) {
          const data = await res.json();
          const resolved: TokenPackage[] =
            Array.isArray(data) && data.length > 0
              ? data
              : fallbackTokenPackages.map((p) => ({
                  id: String(p.id),
                  name: p.title,
                  tokenAmount: p.tokenAmount,
                  price: p.finalPrice,
                }));
          cachedShopPackages = resolved;
          setPackages(resolved);
        } else {
          const fallback = fallbackTokenPackages.map((p) => ({
            id: String(p.id),
            name: p.title,
            tokenAmount: p.tokenAmount,
            price: p.finalPrice,
          }));
          cachedShopPackages = fallback;
          setPackages(fallback);
        }
      } catch (error) {
        console.error(error);
        const fallback = fallbackTokenPackages.map((p) => ({
          id: String(p.id),
          name: p.title,
          tokenAmount: p.tokenAmount,
          price: p.finalPrice,
        }));
        cachedShopPackages = fallback;
        setPackages(fallback);
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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          voucherCode: appliedVoucher?.code,
        }),
      });

      const responseText = await res.text();
      let data: EWalletPaymentResponse & { message?: string; code?: string };
      try {
        data = JSON.parse(responseText) as EWalletPaymentResponse & {
          message?: string;
          code?: string;
        };
      } catch {
        throw new Error(
          `Server pembayaran mengirim respons tidak valid (HTTP ${res.status}). Coba lagi beberapa saat.`,
        );
      }
      if (!res.ok) {
        if (res.status === 409 && data.code === "PENDING_PAYMENT") {
          setIsModalLoading(false);
          setIsModalOpened(false);
          const pending = await checkPendingPayment();
          if (pending) {
            setPendingPayment(pending);
            setShowPendingDialog(true);
          } else {
            toast.warning(data.message || "Selesaikan pembayaran sebelumnya sebelum membeli paket lain.");
          }
          return;
        }
        throw new Error(data.message || res.statusText || "Pembayaran gagal dibuat.");
      }

      if (data.status === "CONFIRMED") {
        toast.success("Pembayaran berhasil dan manfaat paket langsung aktif!");
        setIsModalLoading(false);
        setIsModalOpened(false);
        setTimeout(() => router.refresh(), 1000);
        return;
      }

      setPaymentData(data);
      setShowOuterSnapClose(false);
      setTransactionId(data.transactionId);
      setPendingCount((prev) => prev + 1);
      setIsModalLoading(false);
      setShowContact(false);
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
    if (!pendingPayment) {
      toast.error("Data transaksi tidak lengkap.");
      return;
    }

    const meta = pendingPayment.metadata || {};
    setShowOuterSnapClose(false);
    setPaymentData({
      transactionId: pendingPayment.id,
      orderId: pendingPayment.orderId,
      amount: pendingPayment.amount,
      tokenAmount: pendingPayment.tokenAmount,
      status: pendingPayment.status,
      paymentMethod: pendingPayment.paymentMethod,
      qrCodeUrl: meta.qr_code_url,
      qrCode: meta.qr_string,
      deeplinkUrl: meta.deeplink_url,
      snapToken: pendingPayment.snapToken || meta.snap_token,
      clientKey: pendingPayment.clientKey,
      redirectUrl: meta.redirect_url,
      expiryTime: pendingPayment.expiresAt,
      packageName: pendingPackageName,
    });

    setTransactionId(pendingPayment.id);
    setShowPendingDialog(false);
    setIsModalOpened(true);
  };

  const handlePaymentModalOpenChange = (state: boolean) => {
    setIsModalOpened(state);
    if (!state) {
      setIsModalLoading(false);
      setTransactionId(null);
      setSelectedPkg(null);
      setShowContact(false);
      setPaymentData(null);
      setPaymentStatus("pending");
      setShowOuterSnapClose(false);
      setVoucherInput("");
      setAppliedVoucher(null);
      setValidatingVoucher(false);
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
      {/* Tabs: Beli | Menunggu (n) | Riwayat */}
      <Tabs defaultValue="buy" className="space-y-6">
        <TabsList>
          <TabsTrigger value="buy">Beli</TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-1.5">
            <span>Menunggu</span>
            {pendingCount > 0 ? (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full shadow-xs animate-pulse">
                {pendingCount}
              </span>
            ) : (
              <span className="text-xs text-text-muted">(0)</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-8">
          <PremiumPassCard
            id="ptn-premium-pass-card"
            price={premiumPassPkg.price}
            originalPrice={premiumPassPkg.originalPrice}
            campaignName={premiumPassPkg.campaignName}
            badgeText={premiumPassPkg.badgeText}
            badgeStyle={premiumPassPkg.badgeStyle}
            highlighted={isHighlightPass}
            isActive={isPremiumUser}
            onActivate={() => setIsPremiumModalOpen(true)}
          />

          {/* Section Divider: Atau Beli Paket Coin */}
          <div className="flex items-center gap-3">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Atau Beli Paket Coin (Bayar Sekali Tanpa Langganan)
            </span>
            <div className="h-px bg-border flex-1" />
          </div>

          {loadingPackages ? (
            <div className="bg-surface border border-border rounded-lg p-12 text-center text-[13px] font-medium text-text-muted">
              Memuat paket coin...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {coinPackages.map((pkg, index) => {
                const basePerToken = 15000;
                const standardPrice = basePerToken * pkg.tokenAmount;
                const originalPrice = pkg.originalPrice || Math.max(
                  standardPrice,
                  Math.round(pkg.price * 1.2),
                );
                const savings = originalPrice - pkg.price;
                const pricePerToken = Math.round(
                  pkg.price / Math.max(1, pkg.tokenAmount),
                );
                const isBestValue = pkg.tokenAmount === 10;

                const displayTitle =
                  pkg.name.toLowerCase().includes("coin") ||
                  pkg.name.toLowerCase().includes("koin") ||
                  pkg.name.toLowerCase().includes("kuota")
                    ? pkg.name
                        .replace(/kuota/gi, "coin")
                        .replace(/koin/gi, "coin")
                        .replace(/coins/gi, "coin")
                    : `${pkg.tokenAmount} coin`;

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
                      popular: false,
                      badge: pkg.badgeText || (isBestValue ? "Paling hemat" : undefined),
                      badgeStyle: pkg.badgeStyle,
                      campaignName: (pkg as any).campaignName,
                    }}
                    onPressBuy={() => handlePurchaseClick(pkg)}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          <PendingTransactionList onCountChange={setPendingCount} />
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
              <Loader2 className="w-7 h-7 animate-spin text-primary mb-3" />
              <div className="text-[13px] font-medium text-text-muted">
                Memeriksa transaksi...
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Pending Payment Dialog */}
      <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-text">
              Ada pembayaran yang belum selesai
            </DialogTitle>
            <DialogDescription className="text-[14px] text-text-muted">
              Selesaikan pembayaran sebelumnya sebelum membeli paket lain.
              Kamu juga bisa membatalkan transaksi lama untuk membuat kode baru.
            </DialogDescription>
          </DialogHeader>

          {pendingPayment && (
            <div className="space-y-4">
              <div className="space-y-2.5 p-4 bg-surface-muted border border-border rounded-md text-[13px]">
                <div className="flex justify-between">
                  <span className="text-text-muted">Order ID</span>
                  <span className="font-mono text-text">{pendingPayment.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Paket</span>
                  <span className="font-semibold text-text">
                    {getShopPackageName(pendingPackageName)} ·{" "}
                    {getShopPackageAccess(pendingPackageName, pendingPayment.tokenAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Total bayar</span>
                  <span className="font-mono font-semibold text-text">
                    Rp{Number(pendingPayment.amount).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Batas waktu</span>
                  <span className="font-mono text-danger font-medium">
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
        onOpenChange={handlePaymentModalOpenChange}
        modal
      >
        <DialogContent
          className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto"
          showCloseButton={!(transactionId && !isModalLoading && !showContact && paymentData?.redirectUrl && paymentData?.snapToken && !paymentData?.qrCodeUrl && !paymentData?.qrCode && !showOuterSnapClose)}
        >
          {!isModalLoading && !transactionId && (
            <PaymentOptions
              isPremiumPass={Boolean(selectedPkg?.name.toLowerCase().includes("pass"))}
              tokenAmount={selectedPkg?.tokenAmount ?? 0}
              price={selectedPkg?.price ?? 0}
              voucher={appliedVoucher}
              voucherInput={voucherInput}
              validatingVoucher={validatingVoucher}
              onVoucherInputChange={setVoucherInput}
              onApplyVoucher={handleApplyVoucher}
              onRemoveVoucher={handleRemoveVoucher}
              onPay={handleCreatePayment}
            />
          )}

          {isModalLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="w-7 h-7 animate-spin text-primary mb-3" />
              <div className="text-[13px] font-medium text-text-muted">
                Membuat kode QRIS...
              </div>
            </div>
          )}

          {!isModalLoading && transactionId && !showContact && (() => {
            const qrImageUrl =
              paymentData?.qrCodeUrl ||
              (paymentData?.qrCode
                ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentData.qrCode)}&size=300x300`
                : null);
            const usesSnapCheckout = Boolean(paymentData?.redirectUrl && !qrImageUrl);

            if (usesSnapCheckout && paymentData?.snapToken) {
              return (
                <SnapQrisEmbed
                  token={paymentData.snapToken}
                  clientKey={paymentData.clientKey || ""}
                  paymentId={transactionId}
                  onClose={() => handlePaymentModalOpenChange(false)}
                  onShowClose={() => setShowOuterSnapClose(true)}
                />
              );
            }

            if (qrImageUrl) {
              return (
                <div className="flex justify-center py-2">
                  <img src={qrImageUrl} alt="Kode QRIS pembayaran" className="h-[280px] w-[280px] object-contain" />
                </div>
              );
            }

            return (
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="text-center">
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary">
                    PEMBAYARAN QRIS
                  </p>
                  <h2 className="text-[20px] font-bold text-text mt-1">
                    Scan QRIS untuk bayar
                  </h2>
                  <div className="font-mono text-2xl font-bold text-text mt-1 tabular-nums">
                    Rp{(paymentData?.amount ?? selectedPkg?.price ?? 0).toLocaleString("id-ID")}
                  </div>
                </div>

                <div className={usesSnapCheckout ? "w-full" : "w-full max-w-[280px] p-4 bg-white border border-border rounded-2xl flex items-center justify-center shadow-sm"}>
                  {qrImageUrl ? (
                    <img
                      src={qrImageUrl}
                      alt="Kode QRIS"
                      className="w-56 h-56 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-56 h-56 flex flex-col items-center justify-center text-text-muted gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <span className="text-xs">Memuat kode QRIS...</span>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="font-mono text-xs text-text-muted">
                    ID transaksi: <span className="text-text font-medium">{paymentData?.orderId || transactionId}</span>
                  </p>
                </div>

                <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 text-blue-800 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    {paymentStatus === "PENDING" || paymentStatus === "pending"
                      ? "Menunggu pembayaran…"
                      : paymentStatus}
                  </span>
                  <span className="font-mono text-text-muted">
                    Batas:{" "}
                    {paymentData?.expiryTime
                      ? new Date(paymentData.expiryTime).toLocaleTimeString(
                          "id-ID",
                        )
                      : "15 menit"}
                  </span>
                </div>

                {isMobile && paymentData?.deeplinkUrl && (
                  <Button
                    onClick={() => {
                      if (paymentData?.deeplinkUrl) {
                        window.location.href = paymentData.deeplinkUrl;
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    Buka di aplikasi GoPay
                  </Button>
                )}

                <Button
                  variant="default"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-sm shadow-sm"
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

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={cancellingPayment}
                  onClick={async () => {
                    if (!transactionId) return;
                    setCancellingPayment(true);
                    try {
                      const res = await fetch(
                        `${BACKEND_URL}/shop/cancel/${transactionId}`,
                        {
                          method: "POST",
                          credentials: "include",
                        },
                      );
                      if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.message || "Gagal membatalkan transaksi.");
                      }
                      toast.success("Transaksi berhasil dibatalkan.");
                      setIsModalOpened(false);
                      setTransactionId(null);
                      setPaymentData(null);
                      setPendingCount((prev) => Math.max(0, prev - 1));
                    } catch (err: any) {
                      toast.error(err.message || "Gagal membatalkan transaksi.");
                    } finally {
                      setCancellingPayment(false);
                    }
                  }}
                >
                  {cancellingPayment ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      Membatalkan...
                    </>
                  ) : (
                    "Batalkan transaksi ini"
                  )}
                </Button>
              </div>
            );
          })()}

          {!isModalLoading && transactionId && showContact && (
            <div className="space-y-4">
              <h2 className="text-[20px] font-bold text-text">
                Pembayaran diproses
              </h2>
              <p className="text-[14px] text-text-body">
                Jika dalam 1x24 jam manfaat paket belum aktif, hubungi kontak bantuan:
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

      <PremiumPassPurchaseDialog
        open={isPremiumModalOpen}
        onOpenChange={setIsPremiumModalOpen}
        onActivate={handleActivatePremiumPass}
        price={premiumPassPkg.price}
        loading={isActivatingPass}
      />
    </div>
  );
};

export default ShopModule;
