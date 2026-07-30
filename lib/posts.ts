import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "content", "posts");

type PostFrontmatter = {
  title: string;
  date: string;
  excerpt: string;
  tag: string;
  readTime?: string;
  draft?: boolean;
  order?: number;
};

export type PostSummary = PostFrontmatter & {
  slug: string;
  readTime: string;
};

export type Post = PostSummary & {
  contentHtml: string;
};

function assertFrontmatter(
  data: Record<string, unknown>,
  filename: string,
): asserts data is PostFrontmatter {
  for (const field of ["title", "date", "excerpt", "tag"] as const) {
    if (typeof data[field] !== "string" || data[field].trim() === "") {
      throw new Error(
        `Post "${filename}" is missing the required "${field}" frontmatter field.`,
      );
    }
  }

  if (Number.isNaN(Date.parse(data.date as string))) {
    throw new Error(`Post "${filename}" has an invalid "date" value.`);
  }

  if (
    data.order !== undefined &&
    (typeof data.order !== "number" ||
      !Number.isInteger(data.order) ||
      data.order < 1)
  ) {
    throw new Error(
      `Post "${filename}" has an invalid "order" value; expected a positive integer.`,
    );
  }
}

function estimateReadTime(markdown: string) {
  const words = markdown
    .replace(/[#_*`>\-[\]()]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

function readPostFile(filename: string) {
  const fullPath = path.join(postsDirectory, filename);
  const source = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(source);

  assertFrontmatter(data, filename);

  return {
    data,
    content,
    slug: filename.replace(/\.md$/, ""),
    readTime: data.readTime ?? estimateReadTime(content),
  };
}

export function getAllPosts(): PostSummary[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(postsDirectory)
    .filter((filename) => filename.endsWith(".md"))
    .map(readPostFile)
    .filter(({ data }) => !data.draft)
    .map(({ data, slug, readTime }) => ({
      ...data,
      slug,
      readTime,
    }))
    .sort(
      (first, second) =>
        new Date(second.date).getTime() - new Date(first.date).getTime(),
    );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const safeSlug = path.basename(slug);
  const filename = `${safeSlug}.md`;
  const fullPath = path.join(postsDirectory, filename);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const { data, content, readTime } = readPostFile(filename);
  const processed = await remark().use(html).process(content);

  return {
    ...data,
    slug: safeSlug,
    readTime,
    contentHtml: processed.toString(),
  };
}

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}
