"use client";

import { useEffect, useId, useState } from "react";

type SnapClient = {
  embed: (
    token: string,
    options: {
      embedId: string;
      uiMode: "qr";
      onError: () => void;
      onPending: () => void;
      onSuccess: () => void;
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
}: {
  token: string;
  clientKey: string;
}) {
  const embedId = `snap-qris-${useId().replace(/:/g, "")}`;
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !clientKey) {
      return;
    }

    let active = true;
    const showQr = () => {
      if (!active) return;
      if (!window.snap) {
        setError("Halaman QRIS Midtrans gagal dimuat.");
        return;
      }
      window.snap.embed(token, {
        embedId,
        uiMode: "qr",
        onError: () => setError("Kode QRIS gagal dimuat oleh Midtrans."),
        onPending: () => {},
        onSuccess: () => {},
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
        if (active) setError("Skrip QRIS Midtrans gagal dimuat.");
      });
      document.body.appendChild(script);
    }

    return () => {
      active = false;
      script?.removeEventListener("load", showQr);
      window.snap?.hide();
    };
  }, [token, clientKey, embedId]);

  return (
    <div className="w-full">
      {error || !token || !clientKey ? (
        <p role="alert" className="py-8 text-center text-sm text-red-600">
          {error || "Konfigurasi QRIS belum lengkap."}
        </p>
      ) : null}
      <div id={embedId} className="min-h-[520px] w-full" />
    </div>
  );
}
