# OWeb x Nanobrowser Fork

> **Canonical fork:** https://github.com/SalesflowOne/nanobrowser
> Upstream parent: https://github.com/nanobrowser/nanobrowser
> Default product branch: `oweb`
> License: Apache-2.0 (see `LICENSE`)
> Product plan: OWeb-Intelligence `docs/CHROME_COMPANION_MASTER_PLAN.md`

## Decision

OWeb Chrome Companion is developed in this fork. The OWeb-Intelligence monorepo may vendor or submodule this repo under `extensions/chrome-nanobrowser/`.

## Architecture

Side panel -> Executor (Planner + Navigator) -> createChatModel(OWeb) -> POST /api/extension/v1/chat/completions -> Vercel AI Gateway (+ OWeb credits)

Local browser tools remain Nanobrowser. Server tools (Composio, cloud Anchor) are Phase B+.

## Build

```bash
pnpm install && pnpm build
# Load unpacked: dist/
```

## Configure OWeb provider

1. Settings -> Models -> Add provider -> OWeb
2. API Key = Supabase access token (Sign-in UI next)
3. Base URL = https://oweb.one/api/extension/v1 or http://localhost:8080/api/extension/v1
4. Assign Planner + Navigator to an OWeb model

## Adaptation checklist

- [x] Fork under SalesflowOne/nanobrowser
- [x] ProviderTypeEnum.OWeb + createChatModel branch
- [x] Soft EN branding strings
- [ ] Supabase PKCE sign-in UI
- [ ] Default-on OWeb provider + hide BYOK
- [ ] Org picker + credit display
- [ ] Thread sync with ao_threads
- [ ] Composio / cloud browser tool bridge
- [ ] Teach OWeb observe mode
- [ ] Chrome Web Store listing as OWeb
