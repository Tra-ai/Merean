// Vercel serverless function: POST /api/dictionary  { word, page? }
//   -> { mode: "km" | "en", query, total, page, totalPages, results: [{ id, word, definition, short }] }
// Uses the Tra Khmer Dictionary API (https://tra-api-v1.vercel.app/api).
// Set TRA_API_TOKEN in Vercel (Settings > Environment Variables). The token never reaches the browser.
//
// Data: Khmer Choun Nath Dictionary (Open Institute, LGPL 2.1)
//       (Khmer to Khmer only.)

const BASE = process.env.TRA_API_BASE || "https://tra-api-v1.vercel.app/api";
const MAX = 100;
const LIMIT = 20;
const TTL = 10 * 60 * 1000;
const cache = new Map();

const isKhmer = (text) => /[ក-៿]/.test(text);
const clean = (value) => String(value ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();

const VERSION = 27;

export default async function handler(req, res) {
  // Open /api/dictionary in a browser to check which version is live.
  if (req.method === "GET") {
    res.status(200).json({ ok: true, version: VERSION, mode: "khmer-only", tokenSet: Boolean(process.env.TRA_API_TOKEN) });
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }
  const word = typeof req.body?.word === "string" ? req.body.word.trim().slice(0, MAX) : "";
  const page = Math.min(1000, Math.max(1, Number(req.body?.page) || 1));
  if (!word) {
    res.status(400).json({ error: "Bad request" });
    return;
  }
  const token = process.env.TRA_API_TOKEN;
  if (!token) {
    res.status(503).json({ error: "not_configured" });
    return;
  }

  if (!isKhmer(word)) {
    res.status(400).json({ error: "khmer_only" });
    return;
  }
  const mode = "km";
  const key = `${mode}|${word.toLowerCase()}|${page}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) {
    res.status(200).json(hit.data);
    return;
  }

  try {
    const url = `${BASE}/search?q=${encodeURIComponent(word)}&limit=${LIMIT}&page=${page}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (response.status === 429) {
      res.status(429).json({ error: "rate_limited", retryAfter: Number(response.headers.get("retry-after")) || 30 });
      return;
    }
    if (response.status === 404) {
      res.status(200).json({ mode, query: word, total: 0, page, totalPages: 0, results: [] });
      return;
    }
    if (response.status === 401 || response.status === 403) {
      res.status(502).json({ error: "token_rejected" });
      return;
    }
    if (!response.ok) {
      res.status(502).json({ error: "lookup_failed" });
      return;
    }
    const raw = await response.json();
    const data = {
      mode,
      query: word,
      total: Number(raw.total) || 0,
      page: Number(raw.page) || page,
      totalPages: Number(raw.totalPages) || 0,
      results: (Array.isArray(raw.results) ? raw.results : []).map((r) => ({
        id: String(r.id ?? ""),
        word: clean(r.word),
        definition: clean(r.definition),
        short: clean(r.short),
      })),
    };
    if (cache.size > 500) cache.delete(cache.keys().next().value);
    cache.set(key, { at: Date.now(), data });
    res.status(200).json(data);
  } catch {
    res.status(502).json({ error: "lookup_failed" });
  }
}
