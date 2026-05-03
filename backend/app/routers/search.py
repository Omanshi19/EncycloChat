from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
import httpx, json
from .auth import get_current_user

router = APIRouter()

@router.get("/web")
async def web_search(q: str, user=Depends(get_current_user)):
    """Search using DuckDuckGo Instant Answer API (no key required)"""
    try:
        async with httpx.AsyncClient(timeout=10, headers={"User-Agent": "MyWebUI/1.0"}) as client:
            resp = await client.get(
                "https://api.duckduckgo.com/",
                params={"q": q, "format": "json", "no_redirect": "1", "no_html": "1"}
            )
            data = resp.json()

        results = []
        if data.get("AbstractText"):
            results.append({
                "title": data.get("Heading", q),
                "snippet": data["AbstractText"],
                "url": data.get("AbstractURL", "")
            })

        for topic in data.get("RelatedTopics", [])[:5]:
            if isinstance(topic, dict) and "Text" in topic:
                results.append({
                    "title": topic.get("Text", "")[:80],
                    "snippet": topic.get("Text", ""),
                    "url": topic.get("FirstURL", "")
                })

        return {"query": q, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
