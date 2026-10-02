import nextPackage from "next/package.json";

import { profile } from "@/data/profile";

import { env, type Env } from "./env";

export type BuildInfo = {
  /** Full SHA, or "dev" outside CI. */
  sha: string;
  shortSha: string;
  /** The commit on GitHub; absent for local builds. */
  commitUrl?: string;
  /** ISO 8601, UTC. */
  builtAt: string;
  nextVersion: string;
  nodeVersion: string;
};

/**
 * Facts about the build that produced the page. Pages are prerendered, so
 * these are read once by `next build`; without a CI timestamp the build time
 * is the moment the page was rendered.
 */
export function getBuildInfo(
  source: Pick<Env, "BUILD_SHA" | "BUILD_TIME"> = env,
  now: Date = new Date(),
): BuildInfo {
  const sha = source.BUILD_SHA;
  const isLocal = sha === "dev";
  return {
    sha,
    shortSha: isLocal ? sha : sha.slice(0, 7),
    commitUrl: isLocal ? undefined : `${profile.repository}/commit/${sha}`,
    builtAt: source.BUILD_TIME ?? now.toISOString(),
    nextVersion: nextPackage.version,
    nodeVersion: process.versions.node,
  };
}

/** "2026-10-01 21:55 UTC": language-neutral, like the rest of the panel. */
export function formatBuildTime(iso: string): string {
  return `${new Date(iso).toISOString().slice(0, 16).replace("T", " ")} UTC`;
}
