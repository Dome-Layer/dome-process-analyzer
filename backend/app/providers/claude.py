from __future__ import annotations

import asyncio
import json

import anthropic

from app.core.config import settings
from app.core.logging import get_logger
from app.providers.base import LLMProvider

logger = get_logger(__name__)


class ClaudeProvider(LLMProvider):
    """Anthropic Claude LLM provider."""

    def __init__(self):
        self._client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key or None)
        self._model = "claude-sonnet-4-20250514"

    async def generate_structured(
        self,
        prompt: str,
        schema: dict,
        system: str,
    ) -> dict:
        schema_hint = (
            f"\n\nOutput schema — use these exact field names:\n{json.dumps(schema, indent=2)}"
        )
        last_exc: Exception | None = None
        for attempt in range(3):
            try:
                response = await self._client.messages.create(
                    model=self._model,
                    max_tokens=16384,
                    system=system,
                    messages=[{"role": "user", "content": prompt + schema_hint}],
                )
                last_exc = None
                break
            except anthropic.APIConnectionError as e:
                logger.error("claude_connection_error", error=str(e))
                raise ConnectionError(f"Claude API unreachable: {e}") from e
            except anthropic.APIStatusError as e:
                if e.status_code == 529 and attempt < 2:
                    wait = 2**attempt  # 1s, 2s
                    logger.warning("claude_overloaded_retry", attempt=attempt + 1, wait=wait)
                    await asyncio.sleep(wait)
                    last_exc = e
                    continue
                logger.error("claude_api_error", status=e.status_code, error=str(e))
                raise ConnectionError(f"Claude API error ({e.status_code}): {e}") from e

        if last_exc is not None:
            raise ConnectionError(
                f"Claude API overloaded after 3 attempts: {last_exc}"
            ) from last_exc

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
