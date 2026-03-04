from app.providers.base import LLMProvider


class AzureOpenAIProvider(LLMProvider):
    """Azure OpenAI LLM provider — stub implementation.

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
            "AzureOpenAIProvider is not yet implemented. "
            "Set LLM_PROVIDER=claude to use the Anthropic Claude provider."
        )
