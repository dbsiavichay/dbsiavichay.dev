#!/usr/bin/env bash
#
# Rehearses the production topology on this machine (and in CI): the stack in
# deploy/compose.yml, hardened as on the VPS, behind a Caddy that loads
# caddy/portfolio.caddy the way the edge does.
#
#   deploy/smoke/smoke.sh up      start the stack from dbsiavichay-dev:smoke
#   deploy/smoke/smoke.sh check   probe it through the proxy
#   deploy/smoke/smoke.sh down    remove the containers and the network
#
# Build the image first:  docker build -t dbsiavichay-dev:smoke .
#
# Caddy issues certificates for dbsiavichay.dev from its own CA, and curl
# reaches it with --resolve and -k: https://dbsiavichay.dev:8543. Nothing binds
# 80/443 or 3000, so a dev server keeps running beside it.
#
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOMAIN="dbsiavichay.dev"
HTTPS_PORT=8543
HTTP_PORT=8180

compose() {
    docker compose -f "${DEPLOY_DIR}/compose.yml" -f "${DEPLOY_DIR}/smoke/compose.yml" "$@"
}

# fetch <host> <path> [curl options...]: a request through the proxy.
fetch() {
    local host="$1" path="$2"
    shift 2
    curl -ks --resolve "${host}:${HTTPS_PORT}:127.0.0.1" "$@" "https://${host}:${HTTPS_PORT}${path}"
}

wait_healthy() {
    local deadline=$((SECONDS + 90)) cid state
    while [ "$SECONDS" -lt "$deadline" ]; do
        cid="$(compose ps -q web 2>/dev/null || true)"
        state="$( [ -n "$cid" ] && docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$cid" 2>/dev/null || echo missing)"
        [ "$state" = "healthy" ] && return 0
        sleep 2
    done
    echo "ERROR: web is not healthy (${state})." >&2
    compose logs --tail 50 web >&2 || true
    return 1
}

up() {
    compose up -d
    wait_healthy
    # The first request for a domain makes Caddy issue its certificate.
    local deadline=$((SECONDS + 30))
    until fetch "$DOMAIN" /healthz -o /dev/null -f; do
        [ "$SECONDS" -lt "$deadline" ] || { echo "ERROR: the proxy does not answer." >&2; compose logs --tail 50 edge >&2; exit 1; }
        sleep 1
    done
    echo ">> Up: https://${DOMAIN}:${HTTPS_PORT} (resolve ${DOMAIN} to 127.0.0.1; self-signed)"
}

check() {
    local failed=0 headers code body asset logs
    # expect <description> <command...>: runs the command as the assertion.
    expect() {
        local desc="$1"
        shift
        if "$@"; then echo "   ok    ${desc}"; else echo "   FAIL  ${desc}"; failed=1; fi
    }
    matches() { printf '%s' "$1" | grep -qiE "$2"; }
    # `!` is shell syntax, not a command, so it cannot travel through "$@".
    not() { ! "$@"; }
    status() { printf '%s' "$1" | awk 'NR==1 {print $2}'; }

    echo ">> Probing https://${DOMAIN}:${HTTPS_PORT}"

    body="$(fetch "$DOMAIN" /healthz)"
    expect "health check through the proxy" matches "$body" '"status":"ok"'
    if [ -n "${EXPECT_SHA:-}" ]; then
        expect "the build answering is ${EXPECT_SHA:0:7}" matches "$body" "\"sha\":\"${EXPECT_SHA}\""
    fi

    headers="$(fetch "$DOMAIN" / -I)"
    expect "/ redirects to a locale ($(status "$headers"))" [ "$(status "$headers")" = "307" ]
    expect "the redirect stays on https" matches "$headers" "^location: (https://${DOMAIN}(:${HTTPS_PORT})?)?/en"

    headers="$(fetch "$DOMAIN" /en -I -H 'Accept-Encoding: zstd, gzip')"
    expect "/en answers 200 ($(status "$headers"))" [ "$(status "$headers")" = "200" ]
    expect "CSP header" matches "$headers" "^content-security-policy: default-src 'self'"
    expect "HSTS header" matches "$headers" '^strict-transport-security:'
    expect "nosniff header" matches "$headers" '^x-content-type-options: nosniff'
    expect "Permissions-Policy header" matches "$headers" '^permissions-policy:'
    expect "Caddy compresses with zstd" matches "$headers" '^content-encoding: zstd'
    expect "no Server header" not matches "$headers" '^server:'
    expect "no X-Powered-By header" not matches "$headers" '^x-powered-by:'

    asset="$(fetch "$DOMAIN" /en | grep -oE '/_next/static/[^"]+\.js' | head -n1 || true)"
    expect "the page names its scripts (${asset:-none})" [ -n "$asset" ]
    expect "hashed assets are immutable" matches "$(fetch "$DOMAIN" "$asset" -I)" '^cache-control:.*immutable'

    code="$(fetch "$DOMAIN" /es/projects/maderable -o /dev/null -w '%{http_code}')"
    expect "a case study answers 200 (${code})" [ "$code" = "200" ]
    code="$(fetch "$DOMAIN" /es/no-existe -o /dev/null -w '%{http_code}')"
    expect "an unknown page answers 404 (${code})" [ "$code" = "404" ]
    code="$(fetch "$DOMAIN" /en/projects/no-such-project -o /dev/null -w '%{http_code}')"
    expect "an unknown case study answers 404 (${code})" [ "$code" = "404" ]

    headers="$(fetch "www.${DOMAIN}" /en -I)"
    expect "www answers 301 ($(status "$headers"))" [ "$(status "$headers")" = "301" ]
    expect "www redirects to the apex, keeping the path" matches "$headers" "^location: https://${DOMAIN}/en"

    headers="$(curl -s -I --resolve "${DOMAIN}:${HTTP_PORT}:127.0.0.1" "http://${DOMAIN}:${HTTP_PORT}/en")"
    expect "plain http redirects to https ($(status "$headers"))" matches "$(status "$headers")" '^30[18]$'
    expect "…to the https URL" matches "$headers" "^location: https://${DOMAIN}"

    expect "the root filesystem is read-only" \
        not compose exec -T web sh -c 'touch /app/write-test 2>/dev/null' </dev/null
    expect "the cache is writable by the server" \
        compose exec -T web sh -c 'touch /app/.next/cache/write-test && rm /app/.next/cache/write-test' </dev/null
    expect "the server runs as node, not root" \
        matches "$(compose exec -T web id -un </dev/null)" '^node$'

    logs="$(compose logs --no-log-prefix web 2>&1)"
    expect "the server logged no errors" not matches "$logs" 'error|EROFS|EACCES|unhandled'

    if [ "$failed" -ne 0 ]; then
        echo ">> Some checks FAILED."
        compose logs --tail 30 web || true
        exit 1
    fi
    echo ">> All checks passed."
}

down() {
    compose down -v --remove-orphans
    echo ">> Smoke stack removed."
}

case "${1:-}" in
    up)    up ;;
    check) check ;;
    down)  down ;;
    *)     echo "usage: deploy/smoke/smoke.sh up|check|down" >&2; exit 2 ;;
esac
