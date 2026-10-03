import { env } from "@/lib/env";

/**
 * Liveness probe for the image's HEALTHCHECK, the deploy gate and uptime
 * monitors. Route handlers are not cached, so a 200 comes from the running
 * server, not from a file prerendered at build time. The SHA tells a deploy
 * which build answered.
 */
export function GET() {
  return Response.json(
    { status: "ok", sha: env.BUILD_SHA },
    { headers: { "Cache-Control": "no-store" } },
  );
}
