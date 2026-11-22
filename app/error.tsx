"use client";

import { useEffect } from "react";
import ErrorScreen, { ERROR_PRIMARY_BUTTON } from "@/components/error-screen";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      variant="server"
      reference={error.digest}
      actions={
        <button type="button" onClick={reset} className={ERROR_PRIMARY_BUTTON}>
          Coba lagi
        </button>
      }
    />
  );
}
