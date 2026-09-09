from functools import lru_cache
from typing import Any

from .config import get_settings

SAFETY_TERMS = {
    "spark", "sparking", "shock", "electric shock", "exposed wire", "exposed wiring",
    "gas leak", "gas leakage", "fire", "smoke", "burning smell", "dangerous", "hazard"
}

CATEGORY_TERMS = {
    "hostel": {"hostel", "room", "bathroom", "water supply", "mess", "laundry"},
    "student-welfare": {"counsel", "mental health", "scholarship", "harassment", "welfare", "disability"},
    "transport": {"bus", "shuttle", "driver", "parking", "ev charging", "bicycle"},
    "college-campus": {"classroom", "projector", "auditorium", "library", "locker", "elevator", "fountain"},
    "food-canteen": {"food", "canteen", "mess", "hygiene", "billing", "dietary"},
    "safety-security": {"cctv", "security", "theft", "trespass", "gate", "fire extinguisher", "ragging", "bullying"},
    "cleanliness-sanitation": {"garbage", "washroom", "cleaning", "stagnant water", "mosquito", "litter", "sanitation"},
    "infrastructure-maintenance": {"electrical", "power outage", "plumbing", "leakage", "pipe", "ceiling", "wall", "window", "door", "pothole", "generator"},
    "academic": {"timetable", "exam", "attendance", "grading", "course material", "transcript", "faculty", "academic"},
    "substance-concern": {"substance", "smoking", "smuggling", "rehabilitation", "de-addiction"},
    "other": set(),
}


@lru_cache
def get_embedder():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer(get_settings().embedding_model)


def make_embedding(text: str) -> list[float]:
    vector = get_embedder().encode(text, normalize_embeddings=True)
    return vector.tolist()


def analyze_text(title: str, description: str, location: str | None = None) -> dict[str, Any]:
    text = " ".join(x for x in [title, description, location or ""] if x).lower()
    safety = sorted(term for term in SAFETY_TERMS if term in text)
    scores = {key: sum(1 for term in terms if term in text) for key, terms in CATEGORY_TERMS.items()}
    category_key = max(scores, key=scores.get) if max(scores.values(), default=0) else "other"

    if safety:
        severity, priority, risk = "CRITICAL", "CRITICAL", min(100, 75 + len(safety) * 5)
    elif any(x in text for x in ["not working", "no water", "outage", "broken", "leak", "cannot"]):
        severity, priority, risk = "HIGH", "HIGH", 65
    elif any(x in text for x in ["slow", "noise", "delay", "crowd"]):
        severity, priority, risk = "MEDIUM", "MEDIUM", 40
    else:
        severity, priority, risk = "LOW", "LOW", 20

    return {
        "category_key": category_key,
        "severity": severity,
        "priority": priority,
        "risk_score": risk,
        "risk_signals": safety,
        "reasoning": "Safety rule override applied." if safety else "Priority estimated from complaint signals; replace the classifier with a trained campus model when training data is available.",
        "summary": f"Complaint classified as {category_key} with {severity.lower()} severity.",
    }
