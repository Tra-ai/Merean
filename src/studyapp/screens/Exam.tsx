import { useMemo, useState } from "react";
import { QUESTIONS, SUBJECTS, fmt } from "../data";
import { useStore } from "../store";
import { DetailHeader, EmptyState, Icon, TopBar } from "../ui";
import { cn } from "../utils/cn";

const KH_CHOICES = ["ក", "ខ", "គ", "ឃ"];

/* ---------------- Subjects grid ---------------- */

export function ExamScreen() {
  const s = useStore();
  const answered = Object.values(s.answers);
  const correct = answered.filter((a) => a.correct).length;

  return (
    <div className="animate-fade-up pb-6">
      <TopBar onSearch={() => s.push({ name: "search" })} onBell={() => s.toast("កុំភ្លេចធ្វើវិញ្ញាសាថ្ងៃនេះណា 💪", "🔔")} />

      {/* Header banner */}
      <div className="mx-4 mt-3 overflow-hidden rounded-2xl text-white shadow-card" style={{ background: "linear-gradient(120deg, #b34a0e, #ff6b00 55%, #ff9a4d)" }}>
        <div className="relative p-4">
          <span className="animate-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold tracking-[0.18em] text-white/80">TRA EXAM PREP</div>
              <h1 className="mt-1 text-[19px] font-bold leading-[1.7]">បាក់ឌុប Plus 🎓</h1>
              <p className="mt-0.5 text-[11px] text-white/85">វិញ្ញាសាប្រឡងចាស់ៗ ព្រមទាំងចម្លើយលម្អិត</p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-[30px] ring-1 ring-white/25">🏆</div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-white/12 py-2 ring-1 ring-white/15">
              <div className="text-[15px] font-bold">{SUBJECTS.length}</div>
              <div className="text-[9px] text-white/80">មុខវិជ្ជា</div>
            </div>
            <div className="rounded-xl bg-white/12 py-2 ring-1 ring-white/15">
              <div className="text-[15px] font-bold">{answered.length}</div>
              <div className="text-[9px] text-white/80">សំណួរបានធ្វើ</div>
            </div>
            <div className="rounded-xl bg-white/12 py-2 ring-1 ring-white/15">
              <div className="text-[15px] font-bold">{answered.length ? Math.round((correct / answered.length) * 100) : 0}%</div>
              <div className="text-[9px] text-white/80">ភាពត្រឹមត្រូវ</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 px-4">
        <h2 className="text-[15.5px] font-semibold leading-[1.9]">ជ្រើសរើសមុខវិជ្ជា</h2>
        <p className="text-[11px] text-ink-400">ចុចលើមុខវិជ្ជា ដើម្បីមើលវិញ្ញាសាតាមឆ្នាំ</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 px-4">
        {SUBJECTS.map((sub, i) => {
          const subAnswers = QUESTIONS.filter((q) => q.subject === sub.id && s.answers[q.id]);
          return (
            <button
              key={sub.id}
              onClick={() => { s.bumpView(`subject:${sub.id}`); s.push({ name: "subject", id: sub.id }); }}
              className="tap animate-fade-up rounded-2xl border border-line bg-white p-4 text-center shadow-sm"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="mx-auto grid h-[52px] w-[52px] place-items-center rounded-2xl text-[27px]" style={{ background: sub.tint }}>{sub.emoji}</span>
              <span className="mt-2.5 block text-[14.5px] font-medium leading-[1.8] text-ink-900">{sub.name}</span>
              <span className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-ink-400">
                <Icon name="eye" className="h-3 w-3" /> មើល {fmt(sub.views + (s.extraViews[`subject:${sub.id}`] || 0))} ដង
              </span>
              {subAnswers.length > 0 && (
                <span className="mx-auto mt-2 block w-fit rounded-full bg-ok-100 px-2 py-0.5 text-[9px] font-semibold text-ok-500">
                  បានធ្វើ {subAnswers.length} សំណួរ
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mx-4 mt-5 flex items-start gap-2.5 rounded-xl border border-TRA-200 bg-TRA-50 p-3">
        <span className="text-[18px]">💡</span>
        <p className="text-[11.5px] leading-[1.9] text-ink-700">
          <span className="font-semibold text-TRA-800">គន្លឹះ៖</span> ធ្វើវិញ្ញាសាចាស់ៗឱ្យបានយ៉ាងហោច ៣ ដងមុនប្រឡង ហើយកត់ត្រាសំណួរដែលខុស ដើម្បីពិនិត្យឡើងវិញ។
        </p>
      </div>
    </div>
  );
}

/* ---------------- Subject: years ---------------- */

export function SubjectScreen({ id }: { id: string }) {
  const s = useStore();
  const sub = SUBJECTS.find((x) => x.id === id);
  if (!sub) return <EmptyState icon="📝" title="រកមិនឃើញមុខវិជ្ជា" sub="មុខវិជ្ជានេះមិនមានទេ" />;
  const years = [...new Set(QUESTIONS.filter((q) => q.subject === id).map((q) => q.year))].sort((a, b) => b - a);

  return (
    <div className="animate-slide-in pb-6">
      <DetailHeader title={sub.name} sub={`${sub.emoji} វិញ្ញាសាបាក់ឌុបតាមឆ្នាំ`} />
      <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl p-4" style={{ background: sub.tint }}>
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/80 text-[30px] shadow-sm">{sub.emoji}</span>
        <div>
          <h1 className="text-[17px] font-bold leading-[1.7] text-ink-900">{sub.name}</h1>
          <p className="text-[11px] text-ink-500">វិញ្ញាសាផ្លូវការមាន {sub.total} សំណួរ · រយៈពេលប្រឡងតាមក្រសួង</p>
        </div>
      </div>

      <div className="mt-4 px-4">
        <h2 className="text-[14px] font-semibold leading-[1.9]">ជ្រើសរើសឆ្នាំប្រឡង</h2>
      </div>
      <div className="mt-2 space-y-2.5 px-4">
        {years.map((y, i) => {
          const qs = QUESTIONS.filter((q) => q.subject === id && q.year === y);
          const done = qs.filter((q) => s.answers[q.id]).length;
          const right = qs.filter((q) => s.answers[q.id]?.correct).length;
          return (
            <button
              key={y}
              onClick={() => s.push({ name: "paper", subjectId: id, year: y })}
              className="tap animate-fade-up flex w-full items-center gap-3.5 rounded-xl border border-line bg-white p-3.5 text-left shadow-sm"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-[13px] font-extrabold text-white shadow-sm" style={{ background: `linear-gradient(140deg, ${sub.color}, ${sub.color}cc)` }}>
                {y}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-semibold text-ink-900">វិញ្ញាសាបាក់ឌុប {y}</span>
                <span className="mt-0.5 block text-[10.5px] text-ink-400">
                  សំណួរគំរូ {qs.length}{done > 0 ? ` · ធ្វើរួច ${done} (ត្រូវ ${right})` : " · មិនទាន់ធ្វើ"}
                </span>
                {done > 0 && (
                  <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-cream">
                    <span className="block h-full rounded-full" style={{ width: `${(done / qs.length) * 100}%`, background: sub.color }} />
                  </span>
                )}
              </span>
              <Icon name="right" className="h-4 w-4 shrink-0 text-ink-300" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Paper: quiz loop ---------------- */

export function PaperScreen({ subjectId, year }: { subjectId: string; year: number }) {
  const s = useStore();
  const sub = SUBJECTS.find((x) => x.id === subjectId)!;
  const qs = useMemo(() => QUESTIONS.filter((q) => q.subject === subjectId && q.year === year), [subjectId, year]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionRight, setSessionRight] = useState(0);

  if (!sub || qs.length === 0) return <EmptyState icon="📝" title="មិនទាន់មានសំណួរ" sub="វិញ្ញាសានេះកំពុងរៀបចំ" />;
  const q = qs[idx];
  const prev = s.answers[q.id];
  const revealed = picked !== null || !!prev;
  const chosen = picked ?? prev?.choice ?? null;
  const isRight = chosen === q.answer;

  const pick = (i: number) => {
    if (revealed) return;
    setPicked(i);
    const correct = i === q.answer;
    if (correct) setSessionRight((r) => r + 1);
    s.answer(q.id, i, correct);
    s.toast(correct ? "ត្រឹមត្រូវ! ពូកែណាស់ 🎉" : "មិនត្រូវទេ — មើលការពន្យល់ខាងក្រោម", correct ? "✅" : "❌");
  };

  const next = () => {
    if (idx < qs.length - 1) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      setShowSummary(true);
    }
  };

  const restart = () => {
    s.clearAnswers(qs.map((x) => x.id));
    setIdx(0);
    setPicked(null);
    setSessionRight(0);
    setShowSummary(false);
    s.toast("ចាប់ផ្តើមវិញ្ញាសាជាថ្មី ✍️", "🔄");
  };

  if (showSummary) {
    const totalRight = qs.filter((x) => s.answers[x.id]?.correct).length;
    const pct = Math.round((totalRight / qs.length) * 100);
    return (
      <div className="animate-slide-in flex h-full flex-col">
        <DetailHeader title={`លទ្ធផល · ${sub.name} ${year}`} />
        <div className="TRA-scroll flex-1 overflow-y-auto px-5 pb-8">
          <div className="animate-pop mx-auto mt-8 max-w-[340px] rounded-3xl border border-line bg-white p-6 text-center shadow-card">
            <div className="text-[44px]">{pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📖"}</div>
            <h2 className="mt-2 text-[17px] font-bold">{pct >= 80 ? "អស្ចារ្យណាស់!" : pct >= 50 ? "ល្អណាស់ បន្តទៀត!" : "កុំបោះបង់!"}</h2>
            <div className="mx-auto mt-4 grid h-28 w-28 place-items-center rounded-full" style={{ background: `conic-gradient(${sub.color} ${pct * 3.6}deg, #f1ece6 0deg)` }}>
              <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-white">
                <div>
                  <div className="text-[22px] font-extrabold" style={{ color: sub.color }}>{pct}%</div>
                  <div className="text-[9px] text-ink-400">ពិន្ទុសរុប</div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[12px] leading-[1.9] text-ink-500">
              ឆ្លើយត្រូវ {totalRight} ក្នុងចំណោម {qs.length} សំណួរ
              {sessionRight > 0 ? ` · ជុំនេះត្រូវ ${sessionRight}` : ""}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={restart} className="tap rounded-full border border-TRA-300 bg-TRA-50 py-2.5 text-[12px] font-bold text-TRA-700">ធ្វើម្តងទៀត</button>
              <button onClick={s.pop} className="tap rounded-full bg-TRA-500 py-2.5 text-[12px] font-bold text-white shadow-card">ត្រឡប់ក្រោយ</button>
            </div>
          </div>

          <h3 className="mt-7 text-[13.5px] font-semibold leading-[1.9]">ពិនិត្យចម្លើយឡើងវិញ</h3>
          <div className="mt-2 space-y-2">
            {qs.map((x, i) => {
              const a = s.answers[x.id];
              return (
                <div key={x.id} className="rounded-xl border border-line bg-white p-3">
                  <div className="flex items-start gap-2">
                    <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white", a?.correct ? "bg-ok-500" : "bg-bad-500")}>
                      <Icon name={a?.correct ? "check" : "x"} className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11.5px] font-medium leading-[1.8] text-ink-900">{i + 1}. {x.text}</div>
                      <div className="mt-1 text-[10.5px] leading-[1.8] text-ok-500">ចម្លើយត្រូវ៖ {KH_CHOICES[x.answer]}. {x.choices[x.answer]}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-in flex h-full flex-col">
      <DetailHeader title={`${sub.name} · ${year}`} sub={`សំណួរ ${idx + 1} / ${qs.length}`} />
      <div className="h-[3px] bg-cream">
        <div className="h-full transition-all duration-300" style={{ width: `${((idx + (revealed ? 1 : 0)) / qs.length) * 100}%`, background: sub.color }} />
      </div>

      <div className="TRA-scroll flex-1 overflow-y-auto">
        <div key={q.id} className="animate-fade-up mx-auto max-w-[560px] px-4 pb-8 pt-5">
          <div className="flex items-center gap-2">
            <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white" style={{ background: sub.color }}>សំណួរ {idx + 1}</span>
            <span className="text-[10.5px] text-ink-400">វិញ្ញាសាបាក់ឌុបឆ្នាំ {year}</span>
            {prev && picked === null && <span className="ml-auto rounded-full bg-cream px-2 py-0.5 text-[9.5px] text-ink-500">បានធ្វើពីមុន</span>}
          </div>

          <div className="mt-3 rounded-2xl border border-line bg-white p-4 shadow-sm">
            <p className="text-[15.5px] font-medium leading-[2] text-ink-900">{q.text}</p>
          </div>

          <div className="mt-3.5 space-y-2.5">
            {q.choices.map((c, i) => {
              const state = !revealed ? "idle" : i === q.answer ? "right" : i === chosen ? "wrong" : "dim";
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={revealed}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all duration-200",
                    state === "idle" && "tap border-line bg-white",
                    state === "right" && "border-ok-500 bg-ok-100/60",
                    state === "wrong" && "border-bad-500 bg-bad-100/60",
                    state === "dim" && "border-line bg-white opacity-50"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-bold transition-colors",
                      state === "right" ? "bg-ok-500 text-white" : state === "wrong" ? "bg-bad-500 text-white" : "bg-cream text-ink-700"
                    )}
                  >
                    {state === "right" ? <Icon name="check" className="h-4 w-4" strokeWidth={3} /> : state === "wrong" ? <Icon name="x" className="h-4 w-4" strokeWidth={3} /> : KH_CHOICES[i]}
                  </span>
                  <span className="text-[13.5px] leading-[1.9] text-ink-900">{c}</span>
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className={cn("animate-pop mt-4 rounded-xl border p-3.5", isRight ? "border-ok-500/40 bg-ok-100/50" : "border-bad-500/40 bg-bad-100/40")}>
              <div className={cn("flex items-center gap-1.5 text-[12.5px] font-bold", isRight ? "text-ok-500" : "text-bad-500")}>
                <Icon name={isRight ? "check" : "info"} className="h-4 w-4" strokeWidth={2.5} />
                {isRight ? "ត្រឹមត្រូវ!" : `ចម្លើយត្រូវគឺ ${KH_CHOICES[q.answer]}`}
              </div>
              <p className="mt-1.5 text-[12.5px] leading-[2] text-ink-700">{q.explain}</p>
            </div>
          )}

          {revealed && (
            <button onClick={next} className="tap animate-fade-up mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-TRA-500 py-3 text-[13.5px] font-bold text-white shadow-card">
              {idx < qs.length - 1 ? <>សំណួរបន្ទាប់ <Icon name="right" className="h-4 w-4" /></> : <>មើលលទ្ធផល <Icon name="trophy" className="h-4 w-4" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}