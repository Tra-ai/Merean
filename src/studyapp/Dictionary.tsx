import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Item { id: string; word: string; definition: string; short: string }
interface Data { mode: "km" | "en"; query: string; total: number; page: number; totalPages: number; results: Item[] }

const MESSAGES: Record<string, string> = {
  not_configured: "វចនានុក្រមមិនទាន់ត្រូវបានតំឡើង (ខ្វះ TRA_API_TOKEN)",
  token_rejected: "Token របស់វចនានុក្រមមិនត្រឹមត្រូវ ឬផុតកំណត់",
  khmer_only: "សូមវាយពាក្យជាអក្សរខ្មែរ",
  rate_limited: "ស្វែងរកញឹកញាប់ពេក សូមរង់ចាំបន្តិច",
};

export default function Dictionary({ onClose }: { onClose: () => void }) {
  const [word, setWord] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reqId = useRef(0);

  async function load(q: string, page: number) {
    const id = ++reqId.current;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: q, page }),
      });
      const json = await response.json();
      if (id !== reqId.current) return;
      if (!response.ok || !Array.isArray(json.results)) {
        const wait = json?.retryAfter ? ` (${json.retryAfter} វិនាទី)` : "";
        setError((MESSAGES[json?.error] ?? "មិនអាចស្វែងរកបានទេ សូមព្យាយាមម្តងទៀត") + (json?.error === "rate_limited" ? wait : ""));
        return;
      }
      const next = json as Data;
      setData(next);
      setItems((cur) => (page === 1 ? next.results : [...cur, ...next.results]));
      if (page === 1) setOpen(next.results.length === 1 ? next.results[0].id : null);
    } catch {
      if (id === reqId.current) setError("មិនអាចស្វែងរកបានទេ សូមព្យាយាមម្តងទៀត");
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }

  function search() {
    const q = word.trim();
    if (q) void load(q, 1);
  }

  // Search by itself shortly after typing stops.
  useEffect(() => {
    const q = word.trim();
    if (!q) {
      reqId.current++;
      setData(null);
      setItems([]);
      setError("");
      setLoading(false);
      return;
    }
    const timer = window.setTimeout(() => { void load(q, 1); }, 450);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);

  const more = data && data.page < data.totalPages;

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-[#b98b5e]" role="dialog" aria-label="វចនានុក្រម">
      <div className="mx-auto flex h-full max-w-[430px] flex-col">
        <div className="flex items-center justify-between border-b border-black/10 bg-white/75 px-4 py-3 backdrop-blur-xl">
          <h1 className="text-[17px] font-semibold text-ink-900">📖 វចនានុក្រម</h1>
          <button onClick={onClose} aria-label="បិទ" className="rounded-full px-3 py-1 text-[14px] font-medium text-TRA-600 active:bg-black/5">រួចរាល់</button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <form onSubmit={(e) => { e.preventDefault(); search(); }} className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-sm">
            <input
              value={word}
              onChange={(e) => setWord(e.target.value.slice(0, 100))}
              placeholder="វាយពាក្យខ្មែរ..."
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-[16px] text-ink-900 outline-none placeholder:text-ink-300"
            />
            {word && <button type="button" onClick={() => { setWord(""); setData(null); setItems([]); setError(""); }} aria-label="សម្អាត" className="px-2 text-[18px] text-ink-400">×</button>}
            <button type="submit" disabled={!word.trim()} className="rounded-full bg-TRA-500 px-4 py-2 text-[14px] font-semibold text-white disabled:opacity-50">
              {loading && items.length === 0 ? "..." : "ស្វែងរក"}
            </button>
          </form>

          {error && <div className="rounded-xl bg-white px-4 py-3 text-[13px] text-busr-600" role="alert">{error}</div>}

          {data && items.length === 0 && (
            <div className="rounded-2xl bg-white px-4 py-5 text-center text-[14px] text-ink-500">រកមិនឃើញពាក្យ «{data.query}» ទេ</div>
          )}

          {data && items.length > 0 && (
            <>
              <div className="px-1 text-[12px] text-ink-900/70">
                ន័យពាក្យខ្មែរ · រកឃើញ {data.total.toLocaleString()}
              </div>
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                {items.map((item, i) => {
                  const expanded = open === item.id;
                  const preview = item.short || item.definition;
                  return (
                    <button
                      key={`${item.id}-${i}`}
                      onClick={() => setOpen(expanded ? null : item.id)}
                      aria-expanded={expanded}
                      className={"block w-full px-4 py-3 text-left active:bg-black/5" + (i > 0 ? " border-t border-black/10" : "")}
                    >
                      <div className="text-[17px] font-bold leading-[1.7] text-ink-900">{item.word}</div>
                      <div className={"whitespace-pre-wrap break-words text-[14px] leading-[1.8] text-ink-500" + (expanded ? "" : " line-clamp-2")}>
                        {expanded ? item.definition || preview : preview}
                      </div>
                    </button>
                  );
                })}
              </div>
              {more && (
                <button
                  onClick={() => void load(data.query, data.page + 1)}
                  disabled={loading}
                  className="w-full rounded-full bg-white py-3 text-[14px] font-semibold text-TRA-600 shadow-sm disabled:opacity-50"
                >
                  {loading ? "កំពុងផ្ទុក..." : "បង្ហាញបន្ថែម"}
                </button>
              )}
            </>
          )}

          <p className="px-2 pt-2 text-center text-[10.5px] leading-[1.7] text-ink-900/60">
            ប្រភព៖ វចនានុក្រមខ្មែរ ជួន ណាត (Open Institute, LGPL 2.1) · v27
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
