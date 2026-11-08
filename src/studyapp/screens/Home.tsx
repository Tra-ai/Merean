import { useState } from "react";
import { IMG, MENU } from "../data";
import library from "../../libraryapp/data/library.json";
import Reader from "../../libraryapp/components/Reader";
import { NoteIcon } from "../../libraryapp/components/Library";
import type { Story } from "../../libraryapp/types";
import { useStore } from "../store";
import { HeroCarousel, Icon, SectionTitle, TopBar } from "../ui";

export function HomeScreen() {
  const s = useStore();
  const [openStory, setOpenStory] = useState<Story | null>(null);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "អរុណសួស្តី ☀️" : hour < 17 ? "ទិវាសួស្តី 🌤️" : "សាយណ្ហសួស្តី 🌙";

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

      {/* អក្សរសាស្ត្រ — stories from the library */}
      {library.categories.map((category, index) => {
        const stories = (library.stories as Story[]).filter((story) => story.category === index);
        if (!stories.length) return null;
        return (
          <div key={category} className="mt-6">
            <SectionTitle>
              <span className="inline-flex items-center gap-2"><NoteIcon size={20} />{category}</span>
            </SectionTitle>
            <div className="grid grid-cols-1 gap-2 px-4">
              {stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => setOpenStory(story)}
                  className="tap flex w-full items-center rounded-xl border border-line bg-white px-3.5 py-3 text-left text-[13.5px] font-medium leading-[1.8] text-ink-900 shadow-sm"
                >
                  {story.title}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {openStory && <Reader key={openStory.id} story={openStory} onClose={() => setOpenStory(null)} />}
    </div>
  );
}
