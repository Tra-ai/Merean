import { useState } from "react";
import { IMG } from "../data";
import library from "../../libraryapp/data/library.json";
import Reader from "../../libraryapp/components/Reader";
import { NoteIcon } from "../../libraryapp/components/Library";
import type { Story } from "../../libraryapp/types";
import { useStore } from "../store";
import { Icon, SectionTitle, TopBar } from "../ui";

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
        <div className="text-[12px] text-ink-900/70">{greet}</div>
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

      <div className="mt-4 px-4">
        <button
          onClick={() => setOpenStory((library.stories as Story[]).find((story) => story.id === "story-1") ?? null)}
          className="tap block w-full overflow-hidden rounded-2xl shadow-card"
          aria-label="រឿង គូលីកំណែន"
        >
          <img src="/images/kuli-banner.jpg" alt="រឿង គូលីកំណែន" className="block h-auto w-full" />
        </button>
      </div>

      {/* Translate box */}
      <div className="mx-4 mt-4 overflow-hidden rounded-xl bg-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.06)]">
        <a
          href="https://translate.google.com/?sl=en&tl=km&op=translate"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-3 px-4 py-3 active:bg-black/5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-TRA-50 text-[18px]">🌐</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-medium leading-[1.8] text-ink-900">បកប្រែ</span>
            <span className="block text-[11px] leading-tight text-ink-400">អង់គ្លេស ⇄ ខ្មែរ</span>
          </span>
          <Icon name="right" className="h-4 w-4 shrink-0 text-[#c7c7cc]" strokeWidth={2.6} />
        </a>
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
            <div className="mx-4 overflow-hidden rounded-xl bg-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.06)]">
              {stories.map((story, i) => (
                <button
                  key={story.id}
                  onClick={() => setOpenStory(story)}
                  className={"flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[15px] leading-[1.8] text-ink-900 active:bg-black/5" + (i > 0 ? " border-t border-black/10" : "")}
                >
                  <span className="min-w-0 flex-1">{story.title}</span>
                  <Icon name="right" className="h-4 w-4 shrink-0 text-[#c7c7cc]" strokeWidth={2.6} />
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
