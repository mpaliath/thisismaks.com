import Link from "next/link";
import { formatPostDate, getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();
  const currentYear = posts[0]
    ? new Date(posts[0].date).getUTCFullYear()
    : new Date().getUTCFullYear();

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Maks, home">
          Maks<span className="wordmark-dot">.</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#journal">Journal</a>
          <a href="#about">About</a>
        </nav>
      </header>

      <section className="intro" id="top" aria-labelledby="intro-title">
        <p className="eyebrow">A personal journal by Maks</p>
        <h1 id="intro-title">
          Notes on design, technology, and the things I’m learning along the
          way.
        </h1>
        <p className="intro-note">Collected slowly. Shared occasionally.</p>
      </section>

      <section className="journal" id="journal" aria-labelledby="journal-title">
        <div className="section-heading">
          <h2 id="journal-title">Latest notes</h2>
          <span>Vol. 01 — {currentYear}</span>
        </div>

        <div className="post-list">
          {posts.map((post, index) => (
            <article className="post" key={post.slug}>
              <div className="post-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="post-body">
                <div className="post-meta">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                  <span>{post.readTime}</span>
                </div>
                <h3>
                  <Link href={`/journal/${post.slug}/`}>{post.title}</Link>
                </h3>
                <p>{post.excerpt}</p>
              </div>
              <div className="post-tag">{post.tag}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="about" id="about" aria-labelledby="about-title">
        <p className="eyebrow">A note from the margin</p>
        <div className="about-grid">
          <h2 id="about-title">Hello, I’m Maks.</h2>
          <div>
            <p>
              I’m interested in thoughtful technology, clear ideas, and the
              craft of making useful things. This is where I keep what I want
              to remember.
            </p>
            <a className="text-link" href="mailto:hello@thisismaks.com">
              Say hello <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <footer>
        <p>© 2026 Maks</p>
        <p>Made with care in California</p>
      </footer>
    </main>
  );
}
