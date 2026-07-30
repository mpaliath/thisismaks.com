#!/usr/bin/env node

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const postsDirectory = path.join(repositoryRoot, "content", "posts");
const today = new Date().toISOString().slice(0, 10);

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function quoteYaml(value) {
  return JSON.stringify(value);
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

const prompt = createInterface({
  input: process.stdin,
  output: process.stdout,
});

try {
  console.log("Create a new journal note\n");

  const title = (await prompt.question("Title: ")).trim();
  if (!title) {
    throw new Error("A title is required.");
  }

  const suggestedSlug = slugify(title);
  if (!suggestedSlug) {
    throw new Error("The title must contain at least one letter or number.");
  }

  const slugInput = (
    await prompt.question(`Slug [${suggestedSlug}]: `)
  ).trim();
  const slug = slugInput ? slugify(slugInput) : suggestedSlug;

  const excerpt = (await prompt.question("Short excerpt: ")).trim();
  if (!excerpt) {
    throw new Error("A short excerpt is required.");
  }

  const tagInput = (await prompt.question("Tag [Notes]: ")).trim();
  const tag = tagInput || "Notes";

  const orderInput = (
    await prompt.question("Sequence order (optional): ")
  ).trim();
  if (
    orderInput &&
    (!Number.isInteger(Number(orderInput)) || Number(orderInput) < 1)
  ) {
    throw new Error("Sequence order must be a positive integer.");
  }

  const dateInput = (await prompt.question(`Date [${today}]: `)).trim();
  const date = dateInput || today;
  if (Number.isNaN(Date.parse(date))) {
    throw new Error(`"${date}" is not a valid date.`);
  }

  const filePath = path.join(postsDirectory, `${slug}.md`);
  if (await fileExists(filePath)) {
    throw new Error(
      `A post already exists at content/posts/${slug}.md. Nothing was changed.`,
    );
  }

  const markdown = `---
title: ${quoteYaml(title)}
date: ${quoteYaml(date)}
excerpt: ${quoteYaml(excerpt)}
tag: ${quoteYaml(tag)}
${orderInput ? `order: ${orderInput}\n` : ""}draft: true
---

Write your note here.
`;

  await mkdir(postsDirectory, { recursive: true });
  await writeFile(filePath, markdown, { encoding: "utf8", flag: "wx" });

  console.log(`\nCreated content/posts/${slug}.md`);
  console.log(
    "The note starts as a draft. Remove `draft: true` when it is ready to publish.",
  );
} catch (error) {
  console.error(
    `\nCould not create note: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exitCode = 1;
} finally {
  prompt.close();
}
