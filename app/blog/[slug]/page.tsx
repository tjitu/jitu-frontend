import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowRight, BookOpen, Calendar, Clock } from "lucide-react";
import { formatArticleDate, getPublishedArticle } from "@/lib/articles";

export const dynamic = "force-dynamic";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedArticle(slug);
  const article = result.article;

  if (!article) {
    return {
      title: "Artikel tidak ditemukan · Jitu",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `${article.title} · Blog Jitu`,
    description: article.summary || `Baca artikel ${article.title} dari ${article.authorName}.`,
    alternates: { canonical: `/blog/${encodeURIComponent(article.slug)}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary || undefined,
      publishedTime: article.publishedAt || article.createdAt,
      authors: [article.authorName],
      images: article.coverImageUrl ? [{ url: article.coverImageUrl }] : undefined,
    },
  };
}

const markdownComponents = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h2 className="mt-10 mb-4 text-2xl sm:text-3xl font-bold text-text leading-tight">{children}</h2>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="mt-10 mb-4 text-xl sm:text-2xl font-bold text-text leading-tight">{children}</h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="mt-8 mb-3 text-lg font-bold text-text leading-tight">{children}</h3>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="my-5 text-[16px] text-text-body leading-8">{children}</p>
  ),
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <a
      href={href}
      className="text-primary underline decoration-blue-200 underline-offset-4 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-focus"
      rel={href?.startsWith("http") ? "noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="my-5 list-disc space-y-2 pl-6 text-[16px] text-text-body leading-7">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="my-5 list-decimal space-y-2 pl-6 text-[16px] text-text-body leading-7">{children}</ol>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="my-7 border-l-4 border-primary bg-blue-50/60 px-5 py-2 text-text-body">{children}</blockquote>
  ),
  hr: () => <hr className="my-10 border-border" />,
  img: ({ src, alt }: { src?: string | Blob; alt?: string }) =>
    typeof src === "string" ? (
      <Image
        unoptimized
        src={src}
        alt={alt || ""}
        width={1200}
        height={675}
        className="my-8 h-auto w-full rounded-xl border border-border object-cover"
      />
    ) : null,
  pre: ({ children }: { children?: ReactNode }) => (
    <pre className="my-6 overflow-x-auto rounded-xl bg-ink-900 p-5 text-[13px] text-ink-50">{children}</pre>
  ),
  code: ({ children }: { children?: ReactNode }) => (
    <code className="rounded bg-surface-muted px-1.5 py-0.5 text-[0.9em] text-text">{children}</code>
  ),
  table: ({ children }: { children?: ReactNode }) => (
    <div className="my-7 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="border-b border-border bg-surface-muted px-4 py-3 font-semibold text-text">{children}</th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="border-b border-border px-4 py-3 text-text-body">{children}</td>
  ),
};

export default async function BlogArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const result = await getPublishedArticle(slug);
  const article = result.article;

  if (!article && !result.unavailable) notFound();

  if (!article) {
    return (
      <main className="min-h-screen bg-bg px-4 py-16 text-text">
        <div role="alert" className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-7 text-center">
          <h1 className="text-xl font-bold">Artikel belum bisa dimuat</h1>
          <p className="mt-2 text-sm text-text-body">Coba lagi beberapa saat lagi.</p>
          <Link href="/blog" className="mt-5 inline-flex items-center gap-2 font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Blog
          </Link>
        </div>
      </main>
    );
  }

  const publishedDate = formatArticleDate(article.publishedAt, article.createdAt);

  return (
    <main className="min-h-screen bg-bg text-text selection:bg-yellow-300 selection:text-ink-900">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-8">
          <Link
            href="/blog"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-focus"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Blog</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Jitu, kembali ke beranda">
            <Image src="/blue-jitu-logo.png" alt="" width={36} height={24} className="h-6 w-auto object-contain" />
            <span className="text-xl font-extrabold tracking-tight text-text">jitu<span className="text-primary">.</span></span>
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-8 sm:pt-16">
        <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-text-muted">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-primary hover:underline">
            <BookOpen className="h-3.5 w-3.5" /> Blog Jitu
          </Link>
          <span>{article.category}</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {article.readTimeMinutes} min baca
          </span>
        </div>

        <h1 className="text-3xl font-black leading-tight tracking-tight text-text sm:text-5xl">
          {article.title}
        </h1>
        {article.summary && (
          <p className="mt-5 text-lg leading-relaxed text-text-body">{article.summary}</p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-6 text-sm text-text-muted">
          <span className="font-semibold text-text">{article.authorName}</span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> {publishedDate}
          </span>
        </div>

        {article.coverImageUrl && (
          <Image
            unoptimized
            src={article.coverImageUrl}
            alt=""
            width={1200}
            height={675}
            className="mt-8 aspect-[16/9] w-full rounded-xl border border-border object-cover"
            priority
          />
        )}

        <div className="mt-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {article.content}
          </ReactMarkdown>
        </div>

        <footer className="mt-14 border-t border-border pt-7">
          {article.tags && <p className="mb-6 text-sm text-text-muted">Topik: {article.tags}</p>}
          <Link href="/blog" className="inline-flex items-center gap-2 font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Lihat artikel lainnya
          </Link>
          <Link
            href="/register"
            className="mt-9 flex items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50/70 p-5 text-text transition-colors hover:border-blue-300 sm:p-6"
          >
            <span>
              <span className="block font-bold">Siap latihan buat UTBK?</span>
              <span className="mt-1 block text-sm text-text-body">Coba tryout Jitu dan lihat progres belajarmu.</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
          </Link>
        </footer>
      </article>
    </main>
  );
}
