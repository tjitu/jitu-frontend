export interface PublishedArticleSummary {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  coverImageUrl: string | null;
  category: string;
  tags: string;
  authorName: string;
  readTimeMinutes: number;
  viewsCount: number;
  publishedAt: string | null;
  createdAt: string;
}

export interface PublishedArticle extends PublishedArticleSummary {
  content: string;
}

const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000").replace(/\/+$/, "");
const articlesApiUrl = (process.env.ARTICLES_API_URL || backendUrl).replace(/\/+$/, "");

export async function getPublishedArticles(): Promise<PublishedArticleSummary[] | null> {
  try {
    const response = await fetch(`${articlesApiUrl}/articles`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as PublishedArticleSummary[];
  } catch {
    return null;
  }
}

export async function getPublishedArticle(slug: string): Promise<{
  article: PublishedArticle | null;
  unavailable: boolean;
}> {
  try {
    const response = await fetch(`${articlesApiUrl}/articles/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (response.status === 404) return { article: null, unavailable: false };
    if (!response.ok) return { article: null, unavailable: true };
    return {
      article: (await response.json()) as PublishedArticle,
      unavailable: false,
    };
  } catch {
    return { article: null, unavailable: true };
  }
}

export function formatArticleDate(value: string | null, fallback: string) {
  const date = value ? new Date(value) : new Date(fallback);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
