import { useState } from "react";
import { createPortal } from "react-dom";

interface Entry { pos: string; km: string; en: string; example: string }
interface Result { word: string; pronunciation: string; entries: Entry[] }

export default function Dictionary({ onClose }: { onClose: () => void }) {
  const [word, setWord] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search() {
    const q = word.trim();
    if (!q || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: q }),
      });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.entries)) throw new Error("failed");
      setResult(data as Result);
    } catch {
      setError("មិនអាចស្វែងរកបានទេ សូមព្យាយាមម្តងទៀត");
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-[#b98b5e]" role="dialog" aria-label="វចនានុក្រម">
      <div className="mx-auto flex h-full max-w-[430px] flex-col">
        <div className="flex items-center justify-between border-b border-black/10 bg-white/75 px-4 py-3 backdrop-blur-xl">
          <h1 className="text-[17px] font-semibold text-ink-900">📖 វចនានុក្រម</h1>
          <button onClick={onClose} aria-label="បិទ" className="rounded-full px-3 py-1 text-[14px] font-medium text-TRA-600 active:bg-black/5">រួចរាល់</button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <form
            onSubmit={(e) => { e.preventDefault(); void search(); }}
            className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-sm"
          >
            <input
              value={word}
              onChange={(e) => setWord(e.target.value.slice(0, 80))}
              placeholder="វាយពាក្យខ្មែរ ឬ English..."
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-[16px] text-ink-900 outline-none placeholder:text-ink-300"
            />
            {word && <button type="button" onClick={() => { setWord(""); setResult(null); setError(""); }} aria-label="សម្អាត" className="px-2 text-[18px] text-ink-400">×</button>}
            <button type="submit" disabled={!word.trim() || loading} className="rounded-full bg-TRA-500 px-4 py-2 text-[14px] font-semibold text-white disabled:opacity-50">
              {loading ? "..." : "ស្វែងរក"}
            </button>
          </form>

          {error && <div className="rounded-xl bg-white px-4 py-3 text-[13px] text-busr-600" role="alert">{error}</div>}

          {result && result.entries.length === 0 && (
            <div className="rounded-2xl bg-white px-4 py-5 text-center text-[14px] text-ink-500">រកមិនឃើញពាក្យ «{word.trim()}» ទេ</div>
          )}

          {result && result.entries.length > 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h2 className="text-[22px] font-bold leading-[1.6] text-ink-900">{result.word}</h2>
                {result.pronunciation && <span className="text-[14px] text-ink-400">/{result.pronunciation}/</span>}
              </div>
              <ol className="mt-2 space-y-4">
                {result.entries.map((entry, i) => (
                  <li key={i} className="border-t border-black/10 pt-3 first:border-0 first:pt-0">
                    {entry.pos && <span className="inline-block rounded-full bg-TRA-50 px-2.5 py-0.5 text-[12px] font-medium text-TRA-600">{entry.pos}</span>}
                    {entry.en && <div className="mt-1 text-[15px] font-semibold leading-[1.7] text-ink-900">{entry.en}</div>}
                    {entry.km && <div className="text-[15px] leading-[1.8] text-ink-900">{entry.km}</div>}
                    {entry.example && <div className="mt-1 text-[14px] italic leading-[1.8] text-ink-500">“{entry.example}”</div>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
