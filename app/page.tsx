const posts = [
  {
    number: "01",
    date: "July 18, 2026",
    readTime: "5 min read",
    title: "Building a calmer internet",
    excerpt:
      "A few notes on making digital spaces that leave room for attention, curiosity, and a little more humanity.",
    tag: "Design",
  },
  {
    number: "02",
    date: "June 29, 2026",
    readTime: "7 min read",
    title: "What I learned shipping small",
    excerpt:
      "Why the shortest path from an idea to the world is often the one that teaches you the most.",
    tag: "Practice",
  },
  {
    number: "03",
    date: "June 8, 2026",
    readTime: "4 min read",
    title: "A field guide to creative momentum",
    excerpt:
      "Small rituals, useful constraints, and other ways to keep moving when the blank page feels especially blank.",
    tag: "Notes",
  },
];

export default function Home() {
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
          <span>Vol. 01 — 2026</span>
        </div>

        <div className="post-list">
          {posts.map((post) => (
            <article
              className="post"
              id={`note-${post.number}`}
              key={post.number}
            >
              <div className="post-number" aria-hidden="true">
                {post.number}
              </div>
              <div className="post-body">
                <div className="post-meta">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
                <h3>
                  <a href={`#note-${post.number}`}>{post.title}</a>
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
