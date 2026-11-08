import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

export type TabId = "home" | "books" | "exam" | "uni" | "profile";

export type Screen =
  | { name: "book"; id: string }
  | { name: "reader"; id: string; chapter: number }
  | { name: "category"; id: string }
  | { name: "subject"; id: string }
  | { name: "paper"; subjectId: string; year: number }
  | { name: "university"; id: string }
  | { name: "major"; uniId: string; majorId: string }
  | { name: "favorites" }
  | { name: "search" }
  | { name: "about" };

export interface Progress {
  chapter: number;
  pct: number;
  at: number;
}

interface Persisted {
  favorites: string[];
  progress: Record<string, Progress>;
  answers: Record<string, { choice: number; correct: boolean }>;
  extraViews: Record<string, number>;
  user: { name: string; email: string } | null;
  installDismissed: boolean;
  readerFont: number;
}

const KEY = "TRA-app-state-v1";

const load = (): Persisted => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { favorites: [], progress: {}, answers: {}, extraViews: {}, user: null, installDismissed: false, readerFont: 17, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { favorites: [], progress: {}, answers: {}, extraViews: {}, user: null, installDismissed: false, readerFont: 17 };
};

export interface Toast {
  id: number;
  text: string;
  icon?: string;
}

interface Store extends Persisted {
  tab: TabId;
  stacks: Record<TabId, Screen[]>;
  screen: Screen | null;
  toasts: Toast[];
  switchTab: (t: TabId) => void;
  openTab: (t: TabId, screen?: Screen) => void;
  clearAnswers: (qids: string[]) => void;
  push: (s: Screen) => void;
  pop: () => void;
  popTo: (depth: number) => void;
  toggleFavorite: (bookId: string) => void;
  setProgress: (bookId: string, p: Progress) => void;
  answer: (qid: string, choice: number, correct: boolean) => void;
  bumpView: (key: string) => void;
  signIn: (name: string, email: string) => void;
  signOut: () => void;
  dismissInstall: () => void;
  setReaderFont: (n: number) => void;
  toast: (text: string, icon?: string) => void;
}

const Ctx = createContext<Store | null>(null);

const emptyStacks = (): Record<TabId, Screen[]> => ({ home: [], books: [], exam: [], uni: [], profile: [] });

export function StoreProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<Persisted>(load);
  const [tab, setTab] = useState<TabId>("home");
  const [stacks, setStacks] = useState<Record<TabId, Screen[]>>(emptyStacks);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(persisted));
    } catch {
      /* ignore */
    }
  }, [persisted]);

  const patch = useCallback((p: Partial<Persisted>) => setPersisted((s) => ({ ...s, ...p })), []);

  const toast = useCallback((text: string, icon?: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, text, icon }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const switchTab = useCallback((t: TabId) => {
    setTab((cur) => {
      if (cur === t) setStacks((s) => ({ ...s, [t]: [] }));
      return t;
    });
  }, []);

  const openTab = useCallback((t: TabId, screen?: Screen) => {
    setStacks((st) => ({ ...st, [t]: screen ? [screen] : [] }));
    setTab(t);
  }, []);

  const clearAnswers = useCallback((qids: string[]) => {
    setPersisted((s) => {
      const next = { ...s.answers };
      qids.forEach((q) => delete next[q]);
      return { ...s, answers: next };
    });
  }, []);

  const push = useCallback((s: Screen) => setStacks((st) => ({ ...st, [tab]: [...st[tab], s] })), [tab]);
  const pop = useCallback(() => setStacks((st) => ({ ...st, [tab]: st[tab].slice(0, -1) })), [tab]);
  const popTo = useCallback((depth: number) => setStacks((st) => ({ ...st, [tab]: st[tab].slice(0, depth) })), [tab]);

  const toggleFavorite = useCallback(
    (bookId: string) => {
      setPersisted((s) => {
        const has = s.favorites.includes(bookId);
        return { ...s, favorites: has ? s.favorites.filter((f) => f !== bookId) : [...s.favorites, bookId] };
      });
    },
    []
  );

  const setProgress = useCallback((bookId: string, p: Progress) => {
    setPersisted((s) => {
      const prev = s.progress[bookId];
      if (prev && prev.pct >= p.pct && p.pct < 100) return { ...s, progress: { ...s.progress, [bookId]: { ...p, pct: prev.pct } } };
      return { ...s, progress: { ...s.progress, [bookId]: p } };
    });
  }, []);

  const answer = useCallback((qid: string, choice: number, correct: boolean) => {
    setPersisted((s) => ({ ...s, answers: { ...s.answers, [qid]: { choice, correct } } }));
  }, []);

  const bumpView = useCallback((key: string) => {
    setPersisted((s) => ({ ...s, extraViews: { ...s.extraViews, [key]: (s.extraViews[key] || 0) + 1 } }));
  }, []);

  const signIn = useCallback((name: string, email: string) => patch({ user: { name, email } }), [patch]);
  const signOut = useCallback(() => patch({ user: null }), [patch]);
  const dismissInstall = useCallback(() => patch({ installDismissed: true }), [patch]);
  const setReaderFont = useCallback((n: number) => patch({ readerFont: Math.min(23, Math.max(14, n)) }), [patch]);

  const value = useMemo<Store>(
    () => ({
      ...persisted,
      tab,
      stacks,
      screen: stacks[tab][stacks[tab].length - 1] ?? null,
      toasts,
      switchTab,
      openTab,
      clearAnswers,
      push,
      pop,
      popTo,
      toggleFavorite,
      setProgress,
      answer,
      bumpView,
      signIn,
      signOut,
      dismissInstall,
      setReaderFont,
      toast,
    }),
    [persisted, tab, stacks, toasts, switchTab, openTab, clearAnswers, push, pop, popTo, toggleFavorite, setProgress, answer, bumpView, signIn, signOut, dismissInstall, setReaderFont, toast]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}