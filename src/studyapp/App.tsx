import { useEffect } from "react";
import { StoreProvider, useStore } from "./store";
import type { Screen } from "./store";
import { ToastHost } from "./ui";
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
  const isReader = s.screen?.name === "reader";
  const stackDepth = s.stacks[s.tab].length;

  // Scroll to top whenever the visible page changes
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [s.tab, stackDepth, s.screen?.name]);

  return (
    <div className="relative min-h-dvh bg-[#b98b5e]">
      {isReader ? (
        <div className="h-dvh">{renderScreen(s.screen, s.tab)}</div>
      ) : (
        <main className="mx-auto w-full max-w-[880px] pb-12">{renderScreen(s.screen, s.tab)}</main>
      )}
      <ToastHost />
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