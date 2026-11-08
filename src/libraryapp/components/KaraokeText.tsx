import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';

interface Props {
  text: string;
  /** [start, end] in seconds for every sentence, in reading order */
  sentences: [number, number][];
  audioRef: RefObject<HTMLAudioElement | null>;
}

interface Word { start: number; end: number }
type Piece = { text: string; word: number | null };

// Same sentence splitting as scripts/make-timings.py
function build(text: string, sentences: [number, number][]) {
  const segmenter = typeof Intl !== 'undefined' && (Intl as any).Segmenter
    ? new (Intl as any).Segmenter('km', { granularity: 'word' })
    : null;
  const words: Word[] = [];
  const paragraphs: Piece[][] = [];
  let sentenceIndex = 0;

  for (const paragraph of text.split(/\n+/)) {
    if (!paragraph.trim()) continue;
    const pieces: Piece[] = [];
    for (const sentence of paragraph.split(/(?<=។)/)) {
      if (!sentence.trim()) continue;
      const times = sentences[sentenceIndex++];
      const parts: string[] = segmenter
        ? Array.from(segmenter.segment(sentence) as Iterable<{ segment: string }>, (item) => item.segment)
        : [sentence];
      const weight = (value: string) => value.replace(/[\s\u200b]/g, '').length;
      const spoken = parts.filter((part) => weight(part) > 0);
      const total = spoken.reduce((sum, part) => sum + weight(part), 0) || 1;
      let used = 0;
      for (const part of parts) {
        if (weight(part) === 0 || !times) {
          pieces.push({ text: part, word: null });
          continue;
        }
        const start = times[0] + (used / total) * (times[1] - times[0]);
        used += weight(part);
        const end = times[0] + (used / total) * (times[1] - times[0]);
        words.push({ start, end });
        pieces.push({ text: part, word: words.length - 1 });
      }
    }
    paragraphs.push(pieces);
  }
  return { words, paragraphs };
}

// Highlight runs this many seconds ahead of the audio clock.
// The reader can fine-tune it with the - / + buttons; it is remembered on this device.
const OFFSET_KEY = 'TRA-karaoke-offset';
const DEFAULT_OFFSET = 2;

function loadOffset() {
  try {
    const value = Number(localStorage.getItem(OFFSET_KEY));
    if (localStorage.getItem(OFFSET_KEY) !== null && Number.isFinite(value)) return Math.min(5, Math.max(-2, value));
  } catch { /* storage unavailable */ }
  return DEFAULT_OFFSET;
}

let lastUserScroll = 0;
if (typeof window !== 'undefined') {
  const mark = () => { lastUserScroll = Date.now(); };
  window.addEventListener('touchstart', mark, { passive: true, capture: true });
  window.addEventListener('wheel', mark, { passive: true, capture: true });
}

export default function KaraokeText({ text, sentences, audioRef }: Props) {
  const { words, paragraphs } = useMemo(() => build(text, sentences), [text, sentences]);
  const elements = useRef<(HTMLSpanElement | null)[]>([]);
  const [offset, setOffset] = useState(loadOffset);
  const offsetRef = useRef(offset);

  function adjust(delta: number) {
    const next = Math.round(Math.min(5, Math.max(-2, offset + delta)) * 100) / 100;
    offsetRef.current = next;
    setOffset(next);
    try { localStorage.setItem(OFFSET_KEY, String(next)); } catch { /* ignore */ }
    const audio = audioRef.current;
    if (audio) audio.dispatchEvent(new Event('seeked'));
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let frame = 0;
    let current = -1;

    function find(time: number) {
      if (!words.length || time < words[0].start) return -1;
      let low = 0;
      let high = words.length - 1;
      while (low < high) {
        const mid = (low + high + 1) >> 1;
        if (words[mid].start <= time) low = mid; else high = mid - 1;
      }
      return audio && audio.ended ? -1 : low;
    }

    function update(follow: boolean) {
      if (!audio) return;
      const next = find(audio.currentTime + offsetRef.current);
      if (next === current) return;
      if (current >= 0) elements.current[current]?.classList.remove('kw-active');
      current = next;
      const element = next >= 0 ? elements.current[next] : null;
      if (!element) return;
      element.classList.add('kw-active');
      if (follow && Date.now() - lastUserScroll > 5000) {
        const rect = element.getBoundingClientRect();
        if (rect.top < 120 || rect.bottom > window.innerHeight - 140) {
          element.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }
    }

    const tick = () => { update(true); frame = requestAnimationFrame(tick); };
    const onPlay = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(tick); };
    const onStop = () => { cancelAnimationFrame(frame); update(false); };
    const onSeek = () => update(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('playing', onPlay);
    audio.addEventListener('pause', onStop);
    audio.addEventListener('ended', onStop);
    audio.addEventListener('seeked', onSeek);
    audio.addEventListener('timeupdate', onSeek);
    if (!audio.paused) onPlay();
    return () => {
      cancelAnimationFrame(frame);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('playing', onPlay);
      audio.removeEventListener('pause', onStop);
      audio.removeEventListener('ended', onStop);
      audio.removeEventListener('seeked', onSeek);
      audio.removeEventListener('timeupdate', onSeek);
    };
  }, [words, audioRef]);

  function jump(index: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, words[index].start - offsetRef.current);
    void audio.play().catch(() => undefined);
  }

  const btn: CSSProperties = { width: 34, height: 34, borderRadius: 999, border: '1px solid rgba(0,0,0,.15)', background: '#fff', fontSize: 18, lineHeight: 1 };
  return <div className="kw-text">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: 10, fontSize: 13, color: '#6b6b70' }}>
      <span>កែសម្រួលសំឡេង/អក្សរ</span>
      <button type="button" style={btn} onClick={() => adjust(-0.25)} aria-label="អក្សរយឺតជាងមុន">−</button>
      <span style={{ minWidth: 44, textAlign: 'center' }}>{offset.toFixed(2)}s</span>
      <button type="button" style={btn} onClick={() => adjust(0.25)} aria-label="អក្សរលឿនជាងមុន">+</button>
    </div>
    {paragraphs.map((pieces, paragraphIndex) => <p key={paragraphIndex}>
      {pieces.map((piece, pieceIndex) => piece.word === null
        ? piece.text
        : <span
          key={pieceIndex}
          ref={(element) => { elements.current[piece.word as number] = element; }}
          className="kw-word"
          onClick={() => jump(piece.word as number)}
        >{piece.text}</span>)}
    </p>)}
  </div>;
}
