import Link from "next/link";
import type { ReactNode } from "react";

export type ErrorVariant = "not-found" | "unauthorized" | "forbidden" | "server";

const CONTENT: Record<
  ErrorVariant,
  { code: string; title: string; description: string }
> = {
  "not-found": {
    code: "404",
    title: "Halaman tidak ditemukan",
    description:
      "Alamat yang kamu buka tidak ada atau sudah dipindahkan. Cek lagi tautannya, atau kembali ke beranda.",
  },
  unauthorized: {
    code: "401",
    title: "Masuk dulu untuk melanjutkan",
    description:
      "Halaman ini hanya bisa dibuka setelah kamu masuk ke akun Jitu.",
  },
  forbidden: {
    code: "403",
    title: "Kamu tidak punya akses",
    description:
      "Akun yang sedang dipakai tidak punya izin untuk membuka halaman ini. Coba masuk dengan akun lain.",
  },
  server: {
    code: "500",
    title: "Terjadi kendala di sistem kami",
    description:
      "Halaman gagal dimuat. Coba muat ulang. Kalau masih sama, tunggu beberapa menit lalu coba lagi.",
  },
};

const BUTTON_BASE =
  "inline-flex h-11 items-center justify-center rounded-[10px] px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
export const ERROR_PRIMARY_BUTTON = `${BUTTON_BASE} bg-primary text-on-primary hover:bg-primary-hover`;
export const ERROR_SECONDARY_BUTTON = `${BUTTON_BASE} border border-border bg-surface text-text hover:bg-surface-muted`;

type ErrorScreenProps = {
  variant: ErrorVariant;
  /** Extra actions rendered before the default "Kembali ke beranda" link. */
  actions?: ReactNode;
  /** Reference code (e.g. Next.js error digest) shown in small print. */
  reference?: string;
};

export default function ErrorScreen({ variant, actions, reference }: ErrorScreenProps) {
  const { code, title, description } = CONTENT[variant];

  return (
    <main className="flex min-h-dvh flex-col bg-bg text-text-body">
      <header className="mx-auto w-full max-w-[1200px] px-5 py-5 md:px-8">
        <Link
          href="/"
          aria-label="Jitu, ke beranda"
          className="inline-flex min-h-11 items-center text-2xl font-extrabold tracking-tight text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          jitu<span className="text-yellow-400">.</span>
        </Link>
      </header>

      <section className="mx-auto flex w-full max-w-[720px] flex-1 flex-col justify-center px-5 pb-24 md:px-8">
        <p
          aria-hidden="true"
          className="select-none font-extrabold leading-none tracking-tight text-primary [font-size:clamp(5rem,3rem+10vw,9rem)] [font-variant-numeric:tabular-nums]"
        >
          {code}
          <span className="text-yellow-400">.</span>
        </p>

        <h1 className="mt-6 text-balance font-bold tracking-tight text-text [font-size:clamp(1.5rem,1.3rem+0.8vw,2rem)] leading-[1.2]">
          {title}
        </h1>
        <p className="mt-3 max-w-[56ch] text-pretty leading-relaxed text-text-muted">
          {description}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {actions}
          <Link
            href="/"
            className={actions ? ERROR_SECONDARY_BUTTON : ERROR_PRIMARY_BUTTON}
          >
            Kembali ke beranda
          </Link>
        </div>

        {reference ? (
          <p className="mt-10 text-sm text-text-muted">
            Kode referensi: <span className="font-mono">{reference}</span>
          </p>
        ) : null}
      </section>
    </main>
  );
}
