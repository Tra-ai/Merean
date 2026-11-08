import { BOOKS, CATEGORIES, IMG, MENU, STATS_CARDS, fmt } from "../data";
import type { Book } from "../data";
import { useStore } from "../store";
import { AdRotation, BookCover, BookRow, HeroCarousel, Icon, SectionTitle, TopBar } from "../ui";

export function HomeScreen() {
  const s = useStore();
  const openBook = (b: Book) => {
    s.bumpView(`book:${b.id}`);
    s.push({ name: "book", id: b.id });
  };

  const hour = new Date().getHours();
  const greet = hour < 12 ? "អរុណសួស្តី ☀️" : hour < 17 ? "ទិវាសួស្តី 🌤️" : "សាយណ្ហសួស្តី 🌙";
  const popular = [...BOOKS].sort((a, b) => b.views + (s.extraViews[`book:${b.id}`] || 0) - (a.views + (s.extraViews[`book:${a.id}`] || 0))).slice(0, 8);
  const reading = Object.entries(s.progress)
    .filter(([, p]) => p.pct > 0 && p.pct < 100)
    .sort((a, b) => b[1].at - a[1].at)
    .map(([id]) => BOOKS.find((b) => b.id === id))
    .filter(Boolean) as Book[];

  return (
    <div className="animate-fade-up pb-6">
      <TopBar
        onSearch={() => s.push({ name: "search" })}
        onBell={() => s.toast("វិញ្ញាសាបាក់ឌុប ២០២៥ ថ្មីទើបបន្ថែម! 🎓", "🔔")}
      />

      {/* Greeting */}
      <div className="px-4 pt-3.5">
        <div className="text-[12px] text-ink-400">{greet}</div>
        <h1 className="mt-0.5 text-[19px] font-bold leading-[1.7] text-ink-900">
          {s.user ? `សួស្តី ${s.user.name}! តោះអានថ្ងៃនេះ 📚` : "តោះចាប់ផ្តើមអានថ្ងៃនេះ 📚"}
        </h1>
      </div>

      {/* Install banner */}
      {!s.installDismissed && (
        <div className="animate-fade-up mx-4 mt-3" style={{ animationDelay: "80ms" }}>
          <div className="relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-TRA-200 bg-gradient-to-r from-TRA-50 to-TRA-100 p-2.5">
            <button
              className="tap-img flex min-w-0 flex-1 items-center gap-2.5 text-left"
              onClick={() => s.toast("TRA APP ត្រូវបានដំឡើងទៅទំព័រដើម ✓", "📲")}
            >
              <img src={IMG.rylIcon} alt="" className="h-9 w-9 rounded-lg shadow-sm" />
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-semibold text-ink-900">ដំឡើង TRA APP លើទូរស័ព្ទ</span>
                <span className="block text-[10.5px] text-ink-500">បើកលឿនជាងមុន · អានបានទោះគ្មានអ៊ីនធឺណិត</span>
              </span>
              <span className="ml-auto shrink-0 rounded-full bg-TRA-500 px-3 py-1.5 text-[10.5px] font-bold text-white shadow-sm">ដំឡើង</span>
            </button>
            <button aria-label="បិទ" onClick={s.dismissInstall} className="tap grid h-6 w-6 shrink-0 place-items-center rounded-full text-ink-400">
              <Icon name="x" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <HeroCarousel />
      </div>

      {/* Quick menu grid */}
      <div className="mt-4 grid grid-cols-4 gap-y-4 px-4">
        {MENU.map((m, i) => (
          <button
            key={m.id}
            onClick={() => {
              if (m.tab) s.switchTab(m.tab);
              else if (m.screen === "favorites") s.push({ name: "favorites" });
              else if (m.screen === "search") s.push({ name: "search" });
              else if (m.screen === "about") s.push({ name: "about" });
            }}
            className="tap-img animate-fade-up flex flex-col items-center gap-1.5"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            <span className="grid h-[52px] w-[52px] place-items-center rounded-2xl bg-gradient-to-br from-TRA-50 to-TRA-100 text-[24px] shadow-[0_3px_10px_rgba(242,101,34,0.12)] ring-1 ring-TRA-200/60">
              {m.icon}
            </span>
            <span className="px-0.5 text-center text-[10px] leading-[1.6] text-ink-700">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Continue reading */}
      {reading.length > 0 && (
        <div className="mt-5">
          <SectionTitle>⏳ បន្តការអាន</SectionTitle>
          <div className="no-bar flex gap-3 overflow-x-auto px-4">
            {reading.map((b) => {
              const p = s.progress[b.id];
              return (
                <button key={b.id} onClick={() => s.push({ name: "reader", id: b.id, chapter: p.chapter })} className="tap flex w-[228px] shrink-0 items-center gap-3 rounded-xl border border-line bg-white p-2.5 text-left shadow-sm">
                  <div className="w-[46px] shrink-0"><BookCoverMini book={b} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-semibold text-ink-900">{b.title}</div>
                    <div className="mt-0.5 text-[10px] text-ink-400">ជំពូកទី {p.chapter + 1} / {b.chapters.length}</div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-TRA-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-TRA-500 to-TRA-400 transition-all" style={{ width: `${p.pct}%` }} />
                    </div>
                    <div className="mt-1 text-[9.5px] font-medium text-TRA-600">{p.pct}% បានបញ្ចប់</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="mt-5">
        <SectionTitle>🔥 សេវាកម្មពេញនិយម</SectionTitle>
        <div className="grid grid-cols-2 gap-3 px-4">
          {STATS_CARDS.map((c, i) => (
            <button
              key={c.id}
              onClick={() => s.switchTab(c.tab)}
              className="tap animate-fade-up rounded-[14px] border border-line bg-white px-2.5 py-4 text-center shadow-sm"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="mx-auto grid h-[46px] w-[46px] place-items-center rounded-xl text-[26px]" style={{ background: c.tint }}>{c.icon}</span>
              <span className="mt-2 block text-[13px] font-medium leading-[1.9] text-ink-900">{c.title}</span>
              <span className="mt-0.5 flex items-center justify-center gap-1 text-[10.5px] text-ink-400">
                <Icon name="eye" className="h-3 w-3" />
                មើល {fmt(c.views + (s.extraViews[`stat:${c.id}`] || 0))} ដង
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular books */}
      <div className="mt-6">
        <SectionTitle action="មើលទាំងអស់" onAction={() => s.switchTab("books")}>📚 សៀវភៅពេញនិយម</SectionTitle>
        <BookRow books={popular} onOpen={openBook} />
      </div>

      <div className="mt-5">
        <AdRotation />
      </div>

      {/* Category rows */}
      {CATEGORIES.map((cat) => {
        const list = BOOKS.filter((b) => b.cat === cat.id);
        if (!list.length) return null;
        return (
          <div key={cat.id} className="mt-6">
            <SectionTitle action="ទាំងអស់" onAction={() => s.push({ name: "category", id: cat.id })}>
              {cat.emoji} {cat.name}
            </SectionTitle>
            <BookRow books={list} onOpen={openBook} />
          </div>
        );
      })}

      <div className="mt-8 flex flex-col items-center gap-1 px-4 pb-2 text-center">
        <img src={IMG.rylIcon} alt="" className="h-8 w-8 rounded-lg opacity-80" />
        <div className="text-[10.5px] text-ink-400">TRA APP © 2026 · អានដើម្បីរីកចម្រើន</div>
        <div className="text-[9.5px] text-ink-300">បង្កើតឡើងសម្រាប់សិស្ស និស្សិត និងអ្នកស្រឡាញ់ការអានគ្រប់រូប</div>
      </div>
    </div>
  );
}

function BookCoverMini({ book }: { book: Book }) {
  return <BookCover book={book} titleClass="hidden" />;
}