import Link from "next/link";
import type { ReactNode } from "react";

export const CONTACT_EMAIL = "team@jituptn.com";
export const LEGAL_LAST_UPDATED = "23 November 2026";

export interface LegalTocItem {
  id: string;
  title: string;
}

export function ContactEmail() {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="font-semibold text-primary underline underline-offset-4 hover:text-blue-700"
    >
      {CONTACT_EMAIL}
    </a>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 space-y-3">
      <h2 id={`${id}-title`} className="text-[20px] sm:text-[22px] font-bold tracking-tight text-text">
        {title}
      </h2>
      <div className="space-y-3 text-[15px] sm:text-[16px] leading-relaxed text-text-body">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-6 marker:text-text-muted">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * Shared shell for the legal pages. Server component on purpose: the text must be in the
 * HTML that crawlers (including Google's brand verification) receive.
 */
export function LegalDocument({
  title,
  intro,
  toc,
  otherPage,
  children,
}: {
  title: string;
  intro: ReactNode;
  toc: LegalTocItem[];
  otherPage: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-[20px] font-black tracking-tight text-text">
            Jitu PTN
          </Link>
          <Link href="/" className="text-[14px] font-medium text-text-muted hover:text-text">
            ← Kembali ke beranda
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-10 px-4 py-10 sm:px-6 sm:py-14">
        <div className="space-y-3">
          <h1 className="text-[32px] sm:text-[40px] font-black tracking-tight leading-tight text-text">{title}</h1>
          <p className="text-[14px] text-text-muted">Terakhir diperbarui: {LEGAL_LAST_UPDATED}</p>
          <div className="space-y-3 text-[15px] sm:text-[16px] leading-relaxed text-text-body">{intro}</div>
        </div>

        <nav aria-label="Daftar isi" className="rounded-xl border border-border bg-surface p-5">
          <p className="mb-3 text-[14px] font-bold text-text">Daftar isi</p>
          <ol className="list-decimal space-y-1.5 pl-5 text-[14px] sm:text-[15px] text-text-body marker:text-text-muted">
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="hover:text-primary hover:underline underline-offset-4">
                  {item.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {children}
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-6 text-[14px] text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© 2026 Jitu Edukasi</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href={otherPage.href} className="hover:text-text underline underline-offset-4">
              {otherPage.label}
            </Link>
            <ContactEmail />
          </div>
        </div>
      </footer>
    </div>
  );
}
