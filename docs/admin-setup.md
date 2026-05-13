# Admin setup

The `/admin` panel requires GitHub OAuth (identity) and a fine-grained PAT (commits).

## One-time setup

### 1. Create a GitHub OAuth app

Go to https://github.com/settings/developers → "New OAuth App"

- Application name: `tkoren.com admin`
- Homepage URL: `https://tkoren.com`
- Authorization callback URL: `https://tkoren.com/admin/callback`
- Generate a client secret. Copy both Client ID and Client Secret.

### 2. Create a fine-grained PAT

Go to https://github.com/settings/tokens?type=beta → "Generate new token"

- Repository access: only `korentomas/tkoren.com`
- Repository permissions: `Contents: Read and write`
- Copy the token (you only see it once).

### 3. Set Vercel env vars

In the project's Vercel dashboard, add to Production + Preview + Development:

| Name | Value |
|---|---|
| `GITHUB_CLIENT_ID` | OAuth Client ID from step 1 |
| `GITHUB_CLIENT_SECRET` | OAuth Client Secret from step 1 |
| `ADMIN_GH_USERNAME` | `korentomas` |
| `SESSION_SECRET` | output of `openssl rand -hex 32` |
| `GITHUB_TOKEN` | PAT from step 2 |

Redeploy so the function picks them up.

## Local dev

For local testing, put the same vars in a `.env` file (already git-ignored). For OAuth to work locally you need a second OAuth app whose callback is `http://localhost:3000/admin/callback`, or you can skip OAuth and manually mint a session cookie for testing.

## What lives where

- Content JSON: `content/*.json` — committed on every save via the GitHub API
- Uploaded images: `public/uploads/*` — committed on every upload
- Existing root assets (`me.png`, `og-image.png`, etc.): untouched by the CMS; manage manually

## Failure modes

- Build fails after a save → Vercel emails you. The bad JSON is in git history; revert manually.
- GitHub API rate limit → action returns an error; retry after a few minutes.
- Lost session mid-edit → re-auth required; in-flight edits are lost.
