# syntax=docker/dockerfile:1.7

# ─────────────────────────────────────────────────────────────────────────────
# Genmars commerce platform — storefront/BFF (Next.js)
#
# Written for the shared Hetzner host — see the backend repo's
# docs/HETZNER_DEPLOYMENT.md, which covers both repos' pieces together.
#
# `output: "standalone"` (next.config.ts) means the runtime stage copies a
# traced, self-contained server instead of the full node_modules tree.
#
# Unlike gen-portal's frontend, API_BASE_URL is read at REQUEST time
# (src/lib/api/config.ts — this is a BFF that calls Django server-side with a
# bearer token, not a build-time rewrite target), so it is supplied at
# container run time via compose.hetzner.yaml's env_file, not as a build ARG
# here. The one build-time exception is next.config.ts's own
# `images.remotePatterns`, which next.config.ts reads directly from
# process.env.API_BASE_URL — see that file's own comment. Passing the same
# value at both build and run time (the real, public API origin, in both
# cases — see docs/HETZNER_DEPLOYMENT.md) keeps the two in agreement.
# ─────────────────────────────────────────────────────────────────────────────

ARG REGISTRY=docker.io/library

# ---- dependencies -----------------------------------------------------------

FROM ${REGISTRY}/node:22-alpine AS deps

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    CI=true

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# ---- build ------------------------------------------------------------------

FROM ${REGISTRY}/node:22-alpine AS build

# See the file banner above — must match the real public API origin that
# will also be set at runtime, not an internal/dev address.
ARG API_BASE_URL
ENV API_BASE_URL=${API_BASE_URL}

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    CI=true \
    NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# No check:theme here — that guard is a gen-portal/internals-tm/gen-website
# convention (~/Genmars/CLAUDE.md); this package.json has no such script, and
# inventing one wasn't asked for.
RUN npm run build

# ---- runtime ------------------------------------------------------------------

FROM ${REGISTRY}/node:22-alpine AS runtime

LABEL org.opencontainers.image.title="genmars-commerce-web" \
      org.opencontainers.image.description="Commerce platform storefront for Genmars Tech Limited" \
      org.opencontainers.image.vendor="Genmars Tech Limited"

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3040 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 10011 -S web && adduser -u 10011 -S web -G web

# The standalone bundle carries its own minimal node_modules; static/ and
# public/ are not included in it and have to be copied alongside, or every
# asset the page references 404s.
COPY --from=build --chown=10011:10011 /app/.next/standalone ./
COPY --from=build --chown=10011:10011 /app/.next/static ./.next/static
COPY --from=build --chown=10011:10011 /app/public ./public

USER 10011:10011

EXPOSE 3040

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:3040/ || exit 1

CMD ["node", "server.js"]
