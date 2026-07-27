"use client";

import { useEffect, useRef, useState } from "react";

type IntroPost = {
  slug: string;
  title: string;
  date: string;
  contentHtml: string;
};

type IntroductionProps = {
  posts: IntroPost[];
  sequenceId: string;
};

const progressCookie = "maks_intro_progress";
const cookieLifetime = 60 * 60 * 24 * 365;

function readProgress(sequenceId: string, postCount: number) {
  const stored = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${progressCookie}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  if (!stored) {
    return 0;
  }

  try {
    const [storedSequence, storedProgress] = decodeURIComponent(stored).split(":");
    const progress = Number.parseInt(storedProgress, 10);

    if (
      storedSequence === sequenceId &&
      Number.isInteger(progress) &&
      progress >= 0 &&
      progress <= postCount
    ) {
      return progress;
    }
  } catch {
    // An invalid cookie is equivalent to starting the introductions again.
  }

  return 0;
}

function saveProgress(sequenceId: string, progress: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${progressCookie}=${encodeURIComponent(
    `${sequenceId}:${progress}`,
  )}; Path=/; Max-Age=${cookieLifetime}; SameSite=Lax${secure}`;
}

export default function Introduction({
  posts,
  sequenceId,
}: IntroductionProps) {
  const [completed, setCompleted] = useState(0);
  const [ready, setReady] = useState(false);
  const currentNote = useRef<HTMLElement>(null);

  useEffect(() => {
    setCompleted(readProgress(sequenceId, posts.length));
    setReady(true);
  }, [posts.length, sequenceId]);

  function revealMore() {
    const nextProgress = Math.min(completed + 1, posts.length);
    saveProgress(sequenceId, nextProgress);
    setCompleted(nextProgress);

    window.requestAnimationFrame(() => {
      currentNote.current?.focus({ preventScroll: true });
      currentNote.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    });
  }

  if (posts.length === 0) {
    return (
      <section className="introduction-empty">
        <p className="eyebrow">Introduction</p>
        <h1>The first note is still being written.</h1>
      </section>
    );
  }

  return (
    <section
      className={`introduction-sequence${ready ? " is-ready" : ""}`}
      aria-label="Introduction notes"
    >
      <div className="introduction-progress" aria-label="Reading progress">
        <span>Introduction</span>
        <span>
          {Math.min(completed + 1, posts.length)} / {posts.length}
        </span>
      </div>

      {posts.slice(0, completed).map((post, index) => (
        <div className="completed-intro" key={post.slug}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <p>{post.title}</p>
          <span>Read</span>
        </div>
      ))}

      {completed < posts.length ? (
        <article
          className="current-intro"
          key={posts[completed].slug}
          ref={currentNote}
          tabIndex={-1}
        >
          <header className="current-intro-header">
            <p className="eyebrow">
              Note {String(completed + 1).padStart(2, "0")}
            </p>
            <h1>{posts[completed].title}</h1>
          </header>
          <div
            className="prose introduction-prose"
            dangerouslySetInnerHTML={{ __html: posts[completed].contentHtml }}
          />
          <div className="reveal-wrap">
            <button className="reveal-button" type="button" onClick={revealMore}>
              <span>
                {completed === posts.length - 1
                  ? "Finish introduction"
                  : "Reveal more"}
              </span>
              <span aria-hidden="true">↓</span>
            </button>
          </div>
        </article>
      ) : (
        <div
          className="introduction-complete"
          ref={currentNote as React.RefObject<HTMLDivElement>}
          tabIndex={-1}
        >
          <p className="eyebrow">Introduction complete</p>
          <h1>You’ve reached the circle.</h1>
          <p>
            You’ve read the notes I hoped we could begin with. The rest of the
            conversation starts here.
          </p>
        </div>
      )}
    </section>
  );
}
