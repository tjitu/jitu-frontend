import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, BookOpen, Calendar, Clock } from "lucide-react";
import { formatArticleDate, getPublishedArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Blog & Panduan UTBK · Jitu",
  description:
    "Kumpulan panduan belajar, strategi tembus PTN impian, bedah sistem skor IRT, dan info resmi SNBT terbaru dari tim Jitu Edukasi.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const articles = await getPublishedArticles();

  return (
    <main className="min-h-screen bg-bg text-text selection:bg-yellow-300 selection:text-ink-900 relative">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[url('/white-speckled-paper.svg')] opacity-60 bg-repeat bg-[length:450px_450px] pointer-events-none z-0"
      />

      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Kembali ke Beranda</span>
          </Link>
          <Link href="/" aria-label="Beranda Jitu" className="inline-flex items-center">
            <Image
              src="/blue-jitu-logo.png"
              alt="Logo Jitu"
              width={36}
              height={24}
              className="h-6 w-auto object-contain"
            />
          </Link>
        </div>
      </header>

      <div className="relative z-10 max-w-[1000px] mx-auto px-4 sm:px-8 pt-12 sm:pt-16 pb-20 space-y-12">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[12px] font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span>Blog & Kabar Jitu</span>
          </div>
          <h1 className="text-[34px] sm:text-[44px] font-black text-text tracking-tight leading-[1.15]">
            Panduan, Analisis & Strategi Tembus PTN
          </h1>
          <p className="text-[16px] sm:text-[18px] text-text-body leading-relaxed">
            Artikel to-the-point seputar persiapan UTBK-SNBT, bedah materi TPS & Literasi, serta kabar pembaruan fitur platform Jitu.
          </p>
        </div>

        {articles === null ? (
          <div role="status" className="rounded-xl border border-border bg-surface p-6 text-[14px] text-text-body">
            Artikel belum bisa dimuat. Coba buka lagi beberapa saat.
          </div>
        ) : articles.length === 0 ? (
          <div role="status" className="rounded-xl border border-border bg-surface p-6 text-[14px] text-text-body">
            Belum ada artikel yang diterbitkan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="group overflow-hidden rounded-xl bg-surface border border-border transition-colors hover:border-blue-300 flex flex-col"
              >
                {article.coverImageUrl && (
                  <Image
                    unoptimized
                    src={article.coverImageUrl}
                    alt=""
                    width={720}
                    height={405}
                    className="aspect-[16/9] w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col justify-between gap-6 p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                      <span className="text-primary">{article.category}</span>
                      <span className="inline-flex shrink-0 items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTimeMinutes} min baca
                      </span>
                    </div>
                    <h2 className="text-[18px] font-bold text-text leading-snug group-hover:text-primary transition-colors">
                      <Link
                        className="focus-visible:outline-2 focus-visible:outline-focus"
                        href={`/blog/${encodeURIComponent(article.slug)}`}
                      >
                        {article.title}
                      </Link>
                    </h2>
                    {article.summary && (
                      <p className="text-[13px] text-text-body leading-relaxed line-clamp-4">
                        {article.summary}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border/80 flex items-center justify-between gap-4 text-[12px] text-text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatArticleDate(article.publishedAt, article.createdAt)}
                    </span>
                    <Link
                      href={`/blog/${encodeURIComponent(article.slug)}`}
                      className="text-primary font-semibold inline-flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-focus"
                    >
                      Baca <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="rounded-2xl bg-blue-50/70 border border-blue-200/80 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-[18px] font-bold text-text">
              Mau langsung coba tryout gratis minggu ini?
            </h2>
            <p className="text-[14px] text-text-body">
              Kerjakan tryout SNBT berstandar IRT dan dapatkan analisis subtesmu secara instan.
            </p>
          </div>
          <Link
            href="/register"
            className="shrink-0 px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-[14px] inline-flex items-center gap-2 hover:bg-primary-hover active:bg-primary-pressed transition-colors duration-[120ms]"
          >
            <span>Daftar Gratis</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </Link>
        </div>
      </div>
    </main>
  );
}
