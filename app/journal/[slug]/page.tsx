import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatPostDate,
  getAllPosts,
  getPostBySlug,
} from "@/lib/posts";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="article-shell">
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Maks, home">
          Maks<span className="wordmark-dot">.</span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/#journal">Journal</Link>
          <Link href="/#about">About</Link>
        </nav>
      </header>

      <article className="article">
        <Link className="back-link" href="/#journal">
          <span aria-hidden="true">←</span> All notes
        </Link>
        <header className="article-header">
          <p className="eyebrow">{post.tag}</p>
          <h1>{post.title}</h1>
          <div className="post-meta">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            <span>{post.readTime}</span>
          </div>
          <p className="article-deck">{post.excerpt}</p>
        </header>
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>

      <footer>
        <p>© 2026 Maks</p>
        <Link href="/#journal">Back to the journal</Link>
      </footer>
    </main>
  );
}
