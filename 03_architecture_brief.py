# Dome Process Analyzer — Architecture Brief for Claude Code
# Hand this to Claude Code as the starting context alongside 01_schema.py and 02_prompts.py

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# WHAT TO BUILD
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""
Dome Process Analyzer — Backend

A FastAPI backend that accepts plain-language business process descriptions,
analyses them with Claude, and returns structured JSON including a process
map, systems inventory, governance flags, and automation opportunities.

Build the complete backend. Use the schema in 01_schema.py and the prompts
in 02_prompts.py. Follow every constraint below exactly.
"""


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DIRECTORY STRUCTURE TO CREATE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app, CORS, router registration
│   ├── api/
│   │   ├── __init__.py
│   │   ├── analysis.py          # /api/v1/analysis endpoints
│   │   └── auth.py              # /api/v1/auth endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # Settings via pydantic-settings
│   │   ├── prompts.py           # System prompt constants (from 02_prompts.py)
│   │   ├── logging.py           # Structured JSON logging via structlog
│   │   └── cache.py             # In-memory analysis cache (TTL-based)
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py           # All Pydantic models (from 01_schema.py)
│   ├── providers/
│   │   ├── __init__.py
│   │   ├── base.py              # LLMProvider ABC
│   │   ├── claude.py            # ClaudeProvider implementation
│   │   ├── azure_openai.py      # AzureOpenAIProvider (stub — wired but not tested)
│   │   └── ollama.py            # OllamaProvider (stub — wired but not tested)
│   └── services/
│       ├── __init__.py
│       ├── analysis.py          # Core analysis orchestration service
│       └── governance.py        # GovernanceEvent emission
├── tests/
│   ├── __init__.py
│   └── test_analysis.py         # Basic endpoint smoke tests
├── Dockerfile
├── .env.example
├── requirements.txt
└── README.md
"""


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MANDATORY ARCHITECTURE CONSTRAINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""
1. LLM ABSTRACTION (non-negotiable)
   - All LLM calls go through LLMProvider ABC — never call anthropic SDK directly
     in business logic.
   - Provider selected via LLM_PROVIDER env var: "claude" | "azure_openai" | "ollama"
   - ClaudeProvider is the only fully implemented provider for v1.
   - AzureOpenAIProvider and OllamaProvider are stubbed — raise NotImplementedError
     with a clear message. Do not leave them unimplemented silently.

2. ZERO DATA RETENTION
   - Process descriptions are NEVER written to the database.
   - Unsaved analyses live in an in-memory cache with a 1-hour TTL, keyed by analysis_id.
   - When a user explicitly saves (POST /analysis/{id}/save with consent: true),
     store ONLY: analysis_id, user_id, process_name, process_domain, metrics,
     governance flag IDs and severities, automation opportunity IDs, overall_confidence,
     analysis_version, created_at, label.
   - The full ProcessAnalysis JSON is stored only on save, and only if consent is true.
   - GovernanceEvent is emitted for every analysis — logs metadata only, never content.

3. ANONYMOUS USE
   - POST /api/v1/analysis does not require authentication.
   - Anonymous analyses get a short-lived session_token (UUID) in the response.
   - The session_token is used to retrieve or refine the analysis before saving.
   - Saving requires a valid Supabase auth token.

4. ERROR HANDLING
   - Every endpoint returns ErrorResponse on failure.
   - LLM JSON parse failure: retry once with an error-correction prompt, then
     return 422 with details.
   - LLM provider unavailable: return 503.
   - Analysis not found in cache: return 404.
   - Validation errors: Pydantic handles, FastAPI returns 422 automatically.

5. STRUCTURED LOGGING
   - Use structlog for all logging.
   - Log format: JSON in production, pretty-printed in development.
   - Log every analysis request: analysis_id, input_length, domain_hint, duration_ms.
   - Never log the process description content itself.
"""


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# API ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""
POST   /api/v1/analysis                    → AnalysisResponse        (201)
POST   /api/v1/analysis/{id}/refine        → RefineResponse           (200)
GET    /api/v1/analysis/{id}               → AnalysisDetailResponse   (200) [auth required]
POST   /api/v1/analysis/{id}/save          → SaveResponse             (200) [auth required]
GET    /api/v1/analysis                    → AnalysisListResponse     (200) [auth required]
DELETE /api/v1/analysis/{id}               → 204                      [auth required]

POST   /api/v1/auth/magic-link             → MagicLinkResponse        (200)
POST   /api/v1/auth/verify                 → SessionResponse          (200)
DELETE /api/v1/auth/session                → 204                      [auth required]

GET    /api/v1/health                      → {"status": "ok"}         (200)
"""


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ENVIRONMENT VARIABLES (.env.example)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""
# LLM Provider — "claude" | "azure_openai" | "ollama"
LLM_PROVIDER=claude

# Anthropic (used when LLM_PROVIDER=claude)
ANTHROPIC_API_KEY=

# Azure OpenAI (used when LLM_PROVIDER=azure_openai)
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_KEY=
AZURE_OPENAI_DEPLOYMENT=

# Ollama (used when LLM_PROVIDER=ollama)
OLLAMA_URL=http://localhost:11434

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
ENVIRONMENT=development   # "development" | "production"
ALLOWED_ORIGINS=http://localhost:3000
CACHE_TTL_SECONDS=3600
"""


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ANALYSIS SERVICE LOGIC (core orchestration)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""
AnalysisService.run(request: AnalysisRequest, user_id: str | None) -> AnalysisResponse:

1. Generate analysis_id (UUID4)
2. Build user prompt:
   "Analyse the following business process description and return a JSON analysis.
    Process name hint: {process_name or 'infer from description'}
    Domain hint: {domain_hint or 'infer from description'}

    <process_description>
    {description}
    </process_description>"

3. Call llm_provider.generate_structured(prompt, schema=ProcessAnalysis.model_json_schema(),
   system=PROCESS_ANALYSIS_SYSTEM_PROMPT)

4. On JSON parse failure: retry once with:
   "The previous response was not valid JSON or did not match the required schema.
    Error: {error}
    Return ONLY valid JSON matching the schema. No prose, no code fences."

5. Validate response against ProcessAnalysis Pydantic model.
   On validation failure after retry: raise HTTPException(422)

6. Inject analysis_id and created_at (server-generated, not LLM-generated)

7. Store in cache: cache[analysis_id] = {analysis, original_description, session_token}

8. Emit GovernanceEvent (see governance.py)

9. Return AnalysisResponse


AnalysisService.refine(analysis_id, answers, session_token) -> RefineResponse:

1. Retrieve from cache — 404 if not found or session_token mismatch
2. Build refinement prompt using REFINEMENT_PROMPT_TEMPLATE
3. Call llm_provider.generate_structured(...)
4. Validate, increment analysis_version
5. Update cache
6. Return RefineResponse
"""


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# REQUIREMENTS.TXT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""
fastapi==0.115.0
uvicorn[standard]==0.30.6
pydantic==2.9.2
pydantic-settings==2.5.2
anthropic==0.34.2
httpx==0.27.2
python-jose[cryptography]==3.3.0
supabase==2.7.4
python-dotenv==1.0.1
structlog==24.4.0
"""


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DOCKERFILE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
"""


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# UX NOTES FOR FRONTEND (to build after backend is running)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""
Progressive disclosure pattern to reduce perceived wait time (LLM calls ~8–15s):

1. User submits description → button changes to loading state immediately
2. After ~300ms: skeleton UI appears with four section placeholders
   (Process Steps, Systems Map, Governance Flags, Automation Opportunities)
3. After ~1s: show an animated status message cycling through:
   "Mapping process steps..." → "Identifying systems..." →
   "Running governance checks..." → "Identifying automation opportunities..."
4. On response: sections populate with a staggered fade-in (150ms between sections)
5. Mermaid diagram renders last — it's the heaviest visual element

Design system: Dome Design System (DOME_DESIGN_SYSTEM.md in project files)
- Dark theme for marketing pages
- Light theme for product UI (Process Analyzer uses light theme)
- Fonts: Space Grotesk (headings), Outfit (body), JetBrains Mono (labels/buttons)
- Primary accent: #5B9CB5 (cyan)
- Cards: white background, 1px #E2E2E0 border, 4px radius, 24px padding
- Buttons: JetBrains Mono, uppercase, 1.4px letter-spacing
"""
