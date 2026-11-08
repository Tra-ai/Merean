import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { BookOpen, ChevronLeft, Headphones, Lightbulb, Pencil, Play, RotateCcw, UserRound } from 'lucide-react';
import Dialog from './Dialog';
import KaraokeText from './KaraokeText';
import labels from '../data/labels.json';
import type { Story, StoryContent } from '../types';

let contentRequest: Promise<Record<string, StoryContent>> | null = null;

function loadStories() {
  if (!contentRequest) {
    contentRequest = fetch('/data/stories.json').then((response) => {
      if (!response.ok) throw new Error('Unable to load stories');
      return response.json() as Promise<Record<string, StoryContent>>;
    }).catch((error: unknown) => {
      contentRequest = null;
      throw error;
    });
  }
  return contentRequest;
}

let timingsRequest: Promise<Record<string, { sentences: [number, number][] }>> | null = null;

function loadTimings() {
  if (!timingsRequest) {
    timingsRequest = fetch('/data/timings.json').then((response) => {
      if (!response.ok) return {};
      return response.json() as Promise<Record<string, { sentences: [number, number][] }>>;
    }).catch(() => ({}));
  }
  return timingsRequest;
}

export default function Reader({ story, onClose }: { story: Story; onClose: () => void }) {
  const [content, setContent] = useState<StoryContent | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [audioCode, setAudioCode] = useState(0);
  const [timings, setTimings] = useState<[number, number][] | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabIcons = [Pencil, UserRound, BookOpen, Lightbulb];

  useEffect(() => {
    let current = true;
    setContent(null);
    setError(false);
    setActiveTab(0);
    setAudioError(false);
    setTimings(null);
    loadTimings().then((all) => { if (current) setTimings(all[story.id]?.sentences ?? null); });
    loadStories().then((stories) => {
      if (current) {
        if (!stories[story.id]) setError(true);
        else setContent(stories[story.id]);
      }
    }).catch(() => { if (current) setError(true); });
    return () => { current = false; };
  }, [story.id, attempt]);

  function moveTab(event: KeyboardEvent, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % 4;
    else if (event.key === 'ArrowLeft') next = (index + 3) % 4;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 3;
    else return;
    event.preventDefault();
    setActiveTab(next);
    tabRefs.current[next]?.focus();
  }

  const historyLines = content?.tabs[2].text.split(/\n+/).map((line) => line.trim()).filter(Boolean) || [];

  return (
    <Dialog title={story.title} onClose={onClose} className="reader-modal">
      <div className="reader-scroll">
        <button className="reader-breadcrumb" onClick={onClose} aria-label="Back to library">
          <ChevronLeft size={17} /><span>{story.title}</span>
        </button>
        {error ? <div className="reader-loading" role="alert">
          <BookOpen size={32} />
          <p>This story could not be loaded. Please try again.</p>
          <button className="button button-primary" onClick={() => setAttempt(attempt + 1)}><RotateCcw size={16} />Retry</button>
        </div> : !content ? <div className="reader-loading" role="status"><span className="loading-spinner" /><span>Loading story...</span></div> : <>
          {content.audio && <section className="audio-card" aria-label="Story audio">
            <div className="audio-heading">
              <span className="headphone-icon"><Headphones size={22} strokeWidth={2} /></span>
              <div><h3>{labels.listen}</h3><p><Play size={10} fill="currentColor" />{labels.listenHint}</p></div>
            </div>
            <audio ref={audioRef} src={content.audio} controls preload="metadata" controlsList="nodownload" aria-label={`Listen to ${story.title}`} onError={() => { setAudioCode(audioRef.current?.error?.code ?? 0); setAudioError(true); }} onCanPlay={() => setAudioError(false)} />
            {audioError && <div className="audio-error" role="alert">មិនអាចផ្ទុកសំឡេងបានទេ (កូដ {audioCode})<button onClick={() => { setAudioError(false); audioRef.current?.load(); }}>សាកម្ដងទៀត</button></div>}
          </section>}
          <div className="reader-tabs" role="tablist" aria-label="Story sections">
            {content.tabs.map((tab, index) => {
              const Icon = tabIcons[index];
              return <button ref={(element) => { tabRefs.current[index] = element; }} key={tab.label} role="tab" id={`reader-tab-${index}`} aria-controls={`reader-panel-${index}`} aria-selected={activeTab === index} tabIndex={activeTab === index ? 0 : -1} className={activeTab === index ? 'active' : ''} onClick={() => setActiveTab(index)} onKeyDown={(event) => moveTab(event, index)}><Icon size={20} strokeWidth={1.8} /><span>{tab.label}</span></button>;
            })}
          </div>
          {content.tabs.map((tab, index) => <article key={index} className="reader-prose" role="tabpanel" id={`reader-panel-${index}`} aria-labelledby={`reader-tab-${index}`} tabIndex={0} hidden={activeTab !== index}>
            {index === 0 && content.audio && timings ? <KaraokeText text={tab.text} sentences={timings} audioRef={audioRef} /> : index === 2 ? <dl className="history-records">
              {historyLines.filter((_, index) => index % 2 === 0).map((label, index) => <div key={`${label}-${index}`}><dt>{label}</dt><dd>{historyLines[index * 2 + 1]}</dd></div>)}
            </dl> :
              /* The bundled public content is sanitized with a strict tag allowlist. */
              <div dangerouslySetInnerHTML={{ __html: tab.html }} />}
          </article>)}
        </>}
      </div>
    </Dialog>
  );
}