# Security policy

Dome takes the security of this codebase seriously. This document explains how to report vulnerabilities and how secrets are handled.

## Reporting a vulnerability

Please email **security@domelayer.com** with the subject line `Security: <short description>`. Do not open public GitHub issues for security reports.

We aim to acknowledge promptly and provide a remediation plan as quickly as is reasonable for the severity reported.

## Scope

This policy covers code in this repository (`dome-process-analyzer`). Other Dome repos have their own SECURITY.md.

In scope:
- Authentication bypass, JWT verification weakness, session-token misuse
- Cost-exhaustion attacks against LLM endpoints with proof of business impact
- Code execution, sensitive-data exposure, prompt injection that yields exfiltration
- Cryptographic weakness, injection (SQL / command), insecure direct object reference (the `session_token` and `analysis_id` URLs in particular)
- Vulnerabilities in pinned dependencies that this repo's code is exposed to

Out of scope:
- Brute-force findings against the demo deployment without proof of business impact
- Reports targeting the deliberately anonymous `POST /api/v1/analysis` endpoint that show only that anonymous use is allowed (this is documented intentional behaviour, rate-limited at 10 req/60s per IP)
- Vulnerabilities in unsupported deployment modes (Azure tenant / air-gapped — these LLM providers are stubs and documented as `NotImplementedError`)

## Secrets handling

This repo follows the Dome portfolio standard:
- Real secrets live in Railway environment variables, never in the repo.
- `.env.example` is committed; any `.env*` file with real values is local-only and gitignored.
- Secrets are rotated when there is any suspicion of exposure, on contractor offboarding, and at least annually.

### Secrets inventory

| Variable | Where used | Sensitivity |
|---|---|---|
| `ANTHROPIC_API_KEY` | Backend Claude provider | **Secret — high impact** (cost burn if exposed) |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend DB writes (bypasses RLS) | **Secret — critical impact** |
| `SUPABASE_ANON_KEY` | Backend (limited use); frontend (auth) | Public — RLS-enforced |
| `SUPABASE_URL` | Backend + frontend | Public |
| `REDIS_URL` | Backend rate limiter | Secret if it includes credentials |
| `SITE_URL`, `ALLOWED_ORIGINS`, `ENVIRONMENT`, `CACHE_TTL_SECONDS` | Backend config | Public (config, not secrets) |
| `AZURE_OPENAI_KEY`, `AZURE_OPENAI_ENDPOINT` | Backend (stub provider) | Secret when populated; not used today |

### Rotation log

| Date | Reason | Keys rotated |
|------|--------|--------------|
| 2026-04 | Pre-publication audit — repo made public | Keys rotated as part of pre-publication hardening |

## Supported versions

Only the `main` branch is supported. Pre-release branches and tagged releases are not.

## Acknowledgements

Reports that result in fixes will be acknowledged here unless the reporter requests anonymity.
