from slowapi import Limiter
from starlette.requests import Request


def get_real_ip(request: Request) -> str:
    """Extract the real client IP, looking through Railway/Fastly proxy headers."""
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "127.0.0.1"


limiter = Limiter(key_func=get_real_ip)
