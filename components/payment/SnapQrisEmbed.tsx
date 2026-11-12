"use client";

import { useEffect, useId, useRef, useState } from "react";

type SnapClient = {
  embed: (
    token: string,
    options: {
      embedId: string;
      uiMode: "qr";
      onError: () => void;
      onPending: () => void;
      onSuccess: () => void;
      onClose: () => void;
    },
  ) => void;
  hide: () => void;
};

declare global {
  interface Window {
    snap?: SnapClient;
  }
}

export default function SnapQrisEmbed({
  token,
  clientKey,
  paymentId,
  onClose,
  onShowClose,
}: {
  token: string;
  clientKey: string;
  paymentId: string;
  onClose?: () => void;
  onShowClose?: () => void;
}) {
  const embedId = `snap-qris-${useId().replace(/:/g, "")}`;
  const [error, setError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const onCloseRef = useRef(onClose);
  const onShowCloseRef = useRef(onShowClose);

  useEffect(() => {
    onCloseRef.current = onClose;
    onShowCloseRef.current = onShowClose;
  }, [onClose, onShowClose]);

  useEffect(() => {
    if (!token || !clientKey) {
      return;
    }

    let active = true;
    const showQr = () => {
      if (!active) return;
      if (!window.snap) {
        setError("Halaman QRIS Midtrans gagal dimuat.");
        onShowCloseRef.current?.();
        return;
      }
      window.snap.embed(token, {
        embedId,
        uiMode: "qr",
        onError: () => {
          if (!active) return;
          setError("Kode QRIS gagal dimuat oleh Midtrans.");
          onShowCloseRef.current?.();
        },
        onPending: () => {},
        onSuccess: () => {},
        onClose: () => {
          if (active) onCloseRef.current?.();
        },
      });
    };

    let script = document.getElementById("midtrans-snap-js") as HTMLScriptElement | null;
    if (window.snap) {
      showQr();
    } else if (script) {
      script.addEventListener("load", showQr);
    } else {
      script = document.createElement("script");
      script.id = "midtrans-snap-js";
      script.src = "https://app.midtrans.com/snap/snap.js";
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      script.addEventListener("load", showQr);
      script.addEventListener("error", () => {
        if (active) {
          setError("Skrip QRIS Midtrans gagal dimuat.");
          onShowCloseRef.current?.();
        }
      });
      document.body.appendChild(script);
    }

    return () => {
      active = false;
      script?.removeEventListener("load", showQr);
      window.snap?.hide();
    };
  }, [token, clientKey, embedId]);

  useEffect(() => {
    if (!paymentId) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;

    const readQr = async () => {
      attempts += 1;
      try {
        const response = await fetch(`/api/proxy/shop/check/${encodeURIComponent(paymentId)}`, {
          method: "POST",
          credentials: "include",
        });
        if (response.ok) {
          const result = (await response.json()) as { qrCodeUrl?: string };
          if (result.qrCodeUrl) {
            const url = new URL(result.qrCodeUrl);
            if (
              url.protocol === "https:" &&
              (url.hostname.endsWith(".midtrans.com") ||
                url.hostname.endsWith(".veritrans.co.id"))
            ) {
              if (active) {
                setQrCodeUrl(url.toString());
                onShowCloseRef.current?.();
              }
              return;
            }
          }
        }
      } catch {
        // Snap may not have initialized the payment attempt yet.
      }
      if (!active) return;
      // Snap needs the customer to generate the payment code in its own UI.
      // Keep that UI usable until the plain QR is available from Get Status.
      if (attempts < 180) timer = setTimeout(readQr, 5000);
    };

    void readQr();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [paymentId]);

  return (
    <div className="w-full">
      {qrCodeUrl ? (
        <div className="flex justify-center py-2">
          <img src={qrCodeUrl} alt="Kode QRIS pembayaran" className="h-[280px] w-[280px] object-contain" />
        </div>
      ) : error || !token || !clientKey ? (
        <p role="alert" className="py-8 text-center text-sm text-red-600">
          {error || "Konfigurasi QRIS belum lengkap."}
        </p>
      ) : null}
      <div
        id={embedId}
        aria-hidden={Boolean(qrCodeUrl)}
        className={qrCodeUrl ? "hidden" : "min-h-[520px] w-full"}
      />
    </div>
  );
}
