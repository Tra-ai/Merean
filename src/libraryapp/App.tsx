import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, IdCard, Lightbulb, LogOut, UsersRound, X } from 'lucide-react';
import Header, { MobileNavigation } from './components/Header';
import Library from './components/Library';
import Reader from './components/Reader';
import Dialog from './components/Dialog';
import { AuthPage, HomePage, InformationPage, InstallPage, ProfilePage } from './components/SecondaryPages';
import library from './data/library.json';
import labels from './data/labels.json';
import type { InstallPrompt, PageView, Profile } from './types';

const views: PageView[] = ['library', 'home', 'install', 'sign-in', 'sign-up', 'profile', 'team', 'about', 'contact', 'writing-tips', 'essay-plans', 'linking-words'];

function currentRoute() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view') as PageView;
  return { view: views.includes(view) ? view : 'library' as PageView, story: params.get('story') };
}

function savedProfile(): Profile | null {
  try {
    const value = JSON.parse(localStorage.getItem('TRA-local-profile') || 'null') as Profile | null;
    return value && typeof value.name === 'string' && typeof value.email === 'string' ? value : null;
  } catch { return null; }
}

export default function LibraryApp() {
  const [route, setRoute] = useState(currentRoute);
  const [profile, setProfile] = useState<Profile | null>(savedProfile);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<number[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState('');
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dialogTriggerRef = useRef<HTMLElement | null>(null);
  const selectedStory = route.view === 'library' ? library.stories.find((story) => story.id === route.story) : undefined;

  const navigate = useCallback((view: PageView, story?: string, replace = false) => {
    if (story) dialogTriggerRef.current = document.activeElement as HTMLElement;
    const url = new URL(window.location.href);
    if (view === 'library') url.searchParams.delete('view');
    else url.searchParams.set('view', view);
    if (story) url.searchParams.set('story', story);
    else url.searchParams.delete('story');
    const state = { TRA: true, reader: !!story };
    if (replace) window.history.replaceState(state, '', url);
    else window.history.pushState(state, '', url);
    setRoute({ view, story: story || null });
    setMobileMenu(false);
  }, []);

  useEffect(() => {
    const pop = () => { setRoute(currentRoute()); setMobileMenu(false); };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [route.view]);
  useEffect(() => {
    if (selectedStory || mobileMenu || !dialogTriggerRef.current) return;
    const frame = requestAnimationFrame(() => {
      if (dialogTriggerRef.current?.isConnected) dialogTriggerRef.current.focus({ preventScroll: true });
      dialogTriggerRef.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedStory, mobileMenu]);
  useEffect(() => { document.title = selectedStory ? `${selectedStory.title} | TRA APP` : 'TRA APP'; }, [selectedStory]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    function capturePrompt(event: Event) { event.preventDefault(); setInstallPrompt(event as InstallPrompt); }
    window.addEventListener('beforeinstallprompt', capturePrompt);
    return () => window.removeEventListener('beforeinstallprompt', capturePrompt);
  }, []);

  function closeReader() {
    if (window.history.state?.reader) window.history.back();
    else navigate('library', undefined, true);
  }

  function saveProfile(value: Profile) {
    try {
      localStorage.setItem('TRA-local-profile', JSON.stringify(value));
      setProfile(value);
      return true;
    } catch { setToast('Your profile could not be saved. Please allow browser storage.'); return false; }
  }

  function signOut() {
    try { localStorage.removeItem('TRA-local-profile'); } catch { /* Clear the in-memory profile even when storage is unavailable. */ }
    setProfile(null);
    navigate('library');
    setToast('You have signed out of your local profile.');
  }

  async function installApp() {
    if (!installPrompt) { setToast('Open your browser menu and choose Install app or Add to Home Screen.'); return; }
    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === 'accepted') setToast('TRA APP has been added to your device.');
      setInstallPrompt(null);
    } catch { setToast('Please use your browser menu to add TRA APP to your home screen.'); }
  }

  const isAuth = route.view === 'sign-in' || route.view === 'sign-up';
  return <>
    <div className="app-shell" inert={!!selectedStory || mobileMenu}>
      {isAuth ? <AuthPage key={route.view} signUp={route.view === 'sign-up'} onNavigate={navigate} onComplete={(value) => {
        if (!saveProfile(value)) return false;
        navigate('library');
        setToast('Your local profile is ready. Welcome to TRA APP.');
        return true;
      }} /> : <>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Header view={route.view} profile={profile} onNavigate={navigate} onSignOut={signOut} onOpenMobileMenu={() => {
          dialogTriggerRef.current = document.activeElement as HTMLElement;
          setMobileMenu(true);
        }} />
        <div className={`page-scroll ${selectedStory ? 'scroll-locked' : ''}`} ref={scrollRef}>
          {route.view === 'library' && <Library onNavigate={navigate} query={query} onQueryChange={setQuery} filters={filters} onFiltersChange={setFilters} />}
          {route.view === 'home' && <HomePage onNavigate={navigate} />}
          {route.view === 'install' && <InstallPage onInstall={installApp} />}
          {route.view === 'profile' && (profile ? <ProfilePage profile={profile} onSave={saveProfile} onSignOut={signOut} /> : <div className="page-container empty-state"><h1>Create a local profile</h1><button className="button button-primary" onClick={() => navigate('sign-up')}>Sign Up</button></div>)}
          {!['library', 'home', 'install', 'profile'].includes(route.view) && <InformationPage view={route.view} onNavigate={navigate} />}
        </div>
        <MobileNavigation view={route.view} profile={profile} onNavigate={navigate} />
      </>}
    </div>
    {selectedStory && <Reader key={selectedStory.id} story={selectedStory} onClose={closeReader} />}
    {mobileMenu && <Dialog title="TRA APP" className="mobile-drawer" onClose={() => setMobileMenu(false)}>
      <div className="drawer-content">
        <img src="/assets/TRA-logo.png" width="64" height="64" alt="TRA APP" />
        <button onClick={() => navigate('team')}><IdCard size={20} />{labels.team}</button>
        <button onClick={() => navigate('about')}><Lightbulb size={20} />{labels.about}</button>
        <button onClick={() => navigate('contact')}><UsersRound size={20} />{labels.contact}</button>
        <div className="drawer-auth">{profile ? <button className="button button-outline" onClick={signOut}><LogOut size={17} />Sign Out</button> : <>
          <button className="button button-primary" onClick={() => navigate('sign-up')}>Sign Up</button>
          <button className="button button-outline" onClick={() => navigate('sign-in')}>Sign In</button>
        </>}</div>
      </div>
    </Dialog>}
    {toast && <div className="toast" role="status"><Check size={18} /><span>{toast}</span><button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={16} /></button></div>}
  </>;
}
