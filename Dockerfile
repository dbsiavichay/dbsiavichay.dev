# syntax=docker/dockerfile:1
#
# Production image: the standalone Next.js server on Node 24 (Alpine).
#
#   docker build \
#     --build-arg SITE_URL=https://dbsiavichay.dev \
#     --build-arg BUILD_SHA="$(git rev-parse HEAD)" \
#     --build-arg BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
#     -t dbsiavichay-dev .
#
# Every page is prerendered, so the build args are read by `next build` and
# baked into the HTML (src/lib/env.ts validates them). The image also keeps them
# as its environment, so what renders on request (a 404, /healthz) agrees with
# the prerendered pages. Nothing else is configured at runtime, and the image
# holds no secrets.

ARG NODE_IMAGE=node:24-alpine

# Dependencies alone, so a change to the code reuses this layer.
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

FROM ${NODE_IMAGE} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG SITE_URL
ARG BUILD_SHA
ARG BUILD_TIME
RUN npm run build

FROM ${NODE_IMAGE} AS runner
WORKDIR /app
# Docker sets HOSTNAME to the container ID, and server.js binds to HOSTNAME.
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# The server, its traced node_modules and the static assets it serves itself
# (`next build` leaves them out of the standalone folder). Owned by root, so
# the process cannot rewrite its own code. There is no public/ folder yet.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# The only place Next writes at runtime. Production mounts a tmpfs here and
# keeps the rest of the filesystem read-only.
RUN mkdir -p .next/cache && chown node:node .next/cache

ARG SITE_URL
ARG BUILD_SHA
ARG BUILD_TIME
ENV SITE_URL=${SITE_URL} \
    BUILD_SHA=${BUILD_SHA} \
    BUILD_TIME=${BUILD_TIME}
LABEL org.opencontainers.image.title="dbsiavichay.dev" \
      org.opencontainers.image.description="Portfolio of Denis Siavichay, Software Engineer." \
      org.opencontainers.image.source="https://github.com/dbsiavichay/dbsiavichay.dev" \
      org.opencontainers.image.revision="${BUILD_SHA}"

USER node
EXPOSE 3000

# busybox wget ships with Alpine; curl does not. --start-interval polls fast
# while the server boots, so a deploy sees `healthy` within seconds.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --start-interval=2s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:3000/healthz || exit 1

CMD ["node", "server.js"]
