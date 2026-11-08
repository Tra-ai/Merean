import { useMemo, useRef, useState } from "react";
import { BOOKS, IMG, SUBJECTS, UNIVERSITIES, fmt } from "../data";
import { useStore } from "../store";
import { BookCover, DetailHeader, EmptyState, Icon, TopBar } from "../ui";
import { cn } from "../utils/cn";

/* ---------------- Sign-in sheet (email + PIN, like the original public-email-pin) ---------------- */

function SignInSheet({ onClose }: { onClose: () => void }) {
  const s = useStore();
  const [step, setStep] = useState<"email" | "pin">("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [demoPin, setDemoPin] = useState("");
  const [err, setErr] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const sendPin = () => {
    if (!name.trim()) return setErr("សូមបញ្ចូលឈ្មោះរបស់អ្នក");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErr("សូមបញ្ចូលអ៊ីមែលឱ្យបានត្រឹមត្រូវ");
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setDemoPin(code);
    setErr("");
    setStep("pin");
    s.toast(`កូដផ្ញើទៅ ${email.trim()} ហើយ`, "📧");
    window.setTimeout(() => refs.current[0]?.focus(), 150);
  };

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...pin];
    next[i] = d;
    setPin(next);
    setErr("");
    if (d && i < 3) refs.current[i + 1]?.focus();
    if (next.every((x) => x !== "")) verify(next.join(""));
  };

  const verify = (code: string) => {
    if (code === demoPin) {
      s.signIn(name.trim(), email.trim());
      s.toast(`សូមស្វាគមន៍ ${name.trim()}! 🎉`, "👋");
      onClose();
    } else {
      setErr("កូដមិនត្រឹមត្រូវទេ — សាកល្បងម្តងទៀត");
      setPin(["", "", "", ""]);
      refs.current[0]?.focus();
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/45 backdrop-blur-[2px]" onClick={onClose}>
      <div className="animate-pop w-full rounded-t-3xl bg-white p-5 pb-8 shadow-float" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto h-1 w-10 rounded-full bg-line" />
        <div className="mt-4 flex items-center gap-3">
          <img src={IMG.rylIcon} alt="" className="h-12 w-12 rounded-xl shadow-sm" />
          <div>
            <h2 className="text-[16px] font-bold">{step === "email" ? "ចូលគណនី TRA" : "បញ្ជាក់កូដ PIN"}</h2>
            <p className="text-[11px] text-ink-400">{step === "email" ? "រក្សាទុកចំណាំ និងវឌ្ឍនភាពអានរបស់អ្នក" : `កូដ ៤ ខ្ទង់ត្រូវបានផ្ញើទៅ ${email}`}</p>
          </div>
          <button onClick={onClose} aria-label="បិទ" className="tap ml-auto grid h-8 w-8 place-items-center rounded-full bg-cream text-ink-400">
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>

        {step === "email" ? (
          <div className="mt-5 space-y-3">
            <label className="block">
              <span className="text-[11px] font-semibold text-ink-500">ឈ្មោះ</span>
              <input value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} placeholder="ឧ. សុខ ដារ៉ា" className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-3 text-[13.5px] outline-none focus:border-TRA-400 focus:ring-2 focus:ring-TRA-100" />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold text-ink-500">អ៊ីមែល</span>
              <input value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} type="email" placeholder="you@example.com" className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-3 text-[13.5px] outline-none focus:border-TRA-400 focus:ring-2 focus:ring-TRA-100" />
            </label>
            {err && <div className="text-[11.5px] font-medium text-bad-500">{err}</div>}
            <button onClick={sendPin} className="tap flex w-full items-center justify-center gap-2 rounded-full bg-TRA-500 py-3.5 text-[13.5px] font-bold text-white shadow-card">
              <Icon name="send" className="h-4 w-4" /> ផ្ញើកូដ PIN
            </button>
            <p className="text-center text-[10px] leading-[1.8] text-ink-300">ការចូលគណនីជាជម្រើស — អ្នកអាចប្រើកម្មវិធីដោយមិនចាំបាច់ចូលក៏បាន</p>
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex justify-center gap-3" dir="ltr">
              {pin.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { refs.current[i] = el; }}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Backspace" && !pin[i] && i > 0) refs.current[i - 1]?.focus(); }}
                  inputMode="numeric"
                  className="h-14 w-12 rounded-xl border-2 border-line bg-paper text-center text-[20px] font-bold outline-none focus:border-TRA-500 focus:ring-2 focus:ring-TRA-100"
                />
              ))}
            </div>
            {err && <div className="mt-3 text-center text-[11.5px] font-medium text-bad-500">{err}</div>}
            <div className="mt-4 rounded-xl border border-dashed border-TRA-300 bg-TRA-50 p-3 text-center">
              <div className="text-[10px] text-ink-500">កម្មវិធីបង្ហាញ · កូដសាកល្បងរបស់អ្នកគឺ</div>
              <div className="mt-0.5 text-[20px] font-extrabold tracking-[0.4em] text-TRA-700">{demoPin}</div>
            </div>
            <button onClick={() => { setStep("email"); setPin(["", "", "", ""]); }} className="tap mx-auto mt-3 block text-[11.5px] font-medium text-TRA-600">
              ← ប្តូរអ៊ីមែល
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Profile ---------------- */

export function ProfileScreen() {
  const s = useStore();
  const [showSignIn, setShowSignIn] = useState(false);
  const [notif, setNotif] = useState(true);

  const finished = Object.values(s.progress).filter((p) => p.pct === 100).length;
  const answered = Object.values(s.answers);
  const correct = answered.filter((a) => a.correct).length;

  return (
    <div className="animate-fade-up pb-6">
      <TopBar onSearch={() => s.push({ name: "search" })} onBell={() => s.toast("គ្មានការជូនដំណឹងថ្មីទេ", "🔔")} />

      {/* Profile card */}
      <div className="mx-4 mt-3 overflow-hidden rounded-2xl shadow-card" style={{ background: "linear-gradient(130deg, #232323, #383838 70%, #4a3a2c 130%)" }}>
        <div className="relative p-4">
          <span className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full bg-TRA-500/25 blur-2xl" />
          {s.user ? (
            <div className="relative flex items-center gap-3.5">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-TRA-400 to-TRA-600 text-[20px] font-extrabold text-white ring-2 ring-white/25">
                {s.user.name.trim().charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15.5px] font-bold text-white">{s.user.name}</div>
                <div className="truncate text-[11px] text-white/60">{s.user.email}</div>
                <span className="mt-1 inline-block rounded-full bg-TRA-500/25 px-2 py-0.5 text-[9px] font-bold text-TRA-300 ring-1 ring-TRA-500/40">អ្នកអាន TRA ✦</span>
              </div>
              <button onClick={() => { s.signOut(); s.toast("បានចេញពីគណនី", "👋"); }} aria-label="ចេញ" className="tap grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80">
                <Icon name="logout" className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-3.5">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-white/10 ring-2 ring-white/20">
                  <Icon name="user" className="h-6 w-6 text-white/70" />
                </span>
                <div className="flex-1">
                  <div className="text-[15px] font-bold text-white">ភ្ញៀវអ្នកអាន</div>
                  <div className="text-[10.5px] leading-[1.8] text-white/60">ចូលគណនីដើម្បីរក្សាទុកវឌ្ឍនភាពគ្រប់ឧបករណ៍</div>
                </div>
              </div>
              <button onClick={() => setShowSignIn(true)} className="tap mt-3.5 w-full rounded-full bg-TRA-500 py-2.5 text-[12.5px] font-bold text-white shadow-card">
                ចូលគណនីដោយអ៊ីមែល
              </button>
            </div>
          )}
          <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              [String(s.favorites.length), "ចំណាំ"],
              [String(finished), "អានចប់"],
              [String(answered.length), "សំណួរបានធ្វើ"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl bg-white/8 py-2 ring-1 ring-white/12">
                <div className="text-[15px] font-bold text-TRA-300">{v}</div>
                <div className="text-[9px] text-white/60">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accuracy */}
      {answered.length > 0 && (
        <div className="mx-4 mt-3 rounded-xl border border-line bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="font-semibold text-ink-900">🎯 ភាពត្រឹមត្រូវនៃវិញ្ញាសា</span>
            <span className="font-bold text-TRA-600">{Math.round((correct / answered.length) * 100)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream">
            <div className="h-full rounded-full bg-gradient-to-r from-TRA-500 to-ok-500 transition-all duration-500" style={{ width: `${(correct / answered.length) * 100}%` }} />
          </div>
          <div className="mt-1.5 text-[10px] text-ink-400">ត្រូវ {correct} / {answered.length} សំណួរ · បន្តធ្វើវិញ្ញាសាដើម្បីបង្កើនពិន្ទុ</div>
        </div>
      )}

      {/* Menu list */}
      <div className="mx-4 mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="flex w-full items-center gap-3 px-4 py-3.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-TRA-50 text-[17px]">🔔</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-ink-900">ការជូនដំណឹង</span>
            <span className="block text-[10px] text-ink-400">សៀវភៅថ្មី និងវិញ្ញាសាថ្មី</span>
          </span>
          <button
            role="switch"
            aria-checked={notif}
            onClick={() => { setNotif(!notif); s.toast(notif ? "បានបិទការជូនដំណឹង" : "បានបើកការជូនដំណឹង", "🔔"); }}
            className={cn("relative h-6 w-11 rounded-full transition-colors duration-200", notif ? "bg-TRA-500" : "bg-line")}
          >
            <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200", notif ? "left-[22px]" : "left-0.5")} />
          </button>
        </div>
      </div>

      {/* Reading history */}
      {Object.keys(s.progress).length > 0 && (
        <div className="mt-5">
          <div className="px-4"><h2 className="text-[14.5px] font-semibold leading-[1.9]">📖 ប្រវត្តិអានថ្មីៗ</h2></div>
          <div className="mt-2 space-y-2 px-4">
            {Object.entries(s.progress).sort((a, b) => b[1].at - a[1].at).slice(0, 4).map(([id, p]) => {
              const b = BOOKS.find((x) => x.id === id);
              if (!b) return null;
              return (
                <button key={id} onClick={() => s.push({ name: "book", id })} className="tap flex w-full items-center gap-3 rounded-xl border border-line bg-white p-2.5 text-left shadow-sm">
                  <div className="w-[40px] shrink-0"><BookCover book={b} titleClass="hidden" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-semibold text-ink-900">{b.title}</div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-cream">
                      <div className={cn("h-full rounded-full", p.pct === 100 ? "bg-ok-500" : "bg-TRA-500")} style={{ width: `${p.pct}%` }} />
                    </div>
                  </div>
                  <span className={cn("shrink-0 text-[11px] font-bold", p.pct === 100 ? "text-ok-500" : "text-TRA-600")}>{p.pct === 100 ? "ចប់ ✓" : `${p.pct}%`}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-7 text-center text-[9.5px] leading-[1.9] text-ink-300">
        TRA APP · កំណែ 2.6<br />បង្កើតដោយក្រុមការងារ TRA សម្រាប់អ្នកអានខ្មែរគ្រប់រូប 🧡
      </div>

      {showSignIn && <SignInSheet onClose={() => setShowSignIn(false)} />}
    </div>
  );
}

/* ---------------- Favorites ---------------- */

export function FavoritesScreen() {
  const s = useStore();
  const list = BOOKS.filter((b) => s.favorites.includes(b.id));
  return (
    <div className="animate-slide-in pb-6">
      <DetailHeader title="ចំណាំរបស់ខ្ញុំ 🔖" sub={`${list.length} ក្បាល`} />
      {list.length === 0 ? (
        <EmptyState icon="🔖" title="មិនទាន់មានចំណាំ" sub="ចុចរូបបេះដូងលើសៀវភៅណាមួយ ដើម្បីរក្សាទុកវានៅទីនេះ" action="ទៅបណ្ណាល័យ" onAction={() => s.switchTab("books")} />
      ) : (
        <div className="grid grid-cols-3 gap-x-3 gap-y-5 px-4 pt-4">
          {list.map((b) => (
            <div key={b.id} className="relative">
              <button onClick={() => s.push({ name: "book", id: b.id })} className="tap-img w-full text-left">
                <BookCover book={b} />
                <div className="mt-1.5 line-clamp-2 text-center text-[11px] leading-[1.7] text-ink-700">{b.title}</div>
              </button>
              <button
                aria-label="ដកចេញ"
                onClick={() => { s.toggleFavorite(b.id); s.toast("បានដកចេញពីចំណាំ", "💔"); }}
                className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-char-800 text-white shadow-md"
              >
                <Icon name="x" className="h-3 w-3" strokeWidth={2.6} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Global search ---------------- */

export function SearchScreen() {
  const s = useStore();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const res = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return null;
    return { books: BOOKS.filter((b) => (b.title + b.author + b.desc).toLowerCase().includes(t)) };
  }, [q]);

  const t = q.trim().toLowerCase();
  const unis = t ? UNIVERSITIES_FILTER(t) : [];

  return (
    <div className="animate-slide-in pb-6">
      <DetailHeader title="ស្វែងរក" sub="សៀវភៅ · មុខវិជ្ជា · សាកលវិទ្យាល័យ" />
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 rounded-xl border border-TRA-300 bg-white px-3 py-3 shadow-sm ring-2 ring-TRA-100">
          <Icon name="search" className="h-4 w-4 shrink-0 text-TRA-500" />
          <input
            ref={inputRef}
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="វាយពាក្យស្វែងរក…"
            className="w-full bg-transparent text-[14px] leading-[1.8] outline-none placeholder:text-ink-300"
          />
          {q && (
            <button onClick={() => { setQ(""); inputRef.current?.focus(); }} aria-label="សម្អាត" className="tap grid h-5 w-5 place-items-center rounded-full bg-cream text-ink-400">
              <Icon name="x" className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {!res ? (
        <div className="px-4 pt-5">
          <div className="text-[11.5px] font-semibold text-ink-400">ការស្វែងរកពេញនិយម</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {["ទម្លាប់", "ទុំទាវ", "អង្គរ", "គណិតវិទ្យា", "វេជ្ជសាស្ត្រ", "កុំព្យូទ័រ"].map((k) => (
              <button key={k} onClick={() => setQ(k)} className="tap rounded-full border border-line bg-white px-3.5 py-1.5 text-[12px] text-ink-700 shadow-sm">
                🔎 {k}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="pt-4">
          {res.books.length === 0 && unis.length === 0 && SUBJECT_HITS(t).length === 0 && (
            <EmptyState icon="🔍" title="រកមិនឃើញលទ្ធផល" sub={`គ្មានអ្វីត្រូវនឹង «${q}» ទេ`} />
          )}
          {res.books.length > 0 && (
            <div>
              <div className="px-4 text-[12px] font-bold text-TRA-700">📚 សៀវភៅ ({res.books.length})</div>
              <div className="mt-2 space-y-2 px-4">
                {res.books.map((b) => (
                  <button key={b.id} onClick={() => { s.bumpView(`book:${b.id}`); s.push({ name: "book", id: b.id }); }} className="tap flex w-full items-center gap-3 rounded-xl border border-line bg-white p-2.5 text-left shadow-sm">
                    <div className="w-[42px] shrink-0"><BookCover book={b} titleClass="hidden" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-semibold">{b.title}</div>
                      <div className="text-[10.5px] text-ink-400">{b.author} · {fmt(b.views)} ការមើល</div>
                    </div>
                    <Icon name="right" className="h-4 w-4 shrink-0 text-ink-300" />
                  </button>
                ))}
              </div>
            </div>
          )}
          {SUBJECT_HITS(t).length > 0 && (
            <div className="mt-5">
              <div className="px-4 text-[12px] font-bold text-TRA-700">🎓 មុខវិជ្ជា ({SUBJECT_HITS(t).length})</div>
              <div className="mt-2 space-y-2 px-4">
                {SUBJECT_HITS(t).map((sub) => (
                  <button key={sub.id} onClick={() => s.openTab("exam", { name: "subject", id: sub.id })} className="tap flex w-full items-center gap-3 rounded-xl border border-line bg-white p-3 text-left shadow-sm">
                    <span className="grid h-10 w-10 place-items-center rounded-xl text-[20px]" style={{ background: sub.tint }}>{sub.emoji}</span>
                    <span className="flex-1 text-[12.5px] font-semibold">{sub.name}</span>
                    <Icon name="right" className="h-4 w-4 text-ink-300" />
                  </button>
                ))}
              </div>
            </div>
          )}
          {unis.length > 0 && (
            <div className="mt-5">
              <div className="px-4 text-[12px] font-bold text-TRA-700">🏛️ សាកលវិទ្យាល័យ ({unis.length})</div>
              <div className="mt-2 space-y-2 px-4">
                {unis.map(({ u, majors }) => (
                  <button key={u.id} onClick={() => s.openTab("uni", { name: "university", id: u.id })} className="tap flex w-full items-center gap-3 rounded-xl border border-line bg-white p-3 text-left shadow-sm">
                    <span className="grid h-10 w-10 place-items-center rounded-xl text-[10px] font-extrabold text-white" style={{ background: u.color }}>{u.short}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-semibold">{u.name}</span>
                      {majors.length > 0 && <span className="block truncate text-[10px] text-ink-400">ជំនាញ៖ {majors.join(" · ")}</span>}
                    </span>
                    <Icon name="right" className="h-4 w-4 shrink-0 text-ink-300" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SUBJECT_HITS(t: string) {
  return t ? SUBJECTS.filter((x) => x.name.toLowerCase().includes(t)) : [];
}
function UNIVERSITIES_FILTER(t: string) {
  return UNIVERSITIES.map((u) => ({ u, majors: u.majors.filter((m) => m.name.toLowerCase().includes(t)).map((m) => m.name) })).filter(
    (x) => x.u.name.toLowerCase().includes(t) || x.u.short.toLowerCase().includes(t) || x.majors.length > 0
  );
}

/* ---------------- About ---------------- */

export function AboutScreen() {
  const s = useStore();
  return (
    <div className="animate-slide-in pb-8">
      <DetailHeader title="អំពី TRA APP" />
      <div className="flex flex-col items-center px-6 pt-8 text-center">
        <img src={IMG.rylIcon} alt="TRA" className="animate-float-slow h-24 w-24 rounded-[26px] shadow-float" />
        <h1 className="mt-4 text-[22px] font-extrabold tracking-wide">TRA APP</h1>
        <div className="mt-1 text-[12px] font-medium text-TRA-600">អានដើម្បីរីកចម្រើន · Read to Grow</div>
        <p className="mt-4 text-[13px] leading-[2.1] text-ink-700">
          TRA គឺជាបណ្ណាល័យឌីជីថលសម្រាប់យុវជនខ្មែរ៖ សៀវភៅអេឡិចត្រូនិចឥតគិតថ្លៃ វិញ្ញាសាបាក់ឌុបចាស់ៗ និងមគ្គុទ្ទេសក៍ជ្រើសរើសសាកលវិទ្យាល័យ — គ្រប់យ៉ាងក្នុងកម្មវិធីតែមួយ។
        </p>
      </div>
      <div className="mx-4 mt-6 grid grid-cols-3 gap-2 text-center">
        {[["12+", "សៀវភៅ"], ["25+", "សំណួរគំរូ"], ["6", "សាកលវិទ្យាល័យ"]].map(([v, l]) => (
          <div key={l} className="rounded-2xl border border-line bg-white py-3.5 shadow-sm">
            <div className="text-[19px] font-extrabold text-TRA-600">{v}</div>
            <div className="mt-0.5 text-[10px] text-ink-400">{l}</div>
          </div>
        ))}
      </div>
      <div className="mx-4 mt-4 space-y-2.5">
        {[
          ["📚", "បេសកកម្ម", "ធ្វើឱ្យការអានមានតម្លៃថោក និងងាយស្រួលសម្រាប់យុវជនខ្មែរគ្រប់រូប នៅគ្រប់ទីកន្លែង។"],
          ["🧡", "សហគមន៍", "អ្នកអានជាង ១០០,០០០ នាក់ប្រើ TRA ជារៀងរាល់ខែ ដើម្បីរៀន និងអភិវឌ្ឍខ្លួន។"],
          ["✉️", "ទំនាក់ទំនង", "មានសំណួរ ឬយោបល់? ផ្ញើសារមកក្រុមការងារ TRA បានគ្រប់ពេល។"],
        ].map(([icon, title, body]) => (
          <div key={title} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[13px] font-bold text-ink-900"><span className="text-[17px]">{icon}</span> {title}</div>
            <p className="mt-1.5 text-[12px] leading-[2] text-ink-500">{body}</p>
          </div>
        ))}
      </div>
      <button onClick={() => s.toast("សូមអរគុណសម្រាប់ការគាំទ្រ TRA 🧡", "🙏")} className="tap mx-4 mt-5 flex w-[calc(100%-32px)] items-center justify-center gap-2 rounded-full bg-char-800 py-3 text-[13px] font-bold text-white shadow-card">
        <Icon name="heart" className="h-4 w-4 text-TRA-400" /> គាំទ្រក្រុមការងារ TRA
      </button>
    </div>
  );
}