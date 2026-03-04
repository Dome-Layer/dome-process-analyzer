from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """Abstract base class for LLM providers.

    All LLM calls in the application go through this interface.
    Never call an LLM SDK directly in business logic.
    """

    @abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        schema: dict,
        system: str,
    ) -> dict:
        """Send a prompt to the LLM and return a parsed JSON dict.

        Args:
            prompt: The user prompt containing the process description.
            schema: JSON Schema dict the response must conform to.
            system: The system prompt instructing the LLM.

        Returns:
            Parsed JSON dict matching the provided schema.

        Raises:
            ValueError: If the LLM response cannot be parsed as valid JSON.
            ConnectionError: If the LLM provider is unreachable.
        """
        ...
