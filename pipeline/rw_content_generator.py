from __future__ import annotations

import json
import re
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from claude_cli import call_claude


class ContentGenerator:
    def __init__(self, agent: str = "seo-aeo-geo-strategist") -> None:
        self.agent = agent

    def generate_all(
        self,
        city_name: str,
        race_name: str,
        circuit_name: str,
        schedule_string: str,
        series: str = "f1",
        track_image_path: str = ""
    ) -> dict[str, Any]:
        """Generate all content for raceweekend in parallel."""
        
        with ThreadPoolExecutor(max_workers=4) as executor:
            future_guide = executor.submit(
                self._generate_guide_content, city_name, race_name, circuit_name, schedule_string, series
            )
            future_getting_there = executor.submit(
                self._generate_getting_there, city_name, circuit_name, series
            )
            future_tips_stay = executor.submit(
                self._generate_tips_and_stay, city_name, race_name, schedule_string, series
            )
            future_city_guide = executor.submit(
                self._generate_city_guide, city_name, race_name, series
            )

            guide_content = future_guide.result()
            getting_there_content = future_getting_there.result()
            tips_stay_content = future_tips_stay.result()
            city_guide_content = future_city_guide.result()

        merged = {
            **guide_content,
            **getting_there_content,
            **tips_stay_content,
            **city_guide_content,
        }
        
        # Normalise FAQs
        merged["faq_items"] = self._normalise_faq(merged.get("faq_items") or [])
        merged["faq_ld"] = self._build_faq_ld(race_name, merged["faq_items"])
        merged["circuit_map_src"] = track_image_path or f"/tracks/{city_name.replace(' ', '_')}_Circuit.avif"
        
        return self._adapt_for_db(merged)

    def _generate_city_guide(self, city: str, race_name: str, series: str) -> dict[str, Any]:
        series_label = "MotoGP" if series == "motogp" else "F1"
        prompt = f"""Generate a city exploration guide for {series_label} fans visiting {city} for the {race_name}.
Focus on what to do outside the track.

Return JSON:
{{
  "city_guide": "Markdown formatted article (~400 words) with these sections: ## The City, ## Neighbourhoods, ## Food & Drink, ## Race Weekend Vibe. Use prose, be engaging."
}}
"""
        return self._call_json(prompt)

    def _generate_guide_content(self, city: str, race_name: str, circuit: str, schedule: str, series: str) -> dict[str, Any]:
        series_label = "MotoGP" if series == "motogp" else "F1"
        event_label = "MotoGP round" if series == "motogp" else "Grand Prix"
        facts_keys = (
            '"Lap Record", "Track Length", "Corners", "MotoGP Classes"'
            if series == "motogp"
            else '"Lap Record", "Circuit Length", "Turns", "DRS Zones"'
        )

        prompt = f"""Generate {series_label} race weekend guide content for {race_name} in {city}.
Circuit: {circuit}
Race schedule: {schedule}

Return JSON:
{{
  "hero_title": "...",
  "hero_subtitle": "...",
  "guide_intro": "2-3 sentence intro paragraph",
  "why_city_text": "150-200 word paragraph on why visit {city} for the {event_label}",
  "highlights_list": ["5-6 bullet strings of must-see things at circuit or city"],
  "circuit_facts": {{{facts_keys}: "..."}},
  "faq_items": [
    {{"question": "How to get to the circuit?", "answer": "..."}},
    {{"question": "When to arrive at the track?", "answer": "..."}},
    {{"question": "What to do between sessions?", "answer": "..."}},
    {{"question": "Where to eat near the circuit?", "answer": "..."}},
    {{"question": "What is the expected weather?", "answer": "..."}},
    {{"question": "Any booking tips?", "answer": "..."}}
  ]
}}
"""
        return self._call_json(prompt)

    def _generate_getting_there(self, city: str, circuit: str, series: str) -> dict[str, Any]:
        series_label = "MotoGP" if series == "motogp" else "F1"
        prompt = f"""Generate detailed transport guide for {series_label} fans visiting {city} for the race at {circuit}.
        
Return JSON:
{{
  "getting_there_intro": "2-3 sentences overview of the transport situation.",
  "transport_options": [
    {{
      "icon": "🚇",
      "title": "Metro / Train",
      "desc": "2-3 sentences with specific line names, stops, journey time, cost, and race-day tips."
    }},
    {{
      "icon": "🚌",
      "title": "Shuttle Bus",
      "desc": "Details about official race shuttles or local buses."
    }},
    {{
      "icon": "🚕",
      "title": "Taxi / Rideshare",
      "desc": "Drop-off points, expected costs, and traffic warnings."
    }}
  ],
  "getting_there": "A longer 3-4 paragraph prose fallback covering all transport options in detail."
}}
"""
        return self._call_json(prompt)

    def _generate_tips_and_stay(self, city: str, race_name: str, schedule: str, series: str) -> dict[str, Any]:
        series_label = "MotoGP" if series == "motogp" else "F1"
        prompt = f"""Generate travel tips and accommodation guide for {series_label} fans visiting {city} for {race_name}.
Schedule: {schedule}

Return JSON:
{{
  "travel_tips": [
    {{"heading": "Pack for the weather", "body": "..."}},
    {{"heading": "Download the app", "body": "..."}},
    {{"heading": "Cash vs Card", "body": "..."}},
    {{"heading": "Ear protection", "body": "..."}},
    {{"heading": "Local Etiquette", "body": "..."}}
  ],
  "where_to_stay": "Markdown formatted guide (using ## headings) covering best neighborhoods, price ranges, and booking timing. ~300-400 words.",
  "tips_content": "A 2-3 paragraph overview of the weekend atmosphere and how to handle the session gaps.",
  "page_title": "{series_label} {city} Guide: {race_name} Travel & Tickets",
  "page_description": "Comprehensive guide for the {race_name} in {city}. Includes transport, where to stay, travel tips, and circuit facts.",
  "page_keywords": ["{city} {series_label}", "{race_name} guide", "where to stay in {city} for {series_label}"],
  "currency": "Host country 3-letter currency code (e.g. AUD, EUR, USD)"
}}
"""
        return self._call_json(prompt)

    def _normalise_faq(self, items: list[dict[str, Any]]) -> list[dict[str, Any]]:
        normalized = []
        for item in items:
            normalized.append({
                "question": item.get("question") or item.get("q") or "",
                "answer": item.get("answer") or item.get("a") or ""
            })
        return [i for i in normalized if i["question"] and i["answer"]]

    def _build_faq_ld(self, race_name: str, faq_items: list[dict[str, Any]]) -> dict[str, Any]:
        entities = []
        for item in faq_items:
            q = item.get("question")
            a = item.get("answer")
            if not q or not a:
                continue
            entities.append(
                {
                    "@type": "Question",
                    "name": q,
                    "acceptedAnswer": {"@type": "Answer", "text": a},
                }
            )
        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "name": f"{race_name} FAQ",
            "mainEntity": entities,
        }

    def _adapt_for_db(self, merged: dict[str, Any]) -> dict[str, Any]:
        """Returns flat dict with exactly the keys needed by raceweekend DB."""
        return {
            "hero_title": merged.get("hero_title"),
            "hero_subtitle": merged.get("hero_subtitle"),
            "guide_intro": merged.get("guide_intro"),
            "why_city_text": merged.get("why_city_text"),
            "highlights_list": merged.get("highlights_list") or [],
            "circuit_facts": merged.get("circuit_facts") or {},
            "getting_there_intro": merged.get("getting_there_intro"),
            "transport_options": merged.get("transport_options") or [],
            "getting_there": merged.get("getting_there"),
            "where_to_stay": merged.get("where_to_stay"),
            "travel_tips": merged.get("travel_tips") or [],
            "faq_items": merged.get("faq_items") or [],
            "faq_ld": merged.get("faq_ld") or {},
            "page_title": merged.get("page_title"),
            "page_description": merged.get("page_description"),
            "page_keywords": merged.get("page_keywords") or [],
            "city_guide": merged.get("city_guide"),
            "currency": merged.get("currency") or "USD",
            "tips_content": merged.get("tips_content"),
            "circuit_map_src": merged.get("circuit_map_src")
        }

    def _call_json(self, prompt: str) -> dict[str, Any]:
        text = call_claude(prompt, self.agent)
        return self._extract_json_object(text)

    @staticmethod
    def _extract_json_object(text: str) -> dict[str, Any]:
        raw = text.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```(?:json)?", "", raw).strip()
            raw = re.sub(r"```$", "", raw).strip()
        try:
            parsed = json.loads(raw)
            return parsed if isinstance(parsed, dict) else {}
        except Exception:
            pass

        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            return {}
        try:
            parsed = json.loads(match.group(0))
            return parsed if isinstance(parsed, dict) else {}
        except Exception:
            return {}
