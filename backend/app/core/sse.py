"""Server-Sent Events helper for long-running LLM endpoints.

Wraps an async coroutine in an SSE stream that sends keepalive comments
every *heartbeat_seconds*.  This prevents Vercel's rewrite proxy (and
similar reverse proxies) from timing out on requests that take >120 s.

Protocol:
    : keepalive          ← comment (ignored by SSE parsers, resets proxy timer)
    event: result        ← final payload as JSON
    event: error         ← error payload as JSON with {status, detail}
"""

from __future__ import annotations

import asyncio
import json
from typing import Any, Coroutine

from pydantic import BaseModel
from starlette.responses import StreamingResponse


def sse_response(
    coro: Coroutine[Any, Any, Any],
    *,
    heartbeat_seconds: float = 15.0,
    extra_headers: dict[str, str] | None = None,
) -> StreamingResponse:
    """Return a ``StreamingResponse`` that keeps the connection alive with
    heartbeat comments while *coro* runs, then emits the result as an SSE
    ``result`` event.

    If *coro* raises, an SSE ``error`` event is emitted instead.
    """

    async def _generate():
        task = asyncio.create_task(coro)
        while not task.done():
            done, _ = await asyncio.wait({task}, timeout=heartbeat_seconds)
            if not done:
                yield ": keepalive\n\n"

        try:
            result = task.result()
            if isinstance(result, BaseModel):
                data = result.model_dump_json()
            else:
                data = json.dumps(result, default=str)
            yield f"event: result\ndata: {data}\n\n"
        except Exception as exc:
            status = getattr(exc, "status_code", 500)
            detail = getattr(exc, "detail", str(exc))
            yield f"event: error\ndata: {json.dumps({'status': status, 'detail': detail})}\n\n"

    headers = {
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
    }
    if extra_headers:
        headers.update(extra_headers)

    return StreamingResponse(
        _generate(),
        media_type="text/event-stream",
        headers=headers,
    )
