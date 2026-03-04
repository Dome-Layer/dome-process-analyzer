from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Literal


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

    # App
    environment: Literal["development", "production"] = "development"
    allowed_origins: str = "http://localhost:3000"
    cache_ttl_seconds: int = 3600

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


settings = Settings()
