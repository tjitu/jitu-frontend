"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
  Check,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import TokenCard from "./components/TokenCard";
import { PixelCoin } from "@/components/ui/pixel-coin";
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
  tokenPackage: {
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
      const active =
        localStorage.getItem("jitu_ptn_premium_pass") === "true" ||
        localStorage.getItem("jitu_is_premium") === "true";
      setIsPremiumUser(active);

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
    name: "PTN Premium Pass",
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
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "jitu_ptn_premium_pass",
              stats.isPremium ? "true" : "false",
            );
          }
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
      let data: EWalletPaymentResponse & { message?: string };
      try {
        data = JSON.parse(responseText) as EWalletPaymentResponse & {
          message?: string;
        };
      } catch {
        throw new Error(
          `Server pembayaran mengirim respons tidak valid (HTTP ${res.status}). Coba lagi beberapa saat.`,
        );
      }
      if (!res.ok) {
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
      packageName: pendingPayment.tokenPackage.name,
    });

    setTransactionId(pendingPayment.id);
    setShowPendingDialog(false);
    setIsModalOpened(true);
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
          {/* PTN Premium Pass Hero Card (Matches Landing Page PtnPremiumPassCard Design) */}
          <div
            id="ptn-premium-pass-card"
            ref={passCardRef}
            className={`group relative w-full rounded-2xl bg-gradient-to-r from-[#143485] via-[#1D4ED8] to-[#163372] text-white p-6 sm:p-8 lg:p-9 border border-blue-400/40 shadow-xl shadow-blue-950/20 hover:border-blue-300/70 hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-300 overflow-hidden ${
              isHighlightPass
                ? "ring-4 ring-yellow-400 ring-offset-4 ring-offset-bg shadow-2xl scale-[1.01]"
                : ""
            }`}
          >
            {/* 1. Sweeping Ambient Shimmer Light Beam Animation */}
            <div
              aria-hidden="true"
              className="absolute -inset-full w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none animate-pass-shimmer"
            />

            {/* 2. Pulsing Ambient Glowing Orbs */}
            <div
              aria-hidden="true"
              className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl animate-pulse [animation-duration:4s] pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute top-0 right-1/3 w-64 h-64 rounded-full bg-yellow-400/10 blur-3xl animate-pulse [animation-duration:6s] pointer-events-none"
            />

            {/* 3. Hand-drawn Yellow & Light Blue Doodle Accessories (Animated, no collision) */}
            {/* Doodle 1: Light Blue Loop Swirl (Top-Left corner) */}
            <svg
              aria-hidden="true"
              className="hidden sm:block absolute top-2 left-[2.5%] w-13 h-11 text-blue-300/60 pointer-events-none drop-shadow-xs rotate-[-15deg] animate-doodle-2"
              viewBox="0 0 68 48"
              fill="none"
            >
              <path
                d="M6 34C18 18 24 8 14 6C4 4 8 22 24 24C40 26 48 12 62 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Doodle 2: Yellow Ribbon Loop Swirl (Centered horizontally between PTN Premium Pass and Rp55.000) */}
            <svg
              aria-hidden="true"
              className="hidden md:block absolute top-2 left-[57%] -translate-x-1/2 w-14 h-12 text-[#FFD13B]/80 pointer-events-none drop-shadow-xs rotate-[8deg] animate-doodle-1"
              viewBox="0 0 68 48"
              fill="none"
            >
              <path
                d="M8 38C22 34 38 18 30 8C22 -2 12 14 30 22C48 30 58 16 66 10"
                stroke="currentColor"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Doodle 3: Light Blue Spring Curl (Bottom-Center space) */}
            <svg
              aria-hidden="true"
              className="hidden lg:block absolute -bottom-1.5 left-[42%] w-14 h-12 text-blue-200/50 pointer-events-none drop-shadow-xs rotate-[8deg] animate-doodle-1"
              viewBox="0 0 68 48"
              fill="none"
            >
              <path
                d="M6 26C16 12 24 14 26 22C28 30 20 32 18 24C16 14 32 16 44 26C54 34 60 26 64 18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Doodle 4: Second Yellow Accessory - Hand-drawn Curl Loop (Bottom-Right empty space, away from text) */}
            <svg
              aria-hidden="true"
              className="hidden md:block absolute -bottom-2 right-[27%] w-15 h-13 text-[#FFD13B]/85 pointer-events-none drop-shadow-xs rotate-[16deg] animate-doodle-2"
              viewBox="0 0 68 48"
              fill="none"
            >
              <path
                d="M6 34C18 18 24 8 14 6C4 4 8 22 24 24C40 26 48 12 62 10"
                stroke="currentColor"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Doodle 5: Yellow Sparkle Star (Top-Right edge) */}
            <svg
              aria-hidden="true"
              className="absolute top-4 right-10 w-5 h-5 text-[#FFD13B]/75 pointer-events-none animate-pulse [animation-duration:3s]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>

            {/* Doodle 6: Light Blue Underline Swoop (Bottom-Left) */}
            <svg
              aria-hidden="true"
              className="hidden lg:block absolute bottom-1 left-[3%] w-16 h-8 text-blue-300/40 pointer-events-none"
              viewBox="0 0 80 36"
              fill="none"
            >
              <path
                d="M6 18C20 22 34 24 46 16C54 10 52 2 44 6C36 10 42 22 56 20C68 18 72 12 76 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
              {/* Left: Info, Floating Golden Pass Ticket & Benefits */}
              <div className="space-y-4 max-w-2xl">
                {/* Title with Golden Pass Ticket Icon & Scroll-Driven Selection */}
                <div className="flex items-center gap-3.5 sm:gap-4">
                  {/* Animated Floating Golden Ticket */}
                  <div className="w-14 h-12 sm:w-16 sm:h-14 lg:w-20 lg:h-16 shrink-0 relative select-none animate-ticket-float transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src="/icons/golden-pass-ticket.png"
                      alt="Tiket Golden Pass PTN Premium Pass"
                      fill
                      className="object-contain select-none pointer-events-none drop-shadow-md"
                      priority
                    />
                  </div>

                  <div>
                    {((premiumPassPkg as any).campaignName || premiumPassPkg.badgeText || isPremiumUser) && (
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {(premiumPassPkg as any).campaignName && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 text-yellow-300 border border-yellow-300/30 text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
                            <Sparkles className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                            {(premiumPassPkg as any).campaignName}
                          </span>
                        )}
                        {premiumPassPkg.badgeText && (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-xs ${
                              premiumPassPkg.badgeStyle === "RED_FIRE"
                                ? "bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white"
                                : premiumPassPkg.badgeStyle === "GOLD_PREMIUM"
                                ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black"
                                : premiumPassPkg.badgeStyle === "EMERALD_SAVE"
                                ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-white"
                                : premiumPassPkg.badgeStyle === "CYAN_ELECTRIC"
                                ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white"
                                : premiumPassPkg.badgeStyle === "PURPLE_ROYAL"
                                ? "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {premiumPassPkg.badgeText}
                          </span>
                        )}
                        {isPremiumUser && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            Pass Aktif
                          </span>
                        )}
                      </div>
                    )}

                    <h2 className="text-[28px] sm:text-[34px] lg:text-[38px] xl:text-[42px] font-black text-white tracking-tight leading-tight flex flex-wrap items-center gap-2.5">
                      <span>PTN</span>
                      {/* Scroll-driven selection badge */}
                      <span className="relative inline-block font-black select-none">
                        {/* Base unselected: crisp white text */}
                        <span className="text-white px-2.5 sm:px-3 py-0.5 inline-block">
                          PREMIUM PASS
                        </span>

                        {/* Selected overlay: yellow badge + black text revealed via wipe animation on first appearance */}
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 bg-[#FFD13B] text-black px-2.5 sm:px-3 py-0.5 rounded-xs inline-block shadow-sm overflow-hidden select-none pointer-events-none transition-[clip-path] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                          style={{
                            clipPath: isPassSelected ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
                          }}
                        >
                          PREMIUM PASS
                        </span>
                      </span>
                    </h2>
                  </div>
                </div>

                {/* 3 Checkmark Benefits (Exact match with Landing Page) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 pt-1">
                  <div className="flex items-center gap-2 text-[13px] sm:text-[14px] text-blue-100 font-medium">
                    <div className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-300 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Bebas akses pembahasan tryout tanpa coins</span>
                  </div>

                  <div className="flex items-center gap-2 text-[13px] sm:text-[14px] text-blue-100 font-medium">
                    <div className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-300 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Materi & latihan soal unlimited</span>
                  </div>

                  <div className="flex items-center gap-2 text-[13px] sm:text-[14px] text-blue-100 font-medium">
                    <div className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-300 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Analisis skor IRT & ranking nasional</span>
                  </div>
                </div>
              </div>

              {/* Right: Price & CTA Button with Continuous Spinning Border Beam Animation */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between lg:justify-center gap-4 shrink-0 pt-4 lg:pt-0 border-t border-blue-400/30 lg:border-t-0">
                <div className="text-left lg:text-right">
                  {premiumPassPkg.originalPrice && premiumPassPkg.originalPrice > premiumPassPkg.price && (
                    <div className="flex items-center lg:justify-end gap-2 mb-1">
                      <span className="text-sm line-through text-blue-200/80 font-bold tabular-nums">
                        Rp{premiumPassPkg.originalPrice.toLocaleString("id-ID")}
                      </span>
                      <span className="text-[11px] font-black text-yellow-300 bg-yellow-400/20 px-2 py-0.5 rounded">
                        Hemat Rp{(premiumPassPkg.originalPrice - premiumPassPkg.price).toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  <div className="inline-flex items-baseline gap-1.5">
                    <span className="text-[32px] sm:text-[38px] lg:text-[40px] font-black text-white leading-none tracking-tight tabular-nums">
                      Rp{premiumPassPkg.price.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[14px] sm:text-[15px] font-bold text-blue-200">
                      /bulan
                    </span>
                  </div>
                  <div className="text-[12px] text-blue-200/80 font-medium mt-1">
                    Akses penuh tanpa batas
                  </div>
                </div>

                {isPremiumUser ? (
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-bold text-[14px]">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>PTN Premium Pass Kamu Aktif</span>
                  </div>
                ) : (
                  <div className="relative p-[2.5px] rounded-xl overflow-hidden shadow-lg group/btn hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150">
                    {/* Spinning Border Beam */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-[-200%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,transparent_60%,rgba(255,255,255,0.95)_80%,#FFD13B_92%,transparent_100%)] pointer-events-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsPremiumModalOpen(true)}
                      className="relative w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-[10px] bg-[#FFD13B] hover:bg-[#ffc81f] active:bg-[#e6b315] text-black font-extrabold text-[15px] inline-flex items-center justify-center gap-2 transition-colors duration-120 cursor-pointer"
                    >
                      <span>Ambil Premium Pass</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

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
              Selesaikan pembayaran QRIS sebelumnya atau batalkan untuk membuat
              kode baru.
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
                    {pendingPayment.tokenPackage.name} (
                    {pendingPayment.tokenAmount} coin)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Total bayar</span>
                  <span className="font-mono font-semibold text-text">
                    Rp{pendingPayment.amount.toLocaleString("id-ID")}
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
        onOpenChange={(state) => {
          setIsModalOpened(state);

          if (!state) {
            setIsModalLoading(false);
            setTransactionId(null);
            setSelectedPkg(null);
            setShowContact(false);
            setPaymentData(null);
            setPaymentStatus("pending");
            setVoucherInput("");
            setAppliedVoucher(null);
            setValidatingVoucher(false);
          }
        }}
        modal
      >
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          {!isModalLoading && !transactionId && (
            <>
              <DialogHeader>
                <div className="text-label text-primary mb-1">
                  PEMBAYARAN INSTAN
                </div>
                <DialogTitle className="text-[20px] font-bold text-text">
                  Bayar {selectedPkg?.tokenAmount} coin via QRIS
                </DialogTitle>
                <DialogDescription className="text-[14px] text-text-body">
                  Total tagihan{" "}
                  {appliedVoucher ? (
                    <>
                      <span className="font-mono text-text-muted line-through mr-1.5">
                        Rp{(selectedPkg?.price ?? 0).toLocaleString("id-ID")}
                      </span>
                      <span className="font-mono font-bold text-emerald-500 text-base">
                        Rp{appliedVoucher.finalPrice.toLocaleString("id-ID")}
                      </span>
                    </>
                  ) : (
                    <span className="font-mono font-semibold text-text">
                      Rp{(selectedPkg?.price ?? 0).toLocaleString("id-ID")}
                    </span>
                  )}
                  . Bisa dibayar pakai GoPay, OVO, DANA, ShopeePay, atau
                  m-banking.
                </DialogDescription>
              </DialogHeader>

              {/* Voucher / Referral Code Input Box */}
              {!appliedVoucher ? (
                <div className="mt-2 p-3 rounded-xl border border-border bg-surface-muted/50">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-text mb-2">
                    <Ticket className="w-3.5 h-3.5 text-primary" />
                    <span>Punya Kode Voucher / Referal?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan kode..."
                      className="flex-1 uppercase font-mono text-xs px-3 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-1 focus:ring-primary placeholder:normal-case placeholder:font-sans"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyVoucher();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleApplyVoucher}
                      disabled={!voucherInput.trim() || validatingVoucher}
                      className="h-8 text-xs font-semibold px-3"
                    >
                      {validatingVoucher ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Gunakan"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">
                      %
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400">
                        <span>{appliedVoucher.code}</span>
                        <span className="text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          Hemat {appliedVoucher.discountPercent}%
                        </span>
                      </div>
                      <small className="text-[11px] text-text-muted block mt-0.5">
                        Potongan Rp{appliedVoucher.discountAmount.toLocaleString("id-ID")}
                        {appliedVoucher.referrerName ? ` • Referal: ${appliedVoucher.referrerName}` : ""}
                      </small>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="text-text-muted hover:text-red-400 text-xs px-2 py-1 rounded transition-colors"
                    title="Hapus voucher"
                  >
                    ✕
                  </button>
                </div>
              )}

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
                Jika dalam 1x24 jam coin belum masuk, hubungi kontak bantuan:
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

      {/* PTN Premium Pass Purchase Modal */}
      <Dialog open={isPremiumModalOpen} onOpenChange={setIsPremiumModalOpen}>
        <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden bg-gradient-to-br from-[#1C4ED8] via-[#2563EB] to-[#1E40AF] border-blue-400/30 text-white shadow-2xl">
          <div className="relative p-6 sm:p-7 space-y-5">
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-yellow-400/15 blur-3xl pointer-events-none"
            />

            <div className="flex items-start gap-4">
              <div className="w-16 h-14 sm:w-20 sm:h-16 relative shrink-0 select-none animate-ticket-float">
                <Image
                  src="/icons/golden-pass-ticket.png"
                  alt="Tiket Golden Pass PTN Premium Pass"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </div>

              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFD13B] text-black text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 fill-black" />
                  Konfirmasi Aktivasi
                </span>
                <DialogTitle className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Aktivasi PTN Premium Pass
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-blue-200">
                  Dapatkan akses unlimited latihan soal dan bebas buka pembahasan tryout sekarang.
                </DialogDescription>
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.08] border border-white/15 p-4 sm:p-5 space-y-3 backdrop-blur-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-yellow-300">
                Benefit yang Langsung Kamu Dapatkan:
              </div>
              <div className="space-y-2.5 text-xs sm:text-[13px] text-blue-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-yellow-400/25 text-yellow-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>
                    <strong>Bonus 4 Coins:</strong> Otomatis masuk ke saldo untuk tryout khusus
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-yellow-400/25 text-yellow-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>
                    <strong>Latihan Soal Unlimited:</strong> Bebas akses ribuan bank soal tanpa limit 10 soal per hari
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-yellow-400/25 text-yellow-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>
                    <strong>Unlimited Materi & Pembahasan:</strong> Bebas buka seluruh materi dan pembahasan tryout tanpa coin
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-yellow-400/25 text-yellow-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>
                    <strong>Analisis Skor IRT & Prediksi Kelulusan:</strong> Pantau target PTN impianmu
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-950/40 rounded-xl p-3.5 border border-white/10 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-blue-200">Biaya Langganan:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-black text-white">
                  Rp{premiumPassPkg.price.toLocaleString("id-ID")}
                </span>
                <span className="text-xs text-blue-200">/bulan</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsPremiumModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleActivatePremiumPass}
                disabled={isActivatingPass}
                className="px-6 py-2.5 rounded-xl bg-[#FFD13B] hover:bg-[#ffc81f] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isActivatingPass ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Mengaktifkan Pass...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-black" />
                    <span>Bayar & Aktifkan Sekarang (Rp{premiumPassPkg.price.toLocaleString("id-ID")})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShopModule;
