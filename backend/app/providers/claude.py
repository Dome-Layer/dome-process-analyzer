from __future__ import annotations

import json
import anthropic

from app.providers.base import LLMProvider
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class ClaudeProvider(LLMProvider):
    """Anthropic Claude LLM provider."""

    def __init__(self):
        self._client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        self._model = "claude-sonnet-4-20250514"

    async def generate_structured(
        self,
        prompt: str,
        schema: dict,
        system: str,
    ) -> dict:
        try:
            response = await self._client.messages.create(
                model=self._model,
                max_tokens=8192,
                system=system,
                messages=[{"role": "user", "content": prompt}],
            )
        except anthropic.APIConnectionError as e:
            logger.error("claude_connection_error", error=str(e))
            raise ConnectionError(f"Claude API unreachable: {e}") from e
        except anthropic.APIStatusError as e:
            logger.error("claude_api_error", status=e.status_code, error=str(e))
            raise ConnectionError(f"Claude API error ({e.status_code}): {e}") from e

        raw_text = response.content[0].text.strip()

        # Strip markdown code fences if present
        if raw_text.startswith("```"):
            lines = raw_text.split("\n")
            # Remove first line (```json or ```) and last line (```)
            if lines[-1].strip() == "```":
                lines = lines[1:-1]
            else:
                lines = lines[1:]
            raw_text = "\n".join(lines)

        try:
            return json.loads(raw_text)
        except json.JSONDecodeError as e:
            logger.warning("claude_json_parse_failed", error=str(e))
            raise ValueError(f"Failed to parse Claude response as JSON: {e}") from e
