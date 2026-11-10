import { useEffect, useState } from "react";
import { IMG } from "../data";
import { useStore } from "../store";
import { Icon, TopBar } from "../ui";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function HomeScreen() {
  const s = useStore();
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
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
        <h1 className="mt-0.5 text-[19px] font-bold leading-[1.7] text-ink-900 md:text-[30px]">
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

      <div className="mt-10 text-center text-[11px] text-white/60">TRA APP · v35</div>
    </div>
  );
}
