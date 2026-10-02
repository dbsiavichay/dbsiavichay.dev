import { z } from "zod";

/**
 * Build-time configuration. Pages are prerendered, so these values are read
 * once during `next build` (the Docker build passes them as build args) and
 * baked into the HTML. A malformed value fails the build instead of shipping.
 */
const envSchema = z.object({
  /** Canonical origin, without a trailing slash. */
  SITE_URL: z
    .url({ protocol: /^https?$/ })
    .transform((url) => url.replace(/\/+$/, ""))
    .default("https://dbsiavichay.dev"),
  /** Commit the build was made from; `dev` outside CI. */
  BUILD_SHA: z
    .string()
    .regex(/^([0-9a-f]{7,40}|dev)$/, "BUILD_SHA must be a git SHA or 'dev'")
    .default("dev"),
  /** ISO 8601 timestamp of the build, set by CI. */
  BUILD_TIME: z.iso.datetime().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  // Empty strings (an unset build arg) count as "not provided".
  const present = (value: string | undefined) =>
    value === "" ? undefined : value;
  return envSchema.parse({
    SITE_URL: present(source.SITE_URL),
    BUILD_SHA: present(source.BUILD_SHA),
    BUILD_TIME: present(source.BUILD_TIME),
  });
}

export const env = parseEnv(process.env);
