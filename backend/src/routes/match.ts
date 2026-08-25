import { Router, type IRouter } from "express";
import { getLawyers } from "../data/store";

const router: IRouter = Router();

router.post("/match", async (req, res): Promise<void> => {
  const { query, city, budget, language } = req.body as { query?: string; city?: string; budget?: number; language?: string };
  if (!query || typeof query !== "string" || query.trim().length < 5) {
    res.status(400).json({ error: "invalid_payload", message: "query (case description, >=5 chars) is required" });
    return;
  }
  const lawyers = await getLawyers();
  const visible = lawyers.filter((l) => (l as unknown as { visibility?: string }).visibility !== "private");
  // Simple fallback ranking if Gemini not configured
  const apiKey = process.env.GEMINI_API_KEY?.replace(/^"(.*)"$/, "$1").trim();
  const model = (process.env.GEMINI_MODEL ?? "gemini-3.6-flash").replace(/^"(.*)"$/, "$1").trim().replace("gemini-1.5-flash", "gemini-3.6-flash").replace("gemini-2.5-flash", "gemini-3.6-flash");

  // Lightweight keyword fallback if no key
  if (!apiKey) {
    const q = query.toLowerCase();
    const ranked = [...visible]
      .map((l) => {
        let score = 0;
        const specs = (l.specializations ?? []).join(" ").toLowerCase();
        if (specs.includes(q.split(" ")[0])) score += 2;
        if (city && l.city?.toLowerCase() === city.toLowerCase()) score += 2;
        if (language && l.languages?.some((x: string) => x.toLowerCase() === language.toLowerCase())) score += 1;
        if (budget && l.consultationFee <= budget) score += 1;
        score += (l.rating ?? 0) * 0.5;
        return { lawyer: l, score, reason: `Matched on ${l.primarySpecialization || l.specializations[0] || "general"} • ${l.city} • ₹${l.consultationFee}` };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r) => ({ lawyer: r.lawyer, reason: r.reason }));
    res.json({ matches: ranked, fallback: true });
    return;
  }

  // Gemini ranking
  const list = visible.slice(0, 30).map((l) => ({
    id: l.id,
    name: l.name,
    city: l.city,
    specs: l.specializations,
    fee: l.consultationFee,
    rating: l.rating,
    exp: l.experience,
    langs: l.languages,
  }));
  const prompt = `You are NyayaConnect matcher. Query: "${query}"${city ? `, City: ${city}` : ""}${budget ? `, Budget: ₹${budget}` : ""}${language ? `, Language: ${language}` : ""}\nRank these lawyers by best fit (case relevance > city > budget > rating). Return JSON array of up to 3 objects with {id, reason: short bullet 5-10 words}. Lawyers:\n${JSON.stringify(list, null, 2)}\nReturn ONLY JSON array, no markdown.`;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 800 } }),
    });
    const data = (await r.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    let ids: string[] = [];
    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      if (Array.isArray(parsed)) ids = parsed.map((x: { id?: string }) => String(x.id ?? "")).filter(Boolean);
    } catch {
      // fallback to keyword
    }
    const byId = new Map(visible.map((l) => [l.id, l]));
    const matches = (ids.length ? ids : visible.slice(0, 3).map((l) => l.id))
      .map((id) => byId.get(id))
      .filter(Boolean)
      .slice(0, 3)
      .map((lawyer) => {
        let parsed: Array<{ id: string; reason?: string }> = [];
        try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { /* already handled above */ }
        const found = Array.isArray(parsed) ? parsed.find((x) => x.id === (lawyer as { id: string }).id) : undefined;
        return { lawyer, reason: found?.reason ?? `Top match for "${query.slice(0, 40)}"` };
      });
    // if parsing failed, fallback
    if (matches.length === 0) throw new Error("parse failed");
    res.json({ matches });
  } catch {
    // final fallback
    const ranked = [...visible].sort((a, b) => b.rating - a.rating).slice(0, 3).map((l) => ({ lawyer: l, reason: `Highly rated • ${l.city}` }));
    res.json({ matches: ranked, fallback: true });
  }
});

export default router;
