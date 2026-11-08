import { useEffect, useState } from "react";
import { IMG } from "../data";
import library from "../../libraryapp/data/library.json";
import Reader from "../../libraryapp/components/Reader";
import { NoteIcon } from "../../libraryapp/components/Library";
import type { Story } from "../../libraryapp/types";
import { useStore } from "../store";
import { Icon, SectionTitle, TopBar } from "../ui";
import Translator from "../Translator";
import Dictionary from "../Dictionary";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function HomeScreen() {
  const s = useStore();
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [openStory, setOpenStory] = useState<Story | null>(null);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [dictOpen, setDictOpen] = useState(false);
  useEffect(() => {
    const capture = (e: Event) => { e.preventDefault(); setInstallEvent(e as InstallEvent); };
    const installed = () => { setInstallEvent(null); s.dismissInstall(); s.toast("TRA APP ត្រូវបានដំឡើងរួចរាល់ ✓", "📲"); };
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", installed);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function install() {
    if (installEvent) {
      await installEvent.prompt();
      await installEvent.userChoice.catch(() => undefined);
      setInstallEvent(null);
    } else {
      s.toast("បើកម៉ឺនុយ Browser រួចចុច «បន្ថែមទៅអេក្រង់ដើម» 📲", "ℹ️");
    }
  }

  const standalone = typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches;
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
      {!s.installDismissed && !standalone && (
        <div className="animate-fade-up mx-4 mt-3" style={{ animationDelay: "80ms" }}>
          <div className="relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-TRA-200 bg-gradient-to-r from-TRA-50 to-TRA-100 p-2.5">
            <button
              className="tap-img flex min-w-0 flex-1 items-center gap-2.5 text-left"
              onClick={install}
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
        <button
          onClick={() => setTranslateOpen(true)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-black/5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-TRA-50 text-[18px]">🌐</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-medium leading-[1.8] text-ink-900">បកប្រែ</span>
            <span className="block text-[11px] leading-tight text-ink-400">ខ្មែរ ⇄ English និងភាសាផ្សេងទៀត</span>
          </span>
          <Icon name="right" className="h-4 w-4 shrink-0 text-[#c7c7cc]" strokeWidth={2.6} />
        </button>
      </div>

      {/* Dictionary box */}
      <div className="mx-4 mt-3 overflow-hidden rounded-xl bg-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => setDictOpen(true)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-black/5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-TRA-50 text-[18px]">📖</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-medium leading-[1.8] text-ink-900">វចនានុក្រម</span>
            <span className="block text-[11px] leading-tight text-ink-400">ស្វែងរកន័យពាក្យខ្មែរ</span>
          </span>
          <Icon name="right" className="h-4 w-4 shrink-0 text-[#c7c7cc]" strokeWidth={2.6} />
        </button>
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
            <div className="mx-4 grid grid-cols-2 gap-3">
              {stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => setOpenStory(story)}
                  className="tap flex min-h-[118px] flex-col justify-between rounded-2xl bg-white p-3.5 text-left shadow-card"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-TRA-50 text-TRA-600"><NoteIcon size={20} /></span>
                  <span className="mt-3 block text-[15px] font-semibold leading-[1.7] text-ink-900">{story.title}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {translateOpen && <Translator onClose={() => setTranslateOpen(false)} />}
      {dictOpen && <Dictionary onClose={() => setDictOpen(false)} />}
      {openStory && <Reader key={openStory.id} story={openStory} onClose={() => setOpenStory(null)} />}
    </div>
  );
}
