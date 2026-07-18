# OWeb × Nanobrowser Fork

> Upstream: [nanobrowser/nanobrowser](https://github.com/nanobrowser/nanobrowser)  
> Vendored commit: `322384f8b4d48d8614343e51efca68c85e64f90b` (v0.1.13-era)  
> License: Apache-2.0 (see `LICENSE`)  
> Product plan: `docs/CHROME_COMPANION_MASTER_PLAN.md`

## Decision

OWeb Chrome Companion is a **fork of Nanobrowser**, not a greenfield MV3 shell.

Nanobrowser already provides:

- Side panel chat + options UI
- Multi-agent Planner / Navigator loop
- Local tab control (debugger, content scripts, a11y-style actions)
- Conversation history

OWeb owns:

- Supabase auth (JWT)
- LLM access via `/api/extension/v1/chat/completions` (credits + gateway)
- Later: org policy, Composio bridge, Teach OWeb / skills sync, Store branding

## Architecture (Nanobrowser path)

```
Side panel → Executor (Planner + Navigator)  [stays in extension]
                 │
                 ▼
         createChatModel(OWeb)
                 │  Bearer JWT + org header
                 ▼
     POST /api/extension/v1/chat/completions
                 │
                 ▼
         Vercel AI Gateway (+ OWeb credits)
```

Local browser tools remain Nanobrowser’s. Server tools (Composio, cloud Anchor) are Phase B+.

## Build

Requires Node ≥ 22.12 and pnpm 9.15.1:

```bash
cd extensions/chrome-nanobrowser
pnpm install
pnpm build
# Load unpacked: extensions/chrome-nanobrowser/dist
```

## Configure OWeb provider

1. Load the unpacked extension.
2. Open Settings → Models → Add provider → **OWeb**.
3. Set **API Key** to a Supabase access token (temporary until Sign-in UI lands).
4. Confirm Base URL is `https://oweb.one/api/extension/v1` (or `http://localhost:8080/api/extension/v1` for local).
5. Optional header via future UI: `X-OWeb-Org-Id`.
6. Assign Planner + Navigator to an OWeb model (e.g. `google/gemini-2.5-flash`).

## Adaptation checklist

- [x] Vendor upstream source (no nested `.git`)
- [x] `ProviderTypeEnum.OWeb` + `createChatModel` branch
- [x] OpenAI-compatible proxy route on OWeb
- [x] Soft EN branding strings
- [ ] Supabase PKCE sign-in UI (replace paste-token)
- [ ] Default-on OWeb provider + hide BYOK for product builds
- [ ] Org picker + credit display
- [ ] Thread sync with `ao_threads`
- [ ] Composio / cloud browser tool bridge
- [ ] Teach OWeb observe mode → extension-ingest
- [ ] Chrome Web Store listing as “OWeb”

## Syncing upstream

Prefer cherry-picks / selective merges from Nanobrowser `master`. Do not force-push over OWeb-only files (`OWEB_FORK.md`, provider stubs).
