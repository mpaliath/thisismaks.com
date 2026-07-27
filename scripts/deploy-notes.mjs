#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { createInterface } from "node:readline/promises";
import matter from "gray-matter";

const notesDirectory = "content/posts/";
const workflowTimeoutMs = 10 * 60 * 1000;
const workflowPollMs = 15 * 1000;

function git(args, options = {}) {
  const result = execFileSync("git", args, {
    encoding: "utf8",
    ...options,
  });

  return typeof result === "string" ? result.trim() : "";
}

function getChangedFiles() {
  const output = execFileSync(
    "git",
    ["status", "--porcelain=v1", "-z", "--untracked-files=all"],
    { encoding: "utf8" },
  );

  return output
    .split("\0")
    .filter(Boolean)
    .map((entry) => ({
      status: entry.slice(0, 2),
      path: entry.slice(3),
    }));
}

function parseGitHubRepository(remoteUrl) {
  const match = remoteUrl.match(
    /github\.com(?::|\/)([^/]+)\/([^/]+?)(?:\.git)?$/,
  );

  if (!match) {
    return null;
  }

  return { owner: match[1], repository: match[2] };
}

async function getNote(file) {
  const source = await readFile(file.path, "utf8");
  const { data } = matter(source);

  if (typeof data.title !== "string" || data.title.trim() === "") {
    throw new Error(`"${file.path}" is missing a title.`);
  }

  return {
    ...file,
    title: data.title.trim(),
    draft: data.draft === true,
  };
}

async function waitForDeployment(commitSha, repository) {
  if (!repository) {
    console.log(
      "\nPush completed. Could not infer the GitHub repository URL, so deployment monitoring was skipped.",
    );
    return;
  }

  const endpoint = new URL(
    `https://api.github.com/repos/${repository.owner}/${repository.repository}/actions/runs`,
  );
  endpoint.searchParams.set("head_sha", commitSha);
  endpoint.searchParams.set("event", "push");
  endpoint.searchParams.set("per_page", "5");

  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "thisismaks-note-deployer",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const startedAt = Date.now();
  let runUrl;

  console.log("\nWaiting for the Azure GitHub Actions deployment...");

  while (Date.now() - startedAt < workflowTimeoutMs) {
    const response = await fetch(endpoint, { headers });

    if (!response.ok) {
      throw new Error(
        `GitHub Actions status check failed with HTTP ${response.status}. The push succeeded; check GitHub Actions manually.`,
      );
    }

    const payload = await response.json();
    const run = payload.workflow_runs?.find(
      (candidate) => candidate.head_sha === commitSha,
    );

    if (run) {
      runUrl = run.html_url;

      if (run.status === "completed") {
        if (run.conclusion !== "success") {
          throw new Error(
            `Azure deployment finished with "${run.conclusion}". Review ${runUrl}`,
          );
        }

        console.log(`Azure deployment succeeded: ${runUrl}`);
        return;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, workflowPollMs));
  }

  throw new Error(
    `Timed out waiting for Azure deployment.${
      runUrl ? ` Follow its progress at ${runUrl}` : ""
    }`,
  );
}

const prompt = createInterface({
  input: process.stdin,
  output: process.stdout,
});

try {
  const branch = git(["branch", "--show-current"]);
  if (branch !== "main") {
    throw new Error(
      `Note deployment must run from "main"; the current branch is "${branch}".`,
    );
  }

  console.log("Checking the deployed branch...");
  git(["fetch", "origin", "main"], { stdio: "inherit" });

  const localHead = git(["rev-parse", "HEAD"]);
  const remoteHead = git(["rev-parse", "origin/main"]);
  if (localHead !== remoteHead) {
    throw new Error(
      "Local main must exactly match origin/main. Pull or finish the full code deployment before publishing notes.",
    );
  }

  const changes = getChangedFiles();
  if (changes.length === 0) {
    throw new Error("There are no note changes to deploy.");
  }

  const invalidChanges = changes.filter(
    (file) =>
      !file.path.startsWith(notesDirectory) ||
      !file.path.endsWith(".md") ||
      file.status.includes("D") ||
      file.status.includes("R"),
  );

  if (invalidChanges.length > 0) {
    const list = invalidChanges
      .map((file) => `  ${file.status} ${file.path}`)
      .join("\n");
    throw new Error(
      `Only new or edited Markdown notes may be deployed with this command:\n${list}\nUse the full code deployment workflow instead.`,
    );
  }

  const notes = await Promise.all(changes.map(getNote));
  const publishable = notes.filter((note) => !note.draft);
  const drafts = notes.filter((note) => note.draft);

  if (publishable.length === 0) {
    console.log(
      "\nNo deployment needed: all changed notes are drafts. Nothing was committed or pushed.",
    );
    process.exitCode = 0;
  } else {
    console.log("\nNotes that will be published:");
    for (const note of publishable) {
      console.log(`  • ${note.title}`);
    }

    if (drafts.length > 0) {
      console.log("\nDrafts that will remain unpublished:");
      for (const note of drafts) {
        console.log(`  • ${note.title}`);
      }
    }

    console.log("\nRunning the full static build and test suite...");
    execFileSync("npm", ["test"], { stdio: "inherit" });

    const answer = (
      await prompt.question("\nCommit and deploy these note changes? [y/N] ")
    )
      .trim()
      .toLowerCase();

    if (answer !== "y" && answer !== "yes") {
      console.log("Deployment cancelled. Nothing was committed or pushed.");
    } else {
      const paths = notes.map((note) => note.path);
      git(["add", "--", ...paths]);

      const message =
        publishable.length === 1
          ? `note: publish ${publishable[0].title}`
          : `notes: publish ${publishable.length} journal updates`;

      execFileSync("git", ["commit", "-m", message], { stdio: "inherit" });
      execFileSync("git", ["push", "origin", "main"], { stdio: "inherit" });

      const commitSha = git(["rev-parse", "HEAD"]);
      const repository = parseGitHubRepository(
        git(["remote", "get-url", "origin"]),
      );

      await waitForDeployment(commitSha, repository);
    }
  }
} catch (error) {
  console.error(
    `\nNote deployment stopped: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exitCode = 1;
} finally {
  prompt.close();
}
