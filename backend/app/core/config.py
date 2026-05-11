from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # LLM Provider
    llm_provider: Literal["claude", "azure_openai", "ollama"] = "claude"

    # Anthropic
    anthropic_api_key: str = ""

    # Azure OpenAI
    azure_openai_endpoint: str = ""
    azure_openai_key: str = ""
    azure_openai_deployment: str = ""

    # Ollama
    ollama_url: str = "http://localhost:11434"

    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    # Redis (optional — used for cross-instance rate limiting)
    redis_url: str = ""

    # App
    environment: Literal["development", "staging", "production"] = "development"
    allowed_origins: str = "http://localhost:3000"
    # Frontend base URL — used as emailRedirectTo in magic link emails.
    # Must match an allowed redirect URL in Supabase dashboard.
    site_url: str = "http://localhost:3000"
    # Magic link callback URL. Intentionally points to the central domelayer.com auth
    # callback so all DOME tools share the same login flow and shared cookie domain.
    # Override per-deployment when a dedicated auth service is introduced.
    auth_callback_url: str = "https://domelayer.com/auth/callback"
    cache_ttl_seconds: int = 3600

    # Hourly cost-cap on /api/v1/analysis. The middleware-level burst limit
    # (10/60s) is independent of these and applies to everyone.
    analysis_hourly_anon_limit: int = 3
    analysis_hourly_auth_limit: int = 30
    analysis_hourly_window_seconds: int = 3600

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }

    @model_validator(mode="after")
    def validate_required_secrets(self) -> "Settings":
        if self.environment in ("staging", "production"):
            missing = [
                name
                for name, val in [
                    ("ANTHROPIC_API_KEY", self.anthropic_api_key),
                    ("SUPABASE_SERVICE_ROLE_KEY", self.supabase_service_role_key),
                    ("SUPABASE_URL", self.supabase_url),
                ]
                if not val
            ]
            if missing:
                raise ValueError(
                    f"Missing required {self.environment} environment variables: "
                    f"{', '.join(missing)}"
                )
        return self


settings = Settings()
