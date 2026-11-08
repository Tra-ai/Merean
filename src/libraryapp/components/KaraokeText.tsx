import { useEffect, useMemo, useRef, type RefObject } from 'react';

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

let lastUserScroll = 0;
if (typeof window !== 'undefined') {
  const mark = () => { lastUserScroll = Date.now(); };
  window.addEventListener('touchstart', mark, { passive: true, capture: true });
  window.addEventListener('wheel', mark, { passive: true, capture: true });
}

export default function KaraokeText({ text, sentences, audioRef }: Props) {
  const { words, paragraphs } = useMemo(() => build(text, sentences), [text, sentences]);
  const elements = useRef<(HTMLSpanElement | null)[]>([]);

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
      const next = find(audio.currentTime);
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
    audio.currentTime = words[index].start;
    void audio.play().catch(() => undefined);
  }

  return <div className="kw-text">
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
