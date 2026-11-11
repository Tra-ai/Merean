import { useEffect, useMemo, useState } from "react";
import { BOOKS, IMG, SUBJECTS, UNIVERSITIES, fmt } from "../data";
import type { Book } from "../data";
import { useStore } from "../store";
import { TopBar } from "../ui";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function Spine({ book }: { book: Book }) {
  if (book.art) {
    return (
      <>
        <img src={book.art} alt="" loading="lazy" />
        <span className="cap">{book.title}</span>
      </>
    );
  }
  return <>{book.title}</>;
}

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
  const stack = useMemo(() => BOOKS.filter((b) => b.art).slice(0, 3), []);
  const shelf = useMemo(() => [...BOOKS].sort((a, b) => b.views - a.views).slice(0, 8), []);

  const openBook = (id: string) => { s.bumpView(`book:${id}`); s.push({ name: "book", id }); };

  const contents = [
    { label: "សៀវភៅ", desc: "អានតាមជំពូក ហើយចាប់បន្តពីកន្លែងដែលឈប់", n: BOOKS.length, unit: "ក្បាល", go: () => s.switchTab("books") },
    { label: "វិញ្ញាសាបាក់ឌុប", desc: "វិញ្ញាសាចាស់ៗ និងសំណួរពហុជម្រើស", n: SUBJECTS.length, unit: "មុខវិជ្ជា", go: () => s.switchTab("exam") },
    { label: "សាកលវិទ្យាល័យ", desc: "ជំនាញ ទីតាំង និងប្រភេទសាកល", n: UNIVERSITIES.length, unit: "សាកល", go: () => s.switchTab("uni") },
    { label: "ចំណាំរបស់ខ្ញុំ", desc: "សៀវភៅដែលអ្នកបានរក្សាទុក", n: s.favorites.length, unit: "ក្បាល", go: () => s.push({ name: "favorites" }) },
  ];

  return (
    <div className="sb-home">
      <TopBar
        wide
        onSearch={() => s.push({ name: "search" })}
        onBell={() => s.toast("វិញ្ញាសាបាក់ឌុប ២០២៥ ថ្មីទើបបន្ថែម! 🎓", "🔔")}
      />

      <div className="sb-wrap">
        {!s.installDismissed && !standalone && (
          <div className="sb-note">
            <img src={IMG.rylIcon} alt="" />
            <p><strong>ដំឡើង TRA APP លើទូរស័ព្ទ</strong>បើកលឿនពីអេក្រង់ដើម</p>
            <button className="go" onClick={install}>ដំឡើង</button>
            <button className="x" onClick={s.dismissInstall} aria-label="បិទ">×</button>
          </div>
        )}

        <section className="sb-page">
          <div className="sb-holes" aria-hidden />
          <div className="sb-hero">
            <div>
              <h1>អានដើម្បីរីកចម្រើន</h1>
              <p>សៀវភៅអេឡិចត្រូនិច វិញ្ញាសាបាក់ឌុប និងមគ្គុទ្ទេសក៍សាកលវិទ្យាល័យ នៅកន្លែងតែមួយ។</p>
              <div className="sb-cta">
                <button className="sb-btn main" onClick={() => s.switchTab("books")}>ចាប់ផ្តើមអាន</button>
                <button className="sb-btn" onClick={() => s.switchTab("exam")}>ធ្វើវិញ្ញាសា</button>
              </div>
            </div>
            <div className="sb-covers">
              {stack.map((b) => (
                <button key={b.id} className="sb-cover" onClick={() => openBook(b.id)} aria-label={b.title}>
                  <img src={b.art} alt="" />
                </button>
              ))}
            </div>
          </div>

          <ul className="sb-toc">
            {contents.map((c) => (
              <li key={c.label}>
                <button className="sb-row" onClick={c.go}>
                  <span className="l1">
                    <span>{c.label}</span>
                    <span className="dots" aria-hidden />
                    <span className="n">{fmt(c.n)}<small>{c.unit}</small></span>
                  </span>
                  <span className="l2">{c.desc}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="sb-shelf">
          <h2>សៀវភៅដែលគេអានច្រើនជាងគេ</h2>
          <div className="sb-books">
            {shelf.map((b) => (
              <button
                key={b.id}
                className={b.art ? "sb-book" : "sb-book typo"}
                style={b.art ? undefined : { background: b.typo!.bg, color: b.typo!.fg }}
                onClick={() => openBook(b.id)}
                aria-label={b.title}
              >
                <Spine book={b} />
              </button>
            ))}
          </div>
        </section>

        <footer className="sb-foot"><b>TRA APP</b> · Read to Grow · v36</footer>
      </div>
    </div>
  );
}
