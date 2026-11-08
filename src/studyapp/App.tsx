import { useEffect, useRef } from "react";
import { IMG } from "./data";
import { StoreProvider, useStore } from "./store";
import type { Screen } from "./store";
import { TabBar, ToastHost } from "./ui";
import { HomeScreen } from "./screens/Home";
import { BookDetailScreen, BooksScreen, CategoryScreen, ReaderScreen } from "./screens/Books";
import { ExamScreen, PaperScreen, SubjectScreen } from "./screens/Exam";
import { MajorScreen, UniScreen, UniversityScreen } from "./screens/Uni";
import { AboutScreen, FavoritesScreen, ProfileScreen, SearchScreen } from "./screens/Profile";

function renderScreen(screen: Screen | null, tab: string) {
  if (screen) {
    switch (screen.name) {
      case "book": return <BookDetailScreen key={`book-${screen.id}`} id={screen.id} />;
      case "reader": return <ReaderScreen key={`reader-${screen.id}-${screen.chapter}`} id={screen.id} chapter={screen.chapter} />;
      case "category": return <CategoryScreen key={`cat-${screen.id}`} id={screen.id} />;
      case "subject": return <SubjectScreen key={`sub-${screen.id}`} id={screen.id} />;
      case "paper": return <PaperScreen key={`paper-${screen.subjectId}-${screen.year}`} subjectId={screen.subjectId} year={screen.year} />;
      case "university": return <UniversityScreen key={`uni-${screen.id}`} id={screen.id} />;
      case "major": return <MajorScreen key={`maj-${screen.uniId}-${screen.majorId}`} uniId={screen.uniId} majorId={screen.majorId} />;
      case "favorites": return <FavoritesScreen />;
      case "search": return <SearchScreen />;
      case "about": return <AboutScreen />;
    }
  }
  switch (tab) {
    case "books": return <BooksScreen />;
    case "exam": return <ExamScreen />;
    case "uni": return <UniScreen />;
    case "profile": return <ProfileScreen />;
    default: return <HomeScreen />;
  }
}

function Shell() {
  const s = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isReader = s.screen?.name === "reader";
  const stackDepth = s.stacks[s.tab].length;

  // Scroll to top whenever the visible screen changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [s.tab, stackDepth, s.screen?.name]);

  return (
    <div className="ambient grain relative flex min-h-dvh items-center justify-center overflow-hidden md:py-6">
      {/* Desktop side branding */}
      <div className="pointer-events-none absolute left-[max(24px,calc(50%-480px))] top-1/2 hidden w-[240px] -translate-y-1/2 lg:block">
        <img src={IMG.rylIcon} alt="" className="animate-float-slow h-16 w-16 rounded-2xl shadow-float" />
        <div className="mt-5 text-[26px] font-extrabold leading-[1.6] text-white">អានដើម្បី<br />រីកចម្រើន</div>
        <div className="mt-2 text-[12px] leading-[2] text-white/50">សៀវភៅអេឡិចត្រូនិច · វិញ្ញាសាបាក់ឌុប · មគ្គុទ្ទេសក៍សាកលវិទ្យាល័យ — គ្រប់យ៉ាងក្នុង TRA APP។</div>
        <div className="mt-4 flex items-center gap-2 text-[10.5px] text-TRA-300/80">
          <span className="h-px w-8 bg-TRA-500/50" /> Read to Grow
        </div>
      </div>
      <div className="pointer-events-none absolute right-[max(24px,calc(50%-480px))] top-1/2 hidden w-[220px] -translate-y-1/2 lg:block">
        <div className="space-y-3">
          {[["📚", "បណ្ណាល័យខ្មែរឥតគិតថ្លៃ"], ["🎓", "វិញ្ញាសាបាក់ឌុប ២០២៣–២០២៥"], ["🏛️", "ជំនាញ និងថ្លៃសិក្សាពិត"], ["🔖", "ចំណាំ និងវឌ្ឍនភាពអាន"]].map(([i, t]) => (
            <div key={t} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur-sm">
              <span className="text-[20px]">{i}</span>
              <span className="text-[11.5px] leading-[1.8] text-white/75">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* App frame */}
      <div className="relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#f2f2f7] md:h-[min(900px,94dvh)] md:rounded-[30px] md:border md:border-white/15 md:shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
        {isReader ? (
          <div className="h-full">{renderScreen(s.screen, s.tab)}</div>
        ) : (
          <>
            <div ref={scrollRef} className="TRA-scroll flex-1 overflow-y-auto overscroll-contain">
              {renderScreen(s.screen, s.tab)}
            </div>
            <TabBar />
          </>
        )}
        <ToastHost />
      </div>
    </div>
  );
}

export default function StudyApp() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}