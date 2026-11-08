import { useMemo, useState } from "react";
import { UNIVERSITIES, fmt } from "../data";
import { useStore } from "../store";
import { Chip, DetailHeader, EmptyState, Icon, TopBar } from "../ui";
import { cn } from "../utils/cn";

/* ---------------- University list ---------------- */

export function UniScreen() {
  const s = useStore();
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "សាធារណៈ" | "ឯកជន">("all");

  const list = useMemo(
    () =>
      UNIVERSITIES.filter(
        (u) =>
          (type === "all" || u.type === type) &&
          (q.trim() === "" ||
            (u.name + u.short + u.majors.map((m) => m.name).join(" ")).toLowerCase().includes(q.trim().toLowerCase()))
      ),
    [q, type]
  );

  return (
    <div className="animate-fade-up pb-6">
      <TopBar onSearch={() => s.push({ name: "search" })} onBell={() => s.toast("រដូវចុះឈ្មោះចូលរៀន ២០២៦ ជិតមកដល់ហើយ 🎓", "🔔")} />
      <div className="px-4 pt-3">
        <h1 className="text-[19px] font-bold leading-[1.7]">មគ្គុទ្ទេសក៍សាកលវិទ្យាល័យ 🏛️</h1>
        <p className="text-[11.5px] text-ink-400">ស្វែងយល់ពីជំនាញ ថ្លៃសិក្សា និងឱកាសការងារ</p>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 shadow-sm focus-within:border-TRA-400 focus-within:ring-2 focus-within:ring-TRA-100">
          <Icon name="search" className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ស្វែងរកសាកលវិទ្យាល័យ ឬជំនាញ…"
            className="w-full bg-transparent text-[13px] leading-[1.8] outline-none placeholder:text-ink-300"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="សម្អាត" className="tap grid h-5 w-5 place-items-center rounded-full bg-cream text-ink-400">
              <Icon name="x" className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <Chip active={type === "all"} onClick={() => setType("all")}>ទាំងអស់</Chip>
          <Chip active={type === "សាធារណៈ"} onClick={() => setType("សាធារណៈ")}>🏛️ សាធារណៈ</Chip>
          <Chip active={type === "ឯកជន"} onClick={() => setType("ឯកជន")}>🏢 ឯកជន</Chip>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon="🏛️" title="រកមិនឃើញ" sub={`គ្មានលទ្ធផលសម្រាប់ «${q}» ទេ`} action="មើលទាំងអស់" onAction={() => { setQ(""); setType("all"); }} />
      ) : (
        <div className="mt-3.5 space-y-3 px-4">
          {list.map((u, i) => (
            <button
              key={u.id}
              onClick={() => { s.bumpView(`uni:${u.id}`); s.push({ name: "university", id: u.id }); }}
              className="tap animate-fade-up flex w-full items-center gap-3.5 rounded-2xl border border-line bg-white p-3.5 text-left shadow-sm"
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-[13px] font-extrabold tracking-wide text-white shadow-sm" style={{ background: `linear-gradient(140deg, ${u.color}, ${u.color}bb)` }}>
                {u.short}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-[13px] font-semibold leading-[1.8] text-ink-900">{u.name}</span>
                <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] text-ink-400">
                  <span className="flex items-center gap-0.5">📍 {u.location}</span>
                  <span className={cn("rounded-full px-1.5 py-px text-[9px] font-semibold", u.type === "សាធារណៈ" ? "bg-ok-100 text-ok-500" : "bg-[#EAF1FB] text-info-500")}>{u.type}</span>
                  <span>{u.majors.length} ជំនាញ</span>
                </span>
                <span className="mt-1 flex items-center gap-1 text-[9.5px] text-ink-300">
                  <Icon name="eye" className="h-3 w-3" /> មើល {fmt(u.views + (s.extraViews[`uni:${u.id}`] || 0))} ដង
                </span>
              </span>
              <Icon name="right" className="h-4 w-4 shrink-0 text-ink-300" />
            </button>
          ))}
        </div>
      )}

      <div className="mx-4 mt-5 flex items-start gap-2.5 rounded-xl border border-TRA-200 bg-TRA-50 p-3">
        <span className="text-[18px]">🧭</span>
        <p className="text-[11.5px] leading-[1.9] text-ink-700">
          <span className="font-semibold text-TRA-800">របៀបជ្រើសជំនាញ៖</span> គិតពីចំណូលចិត្ត + សមត្ថភាព + ទីផ្សារការងារ។ ថ្លៃសិក្សាខាងលើជាតម្លៃប៉ាន់ស្មានក្នុងមួយឆ្នាំ។
        </p>
      </div>
    </div>
  );
}

/* ---------------- University detail ---------------- */

export function UniversityScreen({ id }: { id: string }) {
  const s = useStore();
  const u = UNIVERSITIES.find((x) => x.id === id);
  if (!u) return <EmptyState icon="🏛️" title="រកមិនឃើញ" sub="សាកលវិទ្យាល័យនេះមិនមានទេ" />;

  return (
    <div className="animate-slide-in pb-8">
      <DetailHeader title={u.short} sub={u.name} />
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(150deg, ${u.color}22, transparent 65%)` }} />
        <div className="relative px-4 pb-2 pt-5">
          <div className="flex items-center gap-3.5">
            <span className="grid h-16 w-16 shrink-0 animate-pop place-items-center rounded-2xl text-[15px] font-extrabold text-white shadow-card" style={{ background: `linear-gradient(140deg, ${u.color}, ${u.color}bb)` }}>
              {u.short}
            </span>
            <div className="min-w-0">
              <h1 className="text-[15.5px] font-bold leading-[1.8] text-ink-900">{u.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10.5px] text-ink-500">
                <span>📍 {u.location}</span>
                <span>· បង្កើតឆ្នាំ {u.founded}</span>
                <span className={cn("rounded-full px-1.5 py-px text-[9px] font-semibold", u.type === "សាធារណៈ" ? "bg-ok-100 text-ok-500" : "bg-[#EAF1FB] text-info-500")}>{u.type}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-line bg-white py-2.5 shadow-sm">
              <div className="text-[15px] font-bold" style={{ color: u.color }}>{u.majors.length}</div>
              <div className="text-[9px] text-ink-400">ជំនាញ</div>
            </div>
            <div className="rounded-xl border border-line bg-white py-2.5 shadow-sm">
              <div className="text-[15px] font-bold" style={{ color: u.color }}>{new Date().getFullYear() - u.founded}+</div>
              <div className="text-[9px] text-ink-400">ឆ្នាំបទពិសោធ</div>
            </div>
            <div className="rounded-xl border border-line bg-white py-2.5 shadow-sm">
              <div className="text-[15px] font-bold" style={{ color: u.color }}>${Math.min(...u.majors.map((m) => m.price))}+</div>
              <div className="text-[9px] text-ink-400">ក្នុងមួយឆ្នាំ</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 px-4">
        <h2 className="text-[15px] font-semibold leading-[1.9]">ជំនាញ និងថ្លៃសិក្សា</h2>
        <p className="text-[10.5px] text-ink-400">ចុចលើជំនាញ ដើម្បីមើលព័ត៌មានលម្អិត</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 px-4">
        {u.majors.map((m, i) => (
          <button
            key={m.id}
            onClick={() => s.push({ name: "major", uniId: u.id, majorId: m.id })}
            className="tap animate-fade-up rounded-2xl border border-line bg-white px-3 py-4 text-center shadow-sm"
            style={{ animationDelay: `${i * 55}ms` }}
          >
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-full text-[20px]" style={{ background: `${u.color}14` }}>
              {["🎓", "📚", "🔬", "💼", "🛠️", "🌱"][i % 6]}
            </span>
            <span className="mt-2 block min-h-[44px] text-[13px] font-medium leading-[1.8] text-ink-900">{m.name}</span>
            <span className="mt-1 block text-[12.5px] font-bold" style={{ color: u.color }}>${fmt(m.price)}<span className="text-[9.5px] font-normal text-ink-400"> /ឆ្នាំ</span></span>
            <span className="mt-0.5 block text-[9.5px] text-ink-400">រយៈពេល {m.years} ឆ្នាំ</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Major detail ---------------- */

export function MajorScreen({ uniId, majorId }: { uniId: string; majorId: string }) {
  const s = useStore();
  const u = UNIVERSITIES.find((x) => x.id === uniId);
  const m = u?.majors.find((x) => x.id === majorId);
  if (!u || !m) return <EmptyState icon="🎓" title="រកមិនឃើញជំនាញ" sub="ជំនាញនេះមិនមានទេ" />;

  return (
    <div className="animate-slide-in pb-8">
      <DetailHeader title={m.name} sub={u.name} />
      <div className="mx-4 mt-4 overflow-hidden rounded-2xl text-white shadow-card" style={{ background: `linear-gradient(130deg, ${u.color}, ${u.color}cc)` }}>
        <div className="relative p-4">
          <span className="animate-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="text-[10px] font-bold tracking-[0.16em] text-white/75">{u.short} · {u.type}</div>
          <h1 className="mt-1 text-[18px] font-bold leading-[1.8]">{m.name}</h1>
          <div className="mt-3 flex gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/25">💵 ${fmt(m.price)} /ឆ្នាំ</span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/25">⏱️ {m.years} ឆ្នាំ</span>
          </div>
        </div>
      </div>

      <div className="mt-5 px-4">
        <h2 className="text-[14px] font-semibold leading-[1.9]">អំពីជំនាញនេះ</h2>
        <p className="mt-1 text-[13.5px] leading-[2.1] text-ink-700">{m.desc}</p>
      </div>

      <div className="mt-5 px-4">
        <h2 className="text-[14px] font-semibold leading-[1.9]">ឱកាសការងារ</h2>
        <div className="mt-2 space-y-2">
          {m.careers.map((c, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-3.5 py-2.5 shadow-sm">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white" style={{ background: u.color }}>
                <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.8} />
              </span>
              <span className="text-[12.5px] leading-[1.8] text-ink-900">{c}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-5 rounded-xl border border-TRA-200 bg-TRA-50 p-3.5">
        <div className="flex items-center gap-1.5 text-[12px] font-bold text-TRA-800">
          <Icon name="info" className="h-4 w-4" /> ព័ត៌មានចុះឈ្មោះ
        </div>
        <p className="mt-1.5 text-[11.5px] leading-[2] text-ink-700">
          ការចុះឈ្មោះជាទូទៅចាប់ផ្តើមក្រោយប្រកាសលទ្ធផលបាក់ឌុប។ សិស្សដែលមាននិទ្ទេស A អាចទទួលបានអាហារូបករណ៍ពេញលេញ ឬបន្ថយថ្លៃសិក្សាតាមគោលនយោបាយរបស់គ្រឹះស្ថាន។
        </p>
        <button
          onClick={() => s.toast(`បានរក្សាទុក ${m.name} · ${u.short} ✓`, "🎓")}
          className="tap mt-3 w-full rounded-full bg-TRA-500 py-2.5 text-[12.5px] font-bold text-white shadow-card"
        >
          រក្សាទុកជំនាញនេះ
        </button>
      </div>
    </div>
  );
}