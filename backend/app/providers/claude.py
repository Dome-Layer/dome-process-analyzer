from dome_core.llm.claude import ClaudeProvider as _ClaudeProvider

from app.core.config import settings


class ClaudeProvider(_ClaudeProvider):
    def __init__(self) -> None:
        super().__init__(
            api_key=settings.anthropic_api_key or "",
            model=settings.llm_text_model,
        )
