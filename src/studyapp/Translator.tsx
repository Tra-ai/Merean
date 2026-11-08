import { useState } from "react";
import { createPortal } from "react-dom";

const LANGS: { code: string; label: string }[] = [
  { code: "km", label: "ខ្មែរ" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "th", label: "ไทย" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "fr", label: "Français" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
];

export default function Translator({ onClose }: { onClose: () => void }) {
  const [from, setFrom] = useState("en");
  const [to, setTo] = useState("km");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function run() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from, to }),
      });
      const data = await response.json();
      if (!response.ok || typeof data.text !== "string") throw new Error("failed");
      setResult(data.text);
    } catch {
      setError("មិនអាចបកប្រែបានទេ សូមព្យាយាមម្តងទៀត");
    } finally {
      setLoading(false);
    }
  }

  function swap() {
    setFrom(to);
    setTo(from);
    if (result) { setText(result); setResult(""); }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard not available */ }
  }

  const select = "min-w-0 flex-1 rounded-xl bg-white px-3 py-2.5 text-[14px] font-medium text-ink-900 outline-none ring-1 ring-black/10";

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-[#b98b5e]" role="dialog" aria-label="បកប្រែ">
      <div className="mx-auto flex h-full max-w-[430px] flex-col">
        <div className="flex items-center justify-between border-b border-black/10 bg-white/75 px-4 py-3 backdrop-blur-xl">
          <h1 className="text-[17px] font-semibold text-ink-900">🌐 បកប្រែ</h1>
          <button onClick={onClose} aria-label="បិទ" className="rounded-full px-3 py-1 text-[14px] font-medium text-TRA-600 active:bg-black/5">រួចរាល់</button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <select className={select} value={from} onChange={(e) => setFrom(e.target.value)} aria-label="ពីភាសា">
              {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            <button onClick={swap} aria-label="ប្តូរភាសា" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[18px] ring-1 ring-black/10 active:bg-black/5">⇄</button>
            <select className={select} value={to} onChange={(e) => setTo(e.target.value)} aria-label="ទៅភាសា">
              {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>

          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 2000))}
              placeholder="វាយអក្សរនៅទីនេះ..."
              rows={6}
              className="block w-full resize-none bg-transparent text-[16px] leading-[1.8] text-ink-900 outline-none placeholder:text-ink-300"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-ink-400">
              <span>{text.length}/2000</span>
              {text && <button onClick={() => { setText(""); setResult(""); setError(""); }} className="px-2 py-1 text-TRA-600">សម្អាត</button>}
            </div>
          </div>

          <button
            onClick={run}
            disabled={!text.trim() || loading}
            className="w-full rounded-full bg-TRA-500 py-3 text-[16px] font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "កំពុងបកប្រែ..." : "បកប្រែ"}
          </button>

          {error && <div className="rounded-xl bg-white px-4 py-3 text-[13px] text-busr-600" role="alert">{error}</div>}

          {result && (
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="whitespace-pre-wrap break-words text-[16px] leading-[1.8] text-ink-900">{result}</div>
              <div className="mt-1 flex justify-end">
                <button onClick={copy} className="px-2 py-1 text-[13px] font-medium text-TRA-600">{copied ? "បានចម្លង ✓" : "ចម្លង"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
