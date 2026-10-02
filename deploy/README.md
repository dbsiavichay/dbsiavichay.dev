# Deployment

How dbsiavichay.dev runs in production. The site is a Next.js `standalone` server in a
container, on the VPS that already runs Grazia, behind that server's shared **edge**
Caddy. Every page is prerendered; the container holds no state and no secrets.

```text
                     :80 :443
  internet ──▶ edge/caddy (TLS) ──┬── dbsiavichay.dev      ──▶ portfolio-web:3000
                /opt/edge         │   www.dbsiavichay.dev  ──▶ 301 to the apex
                                  └── Grazia's domain      ──▶ grazia-web, grazia-api
                       docker network "edge"
```

- The edge belongs to `grazia-infra`. It owns ports 80/443, terminates TLS for every site
  and imports one file per site from `/opt/edge/caddy/sites/`. This repo adds
  `portfolio.caddy` there and never touches any other file.
- The portfolio joins the external `edge` network as `portfolio-web` and publishes no
  port.
- The VPS never builds anything: GitHub Actions builds the image, rehearses it, pushes it
  to GHCR, and tells the VPS which tag to pull.

## Files

| In this repo                   | On the VPS                              | What it does                                                        |
| ------------------------------ | --------------------------------------- | ------------------------------------------------------------------- |
| `Dockerfile`                   | —                                       | Multi-stage build, Node 24 Alpine, non-root, `HEALTHCHECK /healthz` |
| `deploy/compose.yml`           | `/opt/portfolio/compose.yml`            | The `web` service: read-only, no capabilities, 256 MB               |
| `deploy/caddy/portfolio.caddy` | `/opt/edge/caddy/sites/portfolio.caddy` | Routing, CSP, compression, `www` redirect                           |
| `deploy/scripts/deploy.sh`     | `/opt/portfolio/scripts/deploy.sh`      | Health-gated deploy of one tag, with automatic rollback             |
| `deploy/scripts/apply-edge.sh` | `/opt/portfolio/scripts/apply-edge.sh`  | Installs `portfolio.caddy` in the edge and applies it               |
| `deploy/smoke/`                | —                                       | Local and CI rehearsal of the whole topology                        |
| —                              | `/opt/portfolio/.env`                   | `WEB_TAG=sha-…`, written by `deploy.sh`                             |

## CI/CD

`.github/workflows/ci.yml` runs on every pull request and on every push to `master`.

```text
quality        format · lint · typecheck · unit tests · pending facts (annotations)
e2e            next build · Playwright + axe on the standalone server
lighthouse     next build · Lighthouse CI budgets (mobile)
docker         build the image · smoke/smoke.sh: compose + Caddy + probes
deploy config  shellcheck · compose config · caddy validate · caddy fmt

push to master, all green:
publish        push the image the docker job rehearsed: sha-<7> and latest
deploy         ssh: ship deploy/ → deploy.sh sha-<7> → apply-edge.sh → check /healthz live
```

- `publish` pushes the exact image `docker` tested (saved as an artifact), not a rebuild.
- `deploy` starts the container first and installs the route afterwards: the route only
  goes in once the server behind it is healthy, and a failed deploy never touches the
  edge.
- The final step goes through DNS, TLS and the edge like a visitor, and passes only when
  `/healthz` reports the commit that was just pushed.
- Only one deploy runs at a time (`concurrency: deploy-production`), and a push to
  `master` never cancels a running one.
- A deploy recreates the one container, so the site answers 502 while the new server
  starts: about half a second on the smoke stack. A static portfolio does not justify a
  blue-green setup.

## Configuration and secrets

There are no runtime secrets. The build args (`SITE_URL`, `BUILD_SHA`, `BUILD_TIME`) are
baked into the image and validated by `src/lib/env.ts`.

| Where                             | Name                                                  | What it is                                       |
| --------------------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| GitHub → environment `production` | `VPS_HOST`, `VPS_SSH_PORT`, `VPS_USER`, `VPS_SSH_KEY` | How CI reaches the VPS. `VPS_USER` is `deploy`.  |
| GitHub → `GITHUB_TOKEN`           | `packages: write` (publish job only)                  | Pushes to `ghcr.io/dbsiavichay/dbsiavichay.dev`. |
| VPS, `deploy`'s docker login      | GHCR read token (already there for Grazia)            | Only needed while the package is private.        |

`VPS_SSH_KEY` reaches the `deploy` user, which is in the `docker` group: treat it as a
root credential on the VPS.

## First deploy

The VPS, the `deploy` user and the edge already exist (`grazia-infra`,
`docs/DEPLOYMENT.md`). The portfolio needs five things once.

### 1. DNS

At the registrar (Spaceship), point both names at the VPS before the first deploy. Caddy
requests the certificates the moment it loads `portfolio.caddy`, and failed ACME
challenges run into Let's Encrypt's rate limits.

```text
dbsiavichay.dev       A       <VPS IPv4>
www.dbsiavichay.dev   CNAME   dbsiavichay.dev.
```

The CNAME follows the apex, so a new VPS address is one record to change. Add an `AAAA`
record only if the VPS really serves IPv6. Check from your machine:

```bash
dig +short dbsiavichay.dev          # the VPS IPv4
dig +short www.dbsiavichay.dev      # dbsiavichay.dev. and then the same IPv4
```

`.dev` is on the browsers' HSTS preload list, so the site is HTTPS-only from the first
visit; Caddy handles that.

### 2. The application directory

`/opt` belongs to root, so the `deploy` user cannot create it:

```bash
ssh ubuntu@<vps> 'sudo install -d -o deploy -g deploy /opt/portfolio'
```

### 3. A deploy key for CI

A key of its own, so it can be revoked without touching Grazia's:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/portfolio_ci -N '' -C 'github-actions@dbsiavichay.dev'
ssh deploy@<vps> 'cat >> ~/.ssh/authorized_keys' < ~/.ssh/portfolio_ci.pub
```

### 4. GitHub secrets

```bash
R=dbsiavichay/dbsiavichay.dev
gh secret set VPS_HOST     -R $R --env production
gh secret set VPS_SSH_PORT -R $R --env production --body 22
gh secret set VPS_USER     -R $R --env production --body deploy
gh secret set VPS_SSH_KEY  -R $R --env production < ~/.ssh/portfolio_ci
```

### 5. Merge, and make the package public

Merge to `master` and watch Actions. The first `publish` creates the package
`ghcr.io/dbsiavichay/dbsiavichay.dev`, and GHCR creates packages as private. Either make
it public (package settings → _Change visibility_; the repo is public anyway), or confirm
that the VPS's `docker login` belongs to an account that can read it. If the first deploy
stopped at the pull, fix that and use _Re-run failed jobs_.

## Day to day

```bash
# on the VPS, as deploy
cd /opt/portfolio
docker compose ps                              # state and health
docker compose logs -f web                     # the server's logs
./scripts/deploy.sh sha-abc1234                # go back to an older build
cat .env                                       # the tag that should be running
cd /opt/edge && docker compose logs -f caddy   # certificates and routing
```

`deploy.sh` keeps the running image and the previous one on disk, so rolling back to the
previous tag needs no network. Any `sha-<7>` that GHCR still has can be deployed the same
way.

## Verifying a deploy

```bash
curl -s https://dbsiavichay.dev/healthz              # {"status":"ok","sha":"<commit>"}
curl -sI https://dbsiavichay.dev/ | grep -i location # 307 to /en or /es
curl -sI https://www.dbsiavichay.dev/en | head -1    # 301 to https://dbsiavichay.dev/en
curl -sI https://dbsiavichay.dev/en | grep -i content-security-policy
```

## Rehearsing locally

Before changing the Dockerfile, the compose file, `portfolio.caddy` or a script, run the
topology on your machine. The smoke stack runs the real `compose.yml` with the same
hardening, behind a Caddy that loads `portfolio.caddy` through a copy of the edge's
`security` snippet. Caddy issues certificates from its own CA, and nothing binds 80, 443
or 3000.

```bash
docker build -t dbsiavichay-dev:smoke .
deploy/smoke/smoke.sh up       # start and wait for healthy
deploy/smoke/smoke.sh check    # probes: health, redirects, headers, 404s, read-only FS, logs
deploy/smoke/smoke.sh down
```

While it is up, the site answers at `https://dbsiavichay.dev:8543` for anything that
resolves that name to `127.0.0.1`, e.g.
`curl -k --resolve dbsiavichay.dev:8543:127.0.0.1 https://dbsiavichay.dev:8543/en`.

## Sharing the edge with grazia-infra

- `grazia-infra`'s deploy extracts its `edge/` folder over `/opt/edge` without deleting
  anything, so `portfolio.caddy` survives Grazia's deploys.
- Every Grazia deploy runs `/opt/edge/apply.sh`, which fails if Caddy rejects any site
  file. `apply-edge.sh` therefore only leaves behind a file Caddy accepted: when the new
  one is rejected, it puts the previous one back and applies again. CI validates the file
  first, so that path is a last resort.
- `deploy/smoke/Caddyfile` copies the edge's `security` snippet. If `grazia-infra`
  changes it, copy the change.
- The domain is written in `portfolio.caddy` instead of coming from `/opt/edge/.env`: the
  edge's compose file passes only the variables of the sites `grazia-infra` ships.
- `grazia-infra`'s own docs suggest moving `edge/` to a repo of its own once a second
  project deploys from another repo. That is still the cleaner end state; the only change
  here would be where `portfolio.caddy` ships from.
