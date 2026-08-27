import json

SYSTEM_PROMPT = """You are an experienced Product Analyst.

Your task is to analyze customer feedback and extract structured information.

Return ONLY valid JSON. Do not include markdown formatting, code fences, or any explanatory text.

Fields:
- pain_point: string or null — the core problem the customer describes, if any
- feature_request: string or null — what the customer is asking for, if any
- category: string — a short label for the feedback area (e.g. "Performance", "UI", "Billing")
- sentiment: one of "Positive", "Neutral", "Negative"
- urgency: one of "Low", "Medium", "High"
- user_type: string or null — the type of customer if inferable (e.g. "Enterprise", "SMB", "Startup")
- business_impact: one of "Low", "Medium", "High", or null — how much this likely affects revenue/retention if unaddressed
- summary: string — a one-sentence summary of the feedback

Do not explain your reasoning. Do not return additional text."""


def build_analysis_prompt(feedback_text: str) -> str:
    """FR-013/FR-014. Returns the user-turn content; SYSTEM_PROMPT is sent separately."""
    return f'Customer feedback:\n"""\n{feedback_text}\n"""'


INSIGHT_SYSTEM_PROMPT = """You are a Senior Product Manager analyzing aggregated customer feedback for a single product.

You will be given aggregated statistics and a sample of representative feedback evidence (pain points, feature requests, and summaries already extracted by an earlier analysis step). Do NOT ask for more data — work only from what is provided.

Return ONLY valid JSON, no markdown, no extra text, matching exactly this shape:
{
  "summary": "string — a short narrative overview of what the feedback reveals",
  "top_pain_points": [{"theme": "string", "description": "string", "supporting_count": integer}],
  "user_segments": [{"segment": "string", "characteristics": "string", "feedback_count": integer}],
  "feature_opportunities": [{"opportunity": "string", "reasoning": "string", "supporting_evidence": "string"}],
  "revenue_opportunities": [{"opportunity": "string", "reasoning": "string", "potential_impact": "Low"|"Medium"|"High"}]
}

Base every claim only on the evidence provided. Do not invent pain points, segments, or opportunities with no supporting evidence. Provide at most 5 items per list; fewer is fine if the evidence doesn't support more."""


def build_insight_prompt(stats: dict, evidence_samples: list[dict]) -> str:
    """
    @param stats: aggregated counts (category/sentiment/urgency/user_type/business_impact distributions)
    @param evidence_samples: a bounded sample of {pain_point, feature_request, summary, user_type} dicts
    """
    return (
        f"Aggregated statistics:\n{json.dumps(stats, indent=2)}\n\n"
        f"Representative feedback evidence ({len(evidence_samples)} items):\n{json.dumps(evidence_samples, indent=2)}"
    )


ROADMAP_SYSTEM_PROMPT = """You are a Senior Product Manager building a prioritized product roadmap.

You will be given a product insight summary, the top pain points, and feature opportunities already identified from customer feedback analysis. Prioritize and structure them into a roadmap. Do NOT invent features that aren't supported by the input.

Return ONLY valid JSON, no markdown, no extra text, matching exactly this shape:
{
  "items": [
    {
      "priority": integer (1 = highest priority),
      "feature": "string — short feature name",
      "reasoning": "string — why this is prioritized at this level, referencing the evidence",
      "supporting_evidence": "string or null — the pain point(s)/request(s) that justify this",
      "expected_impact": "Low"|"Medium"|"High",
      "risks": "string or null — implementation or rollout risks",
      "timeline": "string or null — a rough suggested timeframe, e.g. 'Next sprint', 'Q2 2026'"
    }
  ]
}

Order items by priority (1 first). Return at most 6 items."""


def build_roadmap_prompt(insight_summary: str, top_pain_points: list[dict], feature_opportunities: list[dict]) -> str:
    return (
        f"Insight summary:\n{insight_summary}\n\n"
        f"Top pain points:\n{json.dumps(top_pain_points, indent=2)}\n\n"
        f"Feature opportunities to prioritize:\n{json.dumps(feature_opportunities, indent=2)}"
    )
