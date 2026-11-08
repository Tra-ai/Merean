import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { IMG, fmt } from "./data";
import type { Book } from "./data";
import { useStore } from "./store";
import type { TabId } from "./store";
import { cn } from "./utils/cn";

/* ---------- Icons ---------- */

export function Icon({ name, className, strokeWidth = 2 }: { name: string; className?: string; strokeWidth?: number }) {
  const paths: Record<string, ReactNode> = {
    home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></>,
    grad: <><path d="m2 9 10-5 10 5-10 5L2 9Z" /><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" /><path d="M22 9v5" /></>,
    bank: <><path d="M3 21h18" /><path d="M4 18h16" /><path d="M6 18v-7M10 18v-7M14 18v-7M18 18v-7" /><path d="m12 2 9 5H3l9-5Z" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></>,
    back: <path d="m15 5-7 7 7 7" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    bell: <><path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9" /><path d="M10 20a2.2 2.2 0 0 0 4 0" /></>,
    heart: <path d="M12 20.5C6.5 16.5 3 13.3 3 9.6 3 7 5 5 7.6 5c1.7 0 3.3.9 4.4 2.4C13.1 5.9 14.7 5 16.4 5 19 5 21 7 21 9.6c0 3.7-3.5 6.9-9 10.9Z" />,
    eye: <><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    star: <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9 2.9-6Z" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    check: <path d="m4.5 12.5 5 5 10-11" />,
    x: <path d="M6 6l12 12M18 6 6 18" />,
    right: <path d="m9 5 7 7-7 7" />,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 21h16" /></>,
    share: <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8.3 10.8 7.4-3.6M8.3 13.2l7.4 3.6" /></>,
    play: <path d="M7 4.5v15l13-7.5-13-7.5Z" />,
    quote: <path d="M9 7c-3 1-4.5 3-4.5 6.5V18H10v-6H7c0-2 .8-3.3 2.8-4.2L9 7Zm10 0c-3 1-4.5 3-4.5 6.5V18H20v-6h-3c0-2 .8-3.3 2.8-4.2L19 7Z" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>,
    sparkle: <path d="M12 2.5 14 9l6.5 2-6.5 2-2 6.5L10 13l-6.5-2L10 9l2-6.5Z" />,
    bus: <><rect x="4" y="3" width="16" height="14" rx="2.5" /><path d="M4 9h16M8 21l1-4M16 21l-1-4" /><circle cx="8.5" cy="13.5" r="0.5" /><circle cx="15.5" cy="13.5" r="0.5" /></>,
    filter: <path d="M4 5h16l-6 7.5V19l-4 2v-8.5L4 5Z" />,
    flame: <path d="M12 22c4.4 0 7-2.8 7-6.5 0-3-2-5-3.5-7C14 6.5 13 4.5 13 2c-3 2-4.5 4.5-4.5 7 0 0-1.5-1-2-3C4.7 7.7 5 10.6 5 15.5 5 19.2 7.6 22 12 22Z" />,
    pages: <><path d="M8 3h11v15" /><rect x="4" y="6" width="11" height="15" rx="1.5" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 7.5v.5" /></>,
    minus: <path d="M5 12h14" />,
    plus: <path d="M12 5v14M5 12h14" />,
    list: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3.5 6h.5M3.5 12h.5M3.5 18h.5" /></>,
    trophy: <><path d="M8 21h8M12 17v4" /><path d="M7 4h10v6a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5" /></>,
    send: <path d="m3 11 18-8-8 18-2.5-7.5L3 11Z" />,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {paths[name] ?? null}
    </svg>
  );
}

/* ---------- App chrome ---------- */

export function TopBar({ onSearch, onBell }: { onSearch: () => void; onBell: () => void }) {
  return (
    <div className="sticky top-0 z-30 border-b border-black/10 bg-white/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="flex items-center gap-2.5 px-4 py-2.5">
        <img src={IMG.rylIcon} alt="TRA" className="h-9 w-9 rounded-[10px] shadow-sm" />
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold leading-tight tracking-wide text-ink-900">TRA APP</div>
          <div className="text-[10.5px] leading-tight text-ink-400">អានដើម្បីរីកចម្រើន · Read to Grow</div>
        </div>
        <button onClick={onSearch} aria-label="ស្វែងរក" className="tap grid h-9 w-9 place-items-center rounded-full bg-TRA-50 text-TRA-700">
          <Icon name="search" className="h-[18px] w-[18px]" />
        </button>
        <button onClick={onBell} aria-label="ជូនដំណឹង" className="tap relative grid h-9 w-9 place-items-center rounded-full bg-TRA-50 text-TRA-700">
          <Icon name="bell" className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-busr-500 ring-2 ring-white" />
        </button>
      </div>
    </div>
  );
}

export function DetailHeader({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  const { pop } = useStore();
  return (
    <div className="sticky top-0 z-30 border-b border-black/10 bg-white/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="flex items-center gap-1.5 px-2 py-2">
        <button onClick={pop} aria-label="ត្រឡប់ក្រោយ" className="tap grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-700">
          <Icon name="back" className="h-5 w-5" strokeWidth={2.4} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold text-ink-900">{title}</div>
          {sub ? <div className="truncate text-[11px] text-ink-400">{sub}</div> : null}
        </div>
        {right}
      </div>
    </div>
  );
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "home", label: "ទំព័រដើម", icon: "home" },
  { id: "profile", label: "គណនី", icon: "user" },
];

export function TabBar() {
  const { tab, switchTab } = useStore();
  return (
    <nav className="relative z-30 border-t border-black/10 bg-white/75 pb-[max(env(safe-area-inset-bottom),6px)] backdrop-blur-xl backdrop-saturate-150">
      <div className="grid grid-cols-2">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => switchTab(t.id)} className="group relative flex flex-col items-center gap-0.5 pb-1 pt-2">
              <span className={cn("grid h-7 w-12 place-items-center transition-colors duration-200", active ? "text-TRA-600" : "text-[#8e8e93]")}>
                <Icon name={t.icon} className="h-[20px] w-[20px]" strokeWidth={active ? 2.3 : 1.9} />
              </span>
              <span className={cn("text-[10px] leading-tight transition-colors", active ? "font-medium text-TRA-600" : "text-[#8e8e93]")}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function ToastHost() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-6">
      {toasts.map((t) => (
        <div key={t.id} className="animate-toast-in flex max-w-full items-center gap-2 rounded-full bg-char-800/95 py-2 pl-3 pr-4 text-[12.5px] text-white shadow-float">
          {t.icon ? <span className="text-[14px]">{t.icon}</span> : <Icon name="check" className="h-4 w-4 text-TRA-400" />}
          <span className="truncate">{t.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Book cover ---------- */

export function BookCover({ book, className, titleClass }: { book: Book; className?: string; titleClass?: string }) {
  if (book.art) {
    return (
      <div className={cn("relative overflow-hidden rounded-[10px] shadow-card", className)} style={{ aspectRatio: "2/3" }}>
        <img src={book.art} alt={book.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        <span className="absolute left-1 top-1 h-[3px] w-6 rounded-full bg-white/40" />
        <div className="absolute inset-x-0 bottom-0 p-2">
          <div className={cn("text-center text-[11.5px] font-semibold leading-[1.55] text-white drop-shadow", titleClass)}>{book.title}</div>
          <div className="mt-0.5 truncate text-center text-[8.5px] text-white/70">{book.author}</div>
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[5px] bg-gradient-to-r from-black/35 to-transparent" />
      </div>
    );
  }
  const t = book.typo!;
  return (
    <div className={cn("relative overflow-hidden rounded-[10px] shadow-card", className)} style={{ aspectRatio: "2/3", background: `linear-gradient(165deg, ${t.bg}, ${t.bg} 55%, #00000055 160%)`, backgroundColor: t.bg }}>
      <svg className="absolute inset-0 h-full w-full opacity-[0.14]" aria-hidden>
        <defs>
          <pattern id={`kb-${book.id}`} width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M13 2 24 13 13 24 2 13Z" fill="none" stroke={t.fg} strokeWidth="1" />
            <circle cx="13" cy="13" r="2.4" fill={t.fg} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#kb-${book.id})`} />
      </svg>
      <div className="absolute inset-[7px] rounded-[6px] border" style={{ borderColor: `${t.fg}55` }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
        <span className="mb-1.5 text-[16px]" style={{ color: t.fg }}>❖</span>
        <div className={cn("text-[12px] font-semibold leading-[1.7]", titleClass)} style={{ color: t.fg }}>{book.title}</div>
        <div className="mt-1.5 h-px w-8" style={{ background: t.fg, opacity: 0.5 }} />
        <div className="mt-1.5 text-[8.5px] leading-relaxed" style={{ color: t.sub }}>{book.author}</div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[5px] bg-gradient-to-r from-black/30 to-transparent" />
    </div>
  );
}

/* ---------- Section title ---------- */

export function SectionTitle({ children, action, onAction }: { children: ReactNode; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-2.5 flex items-end justify-between px-4">
      <h2 className="text-[15.5px] font-semibold leading-[1.9] text-ink-900">{children}</h2>
      {action ? (
        <button onClick={onAction} className="tap flex items-center gap-0.5 rounded-full px-2 py-1 text-[11.5px] font-medium text-TRA-600">
          {action}
          <Icon name="right" className="h-3 w-3" strokeWidth={2.6} />
        </button>
      ) : null}
    </div>
  );
}

/* ---------- Hero carousel ---------- */

export function HeroCarousel() {
  const { switchTab, openTab, toast } = useStore();
  const [idx, setIdx] = useState(0);
  const timer = useRef<number | null>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    timer.current = window.setInterval(() => setIdx((i) => (i + 1) % 3), 5200);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, []);

  const go = (i: number) => {
    setIdx(((i % 3) + 3) % 3);
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => setIdx((j) => (j + 1) % 3), 5200);
  };

  const slides = [
    // TRA x redBus partnership banner (shine + pulse, as in the original)
    <button
      key="bus"
      onClick={() => toast("កូដ RYL10 ត្រូវបានចម្លង — បញ្ចុះ 10% លើ redBus!", "🎟️")}
      className="relative block h-full w-full overflow-hidden rounded-2xl text-left"
      style={{ background: "linear-gradient(115deg, #a31220 0%, #d84e55 52%, #f0757c 100%)" }}
    >
      <span className="animate-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div className="relative flex h-full items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-white/85">
            TRA <span className="text-[12px]">×</span> redBus
          </div>
          <div className="mt-0.5 text-[15.5px] font-bold leading-[1.7] text-white">បញ្ចុះតម្លៃ 10% លើសំបុត្រឡានក្រុង</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-extrabold tracking-widest text-busr-600">RYL10</span>
            <span className="text-[10.5px] text-white/80">សម្រាប់អ្នកអាន TRA គ្រប់រូប</span>
          </div>
        </div>
      </div>
      <span className="absolute bottom-2 right-3 text-[9px] text-white/60">ការផ្សាយពាណិជ្ជកម្ម</span>
    </button>,
    // Bac II Plus
    <button key="exam" onClick={() => switchTab("exam")} className="relative block h-full w-full overflow-hidden rounded-2xl text-left" style={{ background: "linear-gradient(115deg, #b34a0e 0%, #ff6b00 55%, #ff9a4d 100%)" }}>
      <span className="animate-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="relative flex h-full flex-col justify-center p-4">
        <span className="w-fit rounded-full bg-white/20 px-2 py-0.5 text-[9.5px] font-bold tracking-wider text-white ring-1 ring-white/30">បាក់ឌុប Plus 🎓</span>
        <div className="mt-1.5 text-[16px] font-bold leading-[1.65] text-white">វិញ្ញាសាប្រឡងចាស់ៗ ២០២៣–២០២៥</div>
        <div className="mt-1 text-[10.5px] text-white/85">៨ មុខវិជ្ជា · ចម្លើយលម្អិតជាភាសាខ្មែរ</div>
      </div>
    </button>,
    // Library
    <button key="lib" onClick={() => openTab("books", { name: "category", id: "biz" })} className="relative block h-full w-full overflow-hidden rounded-2xl text-left" style={{ background: "linear-gradient(120deg, #232323 0%, #383838 60%, #4a3a2c 130%)", backgroundColor: "#2b2b2b" }}>
      <span className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-TRA-500/25 blur-2xl" />
      <span className="pointer-events-none absolute -bottom-12 left-10 h-32 w-32 rounded-full bg-TRA-500/15 blur-2xl" />
      <div className="relative flex h-full items-center gap-3 p-4">
        <div className="min-w-0">
          <div className="text-[10px] font-bold tracking-[0.18em] text-TRA-400">បណ្ណាល័យ TRA</div>
          <div className="mt-0.5 text-[15.5px] font-bold leading-[1.7] text-white">សៀវភៅអេឡិចត្រូនិចឥតគិតថ្លៃ</div>
          <div className="mt-1 flex items-center gap-1 text-[10.5px] text-white/70">
            <Icon name="sparkle" className="h-3 w-3 text-TRA-400" /> អានគ្រប់ទីកន្លែង គ្រប់ពេលវេលា
          </div>
        </div>
      </div>
    </button>,
  ];

  return (
    <div className="px-4">
      <div
        className="relative h-[132px] overflow-hidden rounded-2xl shadow-card"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 42) go(idx + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
      >
        {slides.map((s, i) => (
          <div key={i} className={cn("absolute inset-0 transition-all duration-700", i === idx ? "translate-x-0 opacity-100" : i < idx ? "-translate-x-6 opacity-0 pointer-events-none" : "translate-x-6 opacity-0 pointer-events-none")}>
            {s}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <button key={i} aria-label={`បដាទី ${i + 1}`} onClick={() => go(i)} className={cn("h-1.5 rounded-full transition-all duration-300", i === idx ? "w-5 bg-TRA-500" : "w-1.5 bg-TRA-200")} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Rotating in-content ad (2 ads, like original rylAdA/rylAdB) ---------- */

export function AdRotation() {
  const { toast, switchTab } = useStore();
  const [flip, setFlip] = useState(false);
  useEffect(() => {
    const t = window.setInterval(() => setFlip((f) => !f), 5000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="relative mx-4 h-[76px] overflow-hidden rounded-xl border border-line">
      <button
        onClick={() => toast("សូមអរគុណ! កូដ RYLBOOK5 ត្រូវបានរក្សាទុក", "📚")}
        className={cn("absolute inset-0 flex items-center gap-3 bg-gradient-to-r from-TRA-100 via-white to-TRA-50 px-3.5 text-left transition-all duration-700", flip ? "pointer-events-none -translate-y-3 opacity-0" : "translate-y-0 opacity-100")}
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-TRA-500 text-[20px] shadow-sm">📖</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12.5px] font-bold text-ink-900">កូដ RYLBOOK5 · បញ្ចុះ 5% ហាងសៀវភៅដៃគូ</span>
          <span className="mt-0.5 block text-[10.5px] text-ink-500">បង្ហាញកូដនេះនៅហាងសៀវភៅជាដៃគូទូទាំងប្រទេស</span>
        </span>
        <span className="rounded-md bg-TRA-500 px-1.5 py-0.5 text-[8.5px] font-bold text-white">AD</span>
      </button>
      <button
        onClick={() => switchTab("uni")}
        className={cn("absolute inset-0 flex items-center gap-3 bg-gradient-to-r from-[#EAF1FB] via-white to-[#F1EBFC] px-3.5 text-left transition-all duration-700", flip ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0")}
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-info-500 text-[20px] shadow-sm">🎯</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12.5px] font-bold text-ink-900">មិនទាន់ដឹងរៀនជំនាញអ្វី?</span>
          <span className="mt-0.5 block text-[10.5px] text-ink-500">ស្វែងយល់ពីជំនាញ និងថ្លៃសិក្សានៅសាកលវិទ្យាល័យនីមួយៗ</span>
        </span>
        <span className="rounded-md bg-info-500 px-1.5 py-0.5 text-[8.5px] font-bold text-white">AD</span>
      </button>
    </div>
  );
}

/* ---------- Horizontal book row ---------- */

export function BookRow({ books, onOpen }: { books: Book[]; onOpen: (b: Book) => void }) {
  return (
    <div className="no-bar -mx-0 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
      {books.map((b, i) => (
        <button key={b.id} onClick={() => onOpen(b)} className="tap-img w-[108px] shrink-0 snap-start text-left" style={{ animationDelay: `${i * 60}ms` }}>
          <BookCover book={b} />
          <div className="mt-1.5 line-clamp-2 text-center text-[11px] leading-[1.7] text-ink-700">{b.title}</div>
          <div className="mt-0.5 flex items-center justify-center gap-1 text-[9.5px] text-ink-400">
            <Icon name="eye" className="h-3 w-3" /> {fmt(b.views)}
          </div>
        </button>
      ))}
    </div>
  );
}

export function Chip({ active, children, onClick, style }: { active?: boolean; children: ReactNode; onClick?: () => void; style?: CSSProperties }) {
  return (
    <button
      onClick={onClick}
      style={style}
      className={cn(
        "tap shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12px] leading-[1.7] transition-colors",
        active ? "border-TRA-500 bg-TRA-500 font-semibold text-white shadow-sm" : "border-line bg-white text-ink-500"
      )}
    >
      {children}
    </button>
  );
}

export function EmptyState({ icon, title, sub, action, onAction }: { icon: string; title: string; sub: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-TRA-100 text-[30px]">{icon}</div>
      <div className="mt-4 text-[15px] font-semibold text-ink-900">{title}</div>
      <div className="mt-1.5 text-[12.5px] leading-[1.9] text-ink-400">{sub}</div>
      {action ? (
        <button onClick={onAction} className="tap mt-5 rounded-full bg-TRA-500 px-6 py-2.5 text-[13px] font-semibold text-white shadow-card">
          {action}
        </button>
      ) : null}
    </div>
  );
}