import { useEffect, useMemo, useRef, useState } from "react";
import { BOOKS, CATEGORIES, bookById, catById, fmt } from "../data";
import type { Book } from "../data";
import { useStore } from "../store";
import { BookCover, Chip, DetailHeader, EmptyState, Icon, SectionTitle, TopBar } from "../ui";
import { cn } from "../utils/cn";

/* ---------------- Library ---------------- */

export function BooksScreen() {
  const s = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState<"popular" | "az" | "short">("popular");

  const list = useMemo(() => {
    let l = BOOKS.filter((b) => (cat === "all" || b.cat === cat) && (q.trim() === "" || (b.title + b.author).toLowerCase().includes(q.trim().toLowerCase())));
    if (sort === "popular") l = [...l].sort((a, b) => b.views - a.views);
    if (sort === "az") l = [...l].sort((a, b) => a.title.localeCompare(b.title, "km"));
    if (sort === "short") l = [...l].sort((a, b) => a.minutes - b.minutes);
    return l;
  }, [q, cat, sort]);

  const open = (b: Book) => {
    s.bumpView(`book:${b.id}`);
    s.push({ name: "book", id: b.id });
  };

  return (
    <div className="animate-fade-up pb-6">
      <TopBar onSearch={() => s.push({ name: "search" })} onBell={() => s.toast("សៀវភៅថ្មី ២ ក្បាលនឹងមកដល់សប្តាហ៍ក្រោយ 📚", "🔔")} />
      <div className="px-4 pt-3">
        <h1 className="text-[19px] font-bold leading-[1.7]">បណ្ណាល័យសៀវភៅ 📚</h1>
        <p className="text-[11.5px] text-ink-400">សៀវភៅអេឡិចត្រូនិចជាភាសាខ្មែរ · ឥតគិតថ្លៃទាំងអស់</p>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 shadow-sm focus-within:border-TRA-400 focus-within:ring-2 focus-within:ring-TRA-100">
          <Icon name="search" className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ស្វែងរកតាមចំណងជើង ឬអ្នកនិពន្ធ…"
            className="w-full bg-transparent text-[13px] leading-[1.8] outline-none placeholder:text-ink-300"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="សម្អាត" className="tap grid h-5 w-5 place-items-center rounded-full bg-cream text-ink-400">
              <Icon name="x" className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="no-bar mt-3 flex gap-2 overflow-x-auto px-4">
        <Chip active={cat === "all"} onClick={() => setCat("all")}>ទាំងអស់</Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
            {c.emoji} {c.name}
          </Chip>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between px-4">
        <span className="text-[11px] text-ink-400">សៀវភៅ {list.length} ក្បាល</span>
        <div className="flex gap-1 rounded-full bg-cream p-0.5">
          {([["popular", "ពេញនិយម"], ["az", "ក–អ"], ["short", "ខ្លី"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setSort(k)} className={cn("rounded-full px-2.5 py-1 text-[10.5px] transition-colors", sort === k ? "bg-white font-semibold text-TRA-700 shadow-sm" : "text-ink-400")}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon="🔍" title="រកមិនឃើញសៀវភៅ" sub={`គ្មានលទ្ធផលសម្រាប់ «${q}» ទេ។ សាកល្បងពាក្យផ្សេង ឬប្តូរប្រភេទ។`} action="មើលទាំងអស់" onAction={() => { setQ(""); setCat("all"); }} />
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-5 px-4">
          {list.map((b, i) => (
            <button key={b.id} onClick={() => open(b)} className="tap-img animate-fade-up text-left" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
              <BookCover book={b} />
              <div className="mt-1.5 line-clamp-2 text-center text-[11px] leading-[1.7] text-ink-700">{b.title}</div>
              <div className="mt-0.5 flex items-center justify-center gap-1 text-[9px] text-ink-400">
                <Icon name="star" className="h-2.5 w-2.5 text-warn-500" strokeWidth={2.5} /> {b.rating} · {fmt(b.views + (s.extraViews[`book:${b.id}`] || 0))}
              </div>
              {s.progress[b.id] && s.progress[b.id].pct > 0 && (
                <div className="mx-3 mt-1 h-1 overflow-hidden rounded-full bg-TRA-100">
                  <div className="h-full bg-TRA-500" style={{ width: `${s.progress[b.id].pct}%` }} />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Category ---------------- */

export function CategoryScreen({ id }: { id: string }) {
  const s = useStore();
  const cat = catById(id);
  const list = BOOKS.filter((b) => b.cat === id);
  return (
    <div className="animate-slide-in pb-6">
      <DetailHeader title={cat ? `${cat.emoji} ${cat.name}` : "ប្រភេទ"} sub={`សៀវភៅ ${list.length} ក្បាល`} />
      <div className="grid grid-cols-3 gap-x-3 gap-y-5 px-4 pt-4">
        {list.map((b) => (
          <button key={b.id} onClick={() => { s.bumpView(`book:${b.id}`); s.push({ name: "book", id: b.id }); }} className="tap-img text-left">
            <BookCover book={b} />
            <div className="mt-1.5 line-clamp-2 text-center text-[11px] leading-[1.7] text-ink-700">{b.title}</div>
            <div className="text-center text-[9.5px] text-ink-400">{b.author}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Book detail ---------------- */

export function BookDetailScreen({ id }: { id: string }) {
  const s = useStore();
  const book = bookById(id);
  if (!book) return <EmptyState icon="📕" title="រកមិនឃើញសៀវភៅ" sub="សៀវភៅនេះមិនមានទៀតទេ" />;
  const fav = s.favorites.includes(book.id);
  const prog = s.progress[book.id];
  const cat = catById(book.cat);
  const related = BOOKS.filter((b) => b.cat === book.cat && b.id !== book.id).slice(0, 6);

  const start = (chapter: number) => s.push({ name: "reader", id: book.id, chapter });

  return (
    <div className="animate-slide-in pb-8">
      <DetailHeader
        title={book.title}
        sub={book.author}
        right={
          <div className="flex gap-1 pr-2">
            <button
              aria-label="ចែករំលែក"
              onClick={() => s.toast("តំណសៀវភៅត្រូវបានចម្លង ✓", "🔗")}
              className="tap grid h-9 w-9 place-items-center rounded-full bg-TRA-50 text-TRA-700"
            >
              <Icon name="share" className="h-4 w-4" />
            </button>
            <button
              aria-label="រក្សាទុក"
              onClick={() => { s.toggleFavorite(book.id); s.toast(fav ? "បានដកចេញពីចំណាំ" : "បានរក្សាទុកក្នុងចំណាំ", fav ? "💔" : "🔖"); }}
              className={cn("tap grid h-9 w-9 place-items-center rounded-full", fav ? "bg-TRA-500 text-white" : "bg-TRA-50 text-TRA-700")}
            >
              <Icon name="heart" className="h-4 w-4" strokeWidth={fav ? 2.6 : 2} />
            </button>
          </div>
        }
      />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.16]" style={{ background: `linear-gradient(150deg, ${book.accent}, transparent 70%)` }} />
        <div className="relative flex gap-4 px-4 pb-4 pt-5">
          <div className="w-[118px] shrink-0 animate-pop"><BookCover book={book} /></div>
          <div className="min-w-0 flex-1 pt-1">
            <span className="rounded-full px-2 py-0.5 text-[9.5px] font-semibold" style={{ background: `${book.accent}18`, color: book.accent }}>
              {cat?.emoji} {cat?.name}
            </span>
            <h1 className="mt-2 text-[17px] font-bold leading-[1.7] text-ink-900">{book.title}</h1>
            <div className="mt-0.5 text-[12px] text-ink-500">{book.author}</div>
            <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
              <div className="rounded-lg bg-white/80 py-1.5 ring-1 ring-line">
                <div className="flex items-center justify-center gap-0.5 text-[12px] font-bold text-ink-900"><Icon name="star" className="h-3 w-3 text-warn-500" strokeWidth={2.5} />{book.rating}</div>
                <div className="text-[8.5px] text-ink-400">ពិន្ទុ</div>
              </div>
              <div className="rounded-lg bg-white/80 py-1.5 ring-1 ring-line">
                <div className="text-[12px] font-bold text-ink-900">{book.pages}</div>
                <div className="text-[8.5px] text-ink-400">ទំព័រ</div>
              </div>
              <div className="rounded-lg bg-white/80 py-1.5 ring-1 ring-line">
                <div className="text-[12px] font-bold text-ink-900">{book.minutes}′</div>
                <div className="text-[8.5px] text-ink-400">សង្ខេប</div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10.5px] text-ink-400">
              <Icon name="eye" className="h-3 w-3" /> មើល {fmt(book.views + (s.extraViews[`book:${book.id}`] || 0))} ដង
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4">
        {prog && prog.pct > 0 && prog.pct < 100 ? (
          <div className="rounded-xl border border-TRA-200 bg-TRA-50 p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-TRA-800">អានបាន {prog.pct}% · ជំពូកទី {prog.chapter + 1}</span>
              <span className="text-ink-400">{book.chapters.length} ជំពូកសរុប</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-gradient-to-r from-TRA-500 to-TRA-400" style={{ width: `${prog.pct}%` }} />
            </div>
            <button onClick={() => start(prog.chapter)} className="tap mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-TRA-500 py-3 text-[13.5px] font-bold text-white shadow-card">
              <Icon name="play" className="h-4 w-4" /> បន្តការអាន
            </button>
          </div>
        ) : (
          <button onClick={() => start(0)} className="tap flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-bold text-white shadow-card" style={{ background: `linear-gradient(120deg, #ff6b00, #f26522)` }}>
            <Icon name="book" className="h-4 w-4" /> {prog?.pct === 100 ? "អានម្តងទៀត" : "ចាប់ផ្តើមអាន"}
          </button>
        )}
        {prog?.pct === 100 && (
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-ok-500">
            <Icon name="trophy" className="h-3.5 w-3.5" /> អ្នកបានអានចប់សៀវភៅនេះហើយ!
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mt-5 px-4">
        <h2 className="text-[14px] font-semibold leading-[1.9]">អំពីសៀវភៅនេះ</h2>
        <p className="mt-1 text-[13px] leading-[2.05] text-ink-700">{book.desc}</p>
      </div>

      {/* Chapters */}
      <div className="mt-5 px-4">
        <h2 className="text-[14px] font-semibold leading-[1.9]">មាតិកា · {book.chapters.length} ជំពូក</h2>
        <div className="mt-2 overflow-hidden rounded-xl border border-line bg-white">
          {book.chapters.map((c, i) => {
            const done = prog ? (prog.pct === 100 ? true : i < prog.chapter) : false;
            return (
              <button key={i} onClick={() => start(i)} className={cn("tap flex w-full items-center gap-3 px-3.5 py-3 text-left", i > 0 && "border-t border-line/70")}>
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11.5px] font-bold", done ? "bg-ok-100 text-ok-500" : "bg-TRA-100 text-TRA-700")}>
                  {done ? <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.6} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-ink-900">{c.title}</span>
                  <span className="text-[10px] text-ink-400">{c.paras.length} កថាខណ្ឌ{c.quote ? " · សម្រង់សំដី" : ""}</span>
                </span>
                <Icon name="right" className="h-3.5 w-3.5 shrink-0 text-ink-300" />
              </button>
            );
          })}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-6">
          <SectionTitle>សៀវភៅស្រដៀងគ្នា</SectionTitle>
          <div className="no-bar flex gap-3 overflow-x-auto px-4">
            {related.map((b) => (
              <button key={b.id} onClick={() => { s.bumpView(`book:${b.id}`); s.push({ name: "book", id: b.id }); }} className="tap-img w-[96px] shrink-0">
                <BookCover book={b} />
                <div className="mt-1.5 line-clamp-2 text-center text-[10.5px] leading-[1.7] text-ink-700">{b.title}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Reader ---------------- */

export function ReaderScreen({ id, chapter }: { id: string; chapter: number }) {
  const s = useStore();
  const book = bookById(id);
  const [ch, setCh] = useState(chapter);
  const [scrollPct, setScrollPct] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [ch]);

  useEffect(() => {
    if (!book) return;
    const pct = Math.round(((ch + 1) / book.chapters.length) * 100);
    s.setProgress(book.id, { chapter: ch, pct, at: Date.now() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ch, book?.id]);

  if (!book) return <EmptyState icon="📕" title="រកមិនឃើញសៀវភៅ" sub="សៀវភៅនេះមិនមានទៀតទេ" />;
  const c = book.chapters[ch];
  const total = book.chapters.length;

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setScrollPct(max > 0 ? Math.min(100, Math.round((el.scrollTop / max) * 100)) : 100);
  };

  const finish = () => {
    s.setProgress(book.id, { chapter: total - 1, pct: 100, at: Date.now() });
    s.toast("អបអរសាទរ! អ្នកបានអានចប់ 🎉", "🏆");
    s.pop();
  };

  return (
    <div className="flex h-full flex-col bg-paper">
      {/* Reader toolbar */}
      <div className="border-b border-line bg-white/95 backdrop-blur-md">
        <div className="flex items-center gap-1 px-2 py-2">
          <button onClick={s.pop} aria-label="បិទ" className="tap grid h-9 w-9 place-items-center rounded-full text-ink-700">
            <Icon name="x" className="h-4.5 w-4.5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-semibold">{book.title}</div>
            <div className="text-[9.5px] text-ink-400">ជំពូក {ch + 1} / {total} · {Math.round(((ch + 1) / total) * 100)}%</div>
          </div>
          <div className="flex items-center gap-0.5 rounded-full bg-cream px-1 py-0.5">
            <button aria-label="បង្រួមអក្សរ" onClick={() => s.setReaderFont(s.readerFont - 1)} className="tap grid h-7 w-7 place-items-center rounded-full text-ink-500">
              <Icon name="minus" className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[26px] text-center text-[10.5px] font-bold text-ink-700">{s.readerFont}</span>
            <button aria-label="ពង្រីកអក្សរ" onClick={() => s.setReaderFont(s.readerFont + 1)} className="tap grid h-7 w-7 place-items-center rounded-full text-ink-500">
              <Icon name="plus" className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            aria-label="ចំណាំ"
            onClick={() => { s.toggleFavorite(book.id); s.toast(s.favorites.includes(book.id) ? "បានដកចេញពីចំណាំ" : "បានរក្សាទុកក្នុងចំណាំ", "🔖"); }}
            className={cn("tap grid h-9 w-9 place-items-center rounded-full", s.favorites.includes(book.id) ? "bg-TRA-500 text-white" : "bg-TRA-50 text-TRA-700")}
          >
            <Icon name="heart" className="h-4 w-4" />
          </button>
        </div>
        <div className="h-[3px] bg-TRA-100">
          <div className="h-full bg-gradient-to-r from-TRA-600 to-TRA-400 transition-all duration-200" style={{ width: `${((ch + scrollPct / 100) / total) * 100}%` }} />
        </div>
      </div>

      {/* Page */}
      <div ref={scrollRef} onScroll={onScroll} className="TRA-scroll flex-1 overflow-y-auto overscroll-contain">
        <div key={ch} className="animate-fade-up mx-auto max-w-[560px] px-5 pb-10 pt-6">
          <div className="mb-1 text-[10.5px] font-semibold tracking-[0.16em] text-TRA-600">{book.author}</div>
          <h1 className="text-[19px] font-bold leading-[1.8] text-ink-900">{c.title}</h1>
          <div className="mb-6 mt-3 h-[3px] w-14 rounded-full bg-TRA-500" />
          <div className="khmer-reader text-ink-700" style={{ fontSize: s.readerFont }}>
            {c.paras.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {c.quote && (
              <blockquote>
                <div className="q-bubble" style={{ fontSize: s.readerFont }}>{c.quote.text}</div>
                {c.quote.by && <div className="q-by">— {c.quote.by}</div>}
              </blockquote>
            )}
          </div>
          <hr className="my-7 border-line" />
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setCh((v) => Math.max(0, v - 1))}
              disabled={ch === 0}
              className={cn("tap flex items-center gap-1 rounded-full border px-4 py-2.5 text-[12px] font-semibold", ch === 0 ? "border-line text-ink-300" : "border-TRA-300 bg-white text-TRA-700")}
            >
              <Icon name="back" className="h-3.5 w-3.5" /> មុន
            </button>
            <div className="flex gap-1.5">
              {book.chapters.map((_, i) => (
                <button key={i} aria-label={`ជំពូក ${i + 1}`} onClick={() => setCh(i)} className={cn("h-2 rounded-full transition-all", i === ch ? "w-5 bg-TRA-500" : "w-2 bg-TRA-200")} />
              ))}
            </div>
            {ch < total - 1 ? (
              <button onClick={() => setCh((v) => v + 1)} className="tap flex items-center gap-1 rounded-full bg-TRA-500 px-4 py-2.5 text-[12px] font-semibold text-white shadow-card">
                បន្ទាប់ <Icon name="right" className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button onClick={finish} className="tap flex items-center gap-1 rounded-full bg-ok-500 px-4 py-2.5 text-[12px] font-semibold text-white shadow-card">
                បញ្ចប់ <Icon name="check" className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}