import Introduction from "./introduction";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

export default async function Home() {
  const introSummaries = getAllPosts()
    .filter((post) => post.tag.toLowerCase() === "intro")
    .sort(
      (first, second) =>
        new Date(first.date).getTime() - new Date(second.date).getTime(),
    );
  const introPosts = (
    await Promise.all(
      introSummaries.map((post) => getPostBySlug(post.slug)),
    )
  ).filter((post) => post !== null);
  const sequenceId = introPosts
    .map((post) => `${post.slug}@${post.date}`)
    .join("|");

  return (
    <main className="introduction-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Maks, home">
          Maks<span className="wordmark-dot">.</span>
        </a>
        <p className="quiet-label">An open reading circle</p>
      </header>

      <Introduction posts={introPosts} sequenceId={sequenceId} />

      <footer>
        <p>© 2026 Maks</p>
        <p>Progress stays in this browser</p>
      </footer>
    </main>
  );
}
