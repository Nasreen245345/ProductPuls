import json
import re

_CODE_FENCE_PATTERN = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)


class MalformedAIResponseError(Exception):
    """Raised when the LLM's output isn't valid JSON at all — a validator.ValidationError means it parsed but failed schema checks."""


def parse_llm_response(raw_text: str) -> dict:
    cleaned = _CODE_FENCE_PATTERN.sub("", raw_text).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise MalformedAIResponseError(f"LLM response was not valid JSON: {exc}") from exc
