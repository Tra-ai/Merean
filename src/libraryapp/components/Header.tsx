import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, Download, IdCard, Lightbulb, LogOut, Menu, UserRound, UsersRound } from 'lucide-react';
import labels from '../data/labels.json';
import type { Navigate, PageView, Profile } from '../types';

function HomeIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 1.5 11h3v10H10v-6h4v6h5.5V11h3L12 2Z" /></svg>;
}

interface HeaderProps {
  view: PageView;
  profile: Profile | null;
  onNavigate: Navigate;
  onSignOut: () => void;
  onOpenMobileMenu: () => void;
}

export default function Header({ view, profile, onNavigate, onSignOut, onOpenMobileMenu }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (menuOpen) menuButtonRef.current?.focus();
        setMenuOpen(false);
        setProfileOpen(false);
      }
    }
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', escape);
    };
  }, [menuOpen]);

  function navigate(destination: PageView) {
    setMenuOpen(false);
    setProfileOpen(false);
    onNavigate(destination);
  }

  const mobileTitles: Partial<Record<PageView, string>> = {
    library: labels.library, home: 'TRA APP', install: 'Install APP',
    team: labels.team, about: labels.about, contact: labels.contact,
    'writing-tips': labels.writingTips, 'essay-plans': labels.essayPlans,
    'linking-words': labels.linkingWords, profile: 'My profile',
  };

  return (
    <>
      <header className="desktop-header">
        <div className="header-inner">
          <button className="brand" onClick={() => navigate('home')} aria-label="TRA APP home">
            <img src="/assets/TRA-logo.png" width="24" height="24" alt="" />
            <span>TRA APP</span>
          </button>
          <nav className="desktop-navigation" aria-label="Main navigation">
            <button className={`nav-button ${view === 'home' ? 'active' : ''}`} onClick={() => navigate('home')}>
              <HomeIcon /><span>{labels.home}</span>
            </button>
            <button className={`nav-button ${view === 'install' ? 'active' : ''}`} onClick={() => navigate('install')}>
              <Download size={24} strokeWidth={1.7} /><span>Install APP</span>
            </button>
            <button className="nav-button" onClick={() => navigate(profile ? 'profile' : 'sign-up')}>
              <UserRound size={24} strokeWidth={1.7} /><span>{labels.account}</span>
            </button>
            <div className="nav-menu-wrapper" ref={menuRef}>
              <button ref={menuButtonRef} className={`nav-button ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-haspopup="menu">
                <Menu size={24} strokeWidth={1.7} /><span>More</span><svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true"><path d="m1 2.5 3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              {menuOpen && <div className="more-menu" role="menu" aria-label="More">
                <button role="menuitem" onClick={() => navigate('team')}><IdCard size={17} />{labels.team}</button>
                <button role="menuitem" onClick={() => navigate('about')}><Lightbulb size={17} />{labels.about}</button>
                <button role="menuitem" onClick={() => navigate('contact')}><UsersRound size={17} />{labels.contact}</button>
              </div>}
            </div>
          </nav>
          <div className="header-account" ref={profileRef}>
            {profile ? <>
              <button className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}>
                <span className="avatar">{profile.name.charAt(0).toUpperCase()}</span>
                <span>{profile.name.split(' ')[0]}</span><ChevronDown size={14} />
              </button>
              {profileOpen && <div className="profile-menu more-menu">
                <p>Local profile</p>
                <span className="profile-email">{profile.email}</span>
                <button onClick={() => navigate('profile')}><UserRound size={17} />My profile</button>
                <button onClick={() => { setProfileOpen(false); onSignOut(); }}><LogOut size={17} />Sign Out</button>
              </div>}
            </> : <>
              <button className="button button-outline" onClick={() => navigate('sign-in')}>Sign In</button>
              <button className="button button-primary" onClick={() => navigate('sign-up')}>Sign Up</button>
            </>}
          </div>
        </div>
      </header>
      <header className="mobile-header">
        {view === 'home' ? <img src="/assets/TRA-logo.png" width="26" height="26" alt="" /> :
          <button className="icon-button mobile-back" aria-label="Back" onClick={() => navigate(view === 'library' ? 'home' : 'library')}><ArrowLeft size={22} strokeWidth={1.7} /></button>}
        <h1>{mobileTitles[view] || 'TRA APP'}</h1>
        {view === 'home' && <button className="icon-button mobile-menu-button" aria-label="Open menu" onClick={onOpenMobileMenu}><Menu size={22} /></button>}
      </header>
    </>
  );
}

export function MobileNavigation({ view, profile, onNavigate }: Pick<HeaderProps, 'view' | 'profile' | 'onNavigate'>) {
  return (
    <nav className="mobile-navigation" aria-label="Main navigation">
      <button className={view === 'home' ? 'active' : ''} onClick={() => onNavigate('home')}>
        <HomeIcon size={28} /><span>{labels.home}</span>
      </button>
      <button className={view === 'install' ? 'active' : ''} onClick={() => onNavigate('install')}>
        <Download size={24} strokeWidth={1.5} /><span>Install APP</span>
      </button>
      <button className={view === 'profile' ? 'active' : ''} onClick={() => onNavigate(profile ? 'profile' : 'sign-up')}>
        <UserRound size={25} strokeWidth={1.5} /><span>{labels.account}</span>
      </button>
    </nav>
  );
}