from app.providers.base import LLMProvider


class OllamaProvider(LLMProvider):
    """Ollama LLM provider — stub implementation.

    Wired into the provider factory but not yet tested.
    Will raise NotImplementedError on any call.
    """

    async def generate_structured(
        self,
        prompt: str,
        schema: dict,
        system: str,
    ) -> dict:
        raise NotImplementedError(
            "OllamaProvider is not yet implemented. "
            "Set LLM_PROVIDER=claude to use the Anthropic Claude provider."
        )
