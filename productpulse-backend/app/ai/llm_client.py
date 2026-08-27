import json
import re
from abc import ABC, abstractmethod

import httpx

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

ANTHROPIC_MODEL = "claude-sonnet-4-5"
ANTHROPIC_API_VERSION = "2023-06-01"


class LLMClient(ABC):
    """Interface every provider implements. Analysis Service depends on this, never on a concrete client (Chapter 8 §5)."""

    model_name: str

    @abstractmethod
    async def complete(self, system_prompt: str, user_prompt: str) -> str:
        """Returns raw text output. Callers are responsible for parsing/validating it (Chapter 8 §10)."""
        raise NotImplementedError


class AnthropicLLMClient(LLMClient):
    """Real provider. Requires AI_API_KEY to be set."""

    model_name = ANTHROPIC_MODEL

    async def complete(self, system_prompt: str, user_prompt: str) -> str:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": settings.ai_api_key,
                    "anthropic-version": ANTHROPIC_API_VERSION,
                    "content-type": "application/json",
                },
                json={
                    "model": ANTHROPIC_MODEL,
                    "max_tokens": 500,
                    "system": system_prompt,
                    "messages": [{"role": "user", "content": user_prompt}],
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["content"][0]["text"]


# --- Mock client -------------------------------------------------------
# Used automatically when AI_API_KEY isn't configured, and by the test
# suite (tests should never hit a paid, non-deterministic external API).
# Its model_name is honestly reported as "mock-heuristic-v1" — analyses
# produced by it are never mislabeled as coming from a real model.

_POSITIVE_WORDS = {"great", "love", "happy", "excellent", "good", "nice", "helpful", "fast", "easy", "clean"}
_NEGATIVE_WORDS = {"slow", "bug", "broken", "terrible", "hate", "bad", "frustrat", "confus", "unusable", "fail"}
_URGENT_WORDS = {"urgent", "critical", "asap", "immediately", "blocker", "unusable"}
_REQUEST_PHRASES = ["please add", "would love", "can we get", "could you add", "requesting", "need the ability"]
_ENTERPRISE_WORDS = {"enterprise", "team of", "our organization", "company-wide", "sso"}
_STARTUP_WORDS = {"small business", "small team", "startup", "solo"}

_CATEGORY_KEYWORDS = {
    "Performance": ["slow", "performance", "lag", "timeout", "speed"],
    "UI": ["dark mode", "ui", "design", "layout", "interface", "mobile view"],
    "Billing": ["invoice", "billing", "payment", "vat", "tax", "charge"],
    "Integrations": ["integrat", "slack", "api", "webhook"],
    "Authentication": ["login", "sso", "auth", "password", "sign in"],
    "Notifications": ["notif", "email", "spam", "alert"],
    "Onboarding": ["onboard", "setup", "getting started"],
    "Reporting": ["report", "export", "chart", "analytics"],
}


class MockLLMClient(LLMClient):
    """Deterministic keyword-based extraction. Not an LLM — a documented stand-in for one."""

    model_name = "mock-heuristic-v1"

    async def complete(self, system_prompt: str, user_prompt: str) -> str:  # noqa: ARG002
        if "Feature opportunities to prioritize:" in user_prompt:
            return self._mock_roadmap(user_prompt)
        if "Aggregated statistics:" in user_prompt:
            return self._mock_insight(user_prompt)
        return self._mock_analysis(user_prompt)

    def _mock_analysis(self, user_prompt: str) -> str:
        # Extract the feedback text back out of the prompt (see prompt_builder.build_analysis_prompt).
        match = re.search(r'"""\n(.*?)\n"""', user_prompt, re.DOTALL)
        text = match.group(1) if match else user_prompt
        lower = text.lower()

        sentiment = "Neutral"
        if any(word in lower for word in _NEGATIVE_WORDS):
            sentiment = "Negative"
        elif any(word in lower for word in _POSITIVE_WORDS):
            sentiment = "Positive"

        urgency = "High" if any(word in lower for word in _URGENT_WORDS) else ("Medium" if sentiment == "Negative" else "Low")

        category = "General"
        for cat, keywords in _CATEGORY_KEYWORDS.items():
            if any(kw in lower for kw in keywords):
                category = cat
                break

        sentences = [s.strip() for s in text.strip().split(".") if s.strip()]
        pain_point = sentences[0] if sentences and sentiment == "Negative" else None

        feature_request = None
        for sentence in sentences:
            if any(phrase in sentence.lower() for phrase in _REQUEST_PHRASES):
                feature_request = sentence
                break

        summary = text.strip()[:140] + ("…" if len(text.strip()) > 140 else "")

        user_type = None
        if any(word in lower for word in _ENTERPRISE_WORDS):
            user_type = "Enterprise"
        elif any(word in lower for word in _STARTUP_WORDS):
            user_type = "Startup"

        business_impact = "High" if urgency == "High" else ("Medium" if sentiment == "Negative" else "Low")

        return json.dumps(
            {
                "pain_point": pain_point,
                "feature_request": feature_request,
                "category": category,
                "sentiment": sentiment,
                "urgency": urgency,
                "user_type": user_type,
                "business_impact": business_impact,
                "summary": summary,
            }
        )

    def _mock_insight(self, user_prompt: str) -> str:
        """Deterministic synthesis from the same stats/evidence a real LLM would receive — no external call."""
        stats_match = re.search(r"Aggregated statistics:\n(.*?)\n\nRepresentative", user_prompt, re.DOTALL)
        evidence_match = re.search(r"feedback evidence \(\d+ items\):\n(.*)", user_prompt, re.DOTALL)
        stats = json.loads(stats_match.group(1)) if stats_match else {}
        evidence = json.loads(evidence_match.group(1)) if evidence_match else []

        pain_points = [e["pain_point"] for e in evidence if e.get("pain_point")]
        pain_counts: dict[str, int] = {}
        for p in pain_points:
            pain_counts[p] = pain_counts.get(p, 0) + 1
        top_pain_points = [
            {"theme": text[:60], "description": text, "supporting_count": count}
            for text, count in sorted(pain_counts.items(), key=lambda kv: -kv[1])[:5]
        ]

        user_type_counts = stats.get("user_type_distribution", {})
        user_segments = [
            {"segment": segment, "characteristics": f"{count} feedback item(s) from this segment.", "feedback_count": count}
            for segment, count in list(user_type_counts.items())[:5]
        ]

        feature_requests = [e["feature_request"] for e in evidence if e.get("feature_request")]
        feature_counts: dict[str, int] = {}
        for f in feature_requests:
            feature_counts[f] = feature_counts.get(f, 0) + 1
        feature_opportunities = [
            {"opportunity": text[:60], "reasoning": f"Requested {count} time(s) in analyzed feedback.", "supporting_evidence": text}
            for text, count in sorted(feature_counts.items(), key=lambda kv: -kv[1])[:5]
        ]

        high_impact_count = stats.get("business_impact_distribution", {}).get("High", 0)
        revenue_opportunities = []
        if high_impact_count > 0 and feature_opportunities:
            revenue_opportunities.append(
                {
                    "opportunity": feature_opportunities[0]["opportunity"],
                    "reasoning": f"{high_impact_count} feedback item(s) flagged High business impact.",
                    "potential_impact": "High",
                }
            )

        summary = (
            f"Analyzed {stats.get('total_analyzed', len(evidence))} feedback items. "
            f"Top themes: {', '.join(p['theme'] for p in top_pain_points[:3]) or 'none identified'}."
        )

        return json.dumps(
            {
                "summary": summary,
                "top_pain_points": top_pain_points,
                "user_segments": user_segments,
                "feature_opportunities": feature_opportunities,
                "revenue_opportunities": revenue_opportunities,
            }
        )

    def _mock_roadmap(self, user_prompt: str) -> str:
        """Deterministic prioritization: pain points first (by supporting_count desc), then feature opportunities."""
        pain_match = re.search(r"Top pain points:\n(.*?)\n\nFeature opportunities", user_prompt, re.DOTALL)
        feature_match = re.search(r"Feature opportunities to prioritize:\n(.*)", user_prompt, re.DOTALL)
        pain_points = json.loads(pain_match.group(1)) if pain_match else []
        features = json.loads(feature_match.group(1)) if feature_match else []

        items = []
        priority = 1

        for pp in sorted(pain_points, key=lambda p: -p.get("supporting_count", 0))[:3]:
            items.append(
                {
                    "priority": priority,
                    "feature": f"Address: {pp['theme'][:60]}",
                    "reasoning": f"Cited by {pp.get('supporting_count', 1)} feedback item(s) as a pain point.",
                    "supporting_evidence": pp.get("description"),
                    "expected_impact": "High" if pp.get("supporting_count", 0) > 1 else "Medium",
                    "risks": "Requires root-cause investigation before implementation estimate is reliable.",
                    "timeline": "Next sprint" if priority == 1 else "Q2",
                }
            )
            priority += 1

        for f in features[: max(0, 6 - len(items))]:
            items.append(
                {
                    "priority": priority,
                    "feature": f.get("opportunity", "Untitled")[:60],
                    "reasoning": f.get("reasoning", "Requested by customers."),
                    "supporting_evidence": f.get("supporting_evidence"),
                    "expected_impact": "Medium",
                    "risks": None,
                    "timeline": "Q2",
                }
            )
            priority += 1

        return json.dumps({"items": items})


def get_llm_client() -> LLMClient:
    if settings.ai_api_key:
        return AnthropicLLMClient()
    logger.warning("AI_API_KEY not set — using MockLLMClient (deterministic heuristic, not a real LLM).")
    return MockLLMClient()
