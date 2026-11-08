import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowUpRight, BookOpen, Check, ChevronRight, ClipboardList, Download, ExternalLink, Link, Mail, Pencil, ScrollText, Smartphone, UsersRound } from 'lucide-react';
import labels from '../data/labels.json';
import guides from '../data/guides.json';
import type { Navigate, PageView, Profile } from '../types';

export function HomePage({ onNavigate }: { onNavigate: Navigate }) {
  const resources = [
    { title: labels.library, view: 'library', icon: ScrollText },
    { title: labels.writingTips, view: 'writing-tips', icon: Pencil },
    { title: labels.essayPlans, view: 'essay-plans', icon: ClipboardList },
    { title: labels.linkingWords, view: 'linking-words', icon: Link },
  ] as const;
  return <main className="page-container home-page page-enter" id="main-content">
    <h1 className="sr-only">{labels.subject}</h1>
    <div className="resource-links">{resources.map(({ title, view, icon: Icon }) => <button key={view} className="resource-link" onClick={() => onNavigate(view)}><Icon size={34} strokeWidth={1.7} /><h2>{title}</h2><ChevronRight size={24} strokeWidth={1.8} /></button>)}</div>
    <div className="home-back"><span>{labels.goBack}</span><button onClick={() => onNavigate('library')}><ArrowLeft size={17} />Back</button></div>
  </main>;
}

export function InstallPage({ onInstall }: { onInstall: () => void }) {
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');
  const steps = platform === 'ios' ? [
    ['Open TRA APP in Safari', 'Open this website in Safari on your iPhone or iPad.'],
    ['Open the Share menu', 'Tap the Share button, or tap the three dots and choose Share.'],
    ['Choose Add to Home Screen', 'Scroll through the menu. If needed, choose View More to find this option.'],
    ['Tap Add', 'Keep Open as Web App switched on. TRA APP will appear on your home screen.'],
  ] : [
    ['Open TRA APP in Chrome', 'Open this website in Google Chrome on your Android device.'],
    ['Open the browser menu', 'Tap the three dots in the top-right corner.'],
    ['Choose Install app', 'Select Install app or Add to Home screen, then tap Install to confirm.'],
    ['Open TRA APP', 'Find the TRA APP icon on your home screen to start reading.'],
  ];
  return <main className="page-container secondary-page page-enter" id="main-content">
    <h1 className="install-title"><Smartphone size={22} />{labels.chooseSystem}</h1>
    <div className="settings-tabs" role="tablist" aria-label="Operating system">
      <button role="tab" aria-selected={platform === 'ios'} className={platform === 'ios' ? 'active' : ''} onClick={() => setPlatform('ios')}><Download size={20} />IOS</button>
      <button role="tab" aria-selected={platform === 'android'} className={platform === 'android' ? 'active' : ''} onClick={() => setPlatform('android')}><Smartphone size={20} />Android</button>
    </div>
    <section className="install-guide" role="tabpanel" aria-label={`${platform === 'ios' ? 'IOS' : 'Android'} installation instructions`}>
      <div className="install-brand"><img src="/assets/TRA-logo.png" alt="TRA" /><div><h2>{labels.installGuide}</h2><p>TRA APP on {platform === 'ios' ? 'iPhone & iPad' : 'Android'}</p></div></div>
      <ol className="install-steps">{steps.map(([title, description], index) => <li key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
      <button className="button button-primary install-action" onClick={onInstall}><Download size={18} />Install TRA APP</button>
      <p className="install-note">If your browser does not show an install prompt, follow the steps above.</p>
    </section>
  </main>;
}

function GoogleIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.25c1.9-1.75 2.97-4.33 2.97-7.36Z" /><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.25-2.51c-.9.6-2.05.97-3.37.97-2.6 0-4.8-1.76-5.59-4.13H3.06v2.59A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.06a10 10 0 0 0 0 9.02l3.35-2.59Z" /><path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.49l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.94 5.49l3.35 2.59C7.2 7.71 9.4 5.95 12 5.95Z" /></svg>;
}

export function AuthPage({ signUp, onNavigate, onComplete }: { signUp: boolean; onNavigate: Navigate; onComplete: (profile: Profile) => boolean }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [googleNotice, setGoogleNotice] = useState(false);
  const [saveError, setSaveError] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setSaveError(!onComplete({ name: name.trim() || email.split('@')[0], email: email.trim().toLowerCase() }));
  }
  return <main className="auth-page">
    <button className="auth-back" onClick={() => onNavigate('library')}><ArrowLeft size={20} />Back to library</button>
    <section className="auth-card page-enter">
      <img className="auth-logo" src="/assets/TRA-logo.png" width="50" height="50" alt="TRA APP" />
      <h1>{signUp ? 'Create your TRA APP profile' : 'Welcome to TRA APP'}</h1>
      <p className="auth-intro">{signUp ? 'Keep learning. Keep discovering.' : 'Continue your learning journey.'}</p>
      <form onSubmit={submit}>
        {signUp && <label className="auth-field"><span className="sr-only">Your name</span><input aria-label="Your name" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required maxLength={70} /></label>}
        <label className="auth-field"><span className="sr-only">Email address</span><input type="email" aria-label="Email address" placeholder="Enter your email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required maxLength={254} /></label>
        <button type="submit" className="auth-continue" disabled={!email.trim() || (signUp && !name.trim())}>Continue</button>
      </form>
      <div className="auth-divider" />
      <button className="google-button" onClick={() => setGoogleNotice(!googleNotice)}><GoogleIcon />Continue with Google</button>
      {googleNotice && <p className="auth-notice" role="status">Google sign-in is not connected in this preview. Continue with your email to create a local profile instead.</p>}
      {saveError && <p className="auth-notice" role="alert">Your profile could not be saved. Please allow browser storage and try again.</p>}
      <p className="auth-local-note">Local preview only. Your profile stays on this device. No email is sent.</p>
      <button className="auth-switch" onClick={() => onNavigate(signUp ? 'sign-in' : 'sign-up')}>{signUp ? 'Already have a profile? Sign In' : 'New to TRA APP? Sign Up'}</button>
    </section>
  </main>;
}

export function ProfilePage({ profile, onSave, onSignOut }: { profile: Profile; onSave: (profile: Profile) => boolean; onSignOut: () => void }) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [saved, setSaved] = useState(false);
  return <main className="page-container secondary-page page-enter" id="main-content">
    <div className="narrow-content"><h1>My profile</h1><p className="muted">This profile is saved only on this device.</p>
      <form className="profile-form" onSubmit={(event) => { event.preventDefault(); setSaved(onSave({ name: name.trim(), email: email.trim() })); }}>
        <label>Name<input value={name} onChange={(event) => { setName(event.target.value); setSaved(false); event.target.setCustomValidity(event.target.value.trim() ? '' : 'Please enter your name.'); }} required maxLength={70} /></label>
        <label>Email address<input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setSaved(false); }} required maxLength={254} /></label>
        <button className="button button-primary" type="submit">{saved ? <><Check size={17} />Saved</> : 'Save changes'}</button>
      </form>
      <button className="text-button sign-out-button" onClick={onSignOut}>Sign Out</button>
    </div>
  </main>;
}

export function InformationPage({ view, onNavigate }: { view: PageView; onNavigate: Navigate }) {
  const guide = guides[view as keyof typeof guides];
  if (guide) return <main className="page-container secondary-page page-enter" id="main-content">
    <button className="inline-back" onClick={() => onNavigate('home')}><ChevronRight size={16} className="rotate-180" />{labels.subject}</button>
    <article className="learning-guide"><h1>{guide.title}</h1><p>{guide.description}</p>
      {guide.sections.map((section) => <section key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}
      <button className="button button-outline" onClick={() => onNavigate('library')}><BookOpen size={18} />{labels.library}</button>
    </article>
  </main>;
  const isContact = view === 'contact';
  const isTeam = view === 'team';
  return <main className="page-container secondary-page page-enter" id="main-content">
    <div className="narrow-content information-page">
      <img src="/assets/TRA-logo.png" width="66" height="66" alt="TRA APP" />
      <h1>{isContact ? labels.contact : isTeam ? labels.team : labels.about}</h1>
      <h2>TRA APP</h2>
      <p>{isContact ? 'For help with your TRA account, subscriptions, or learning resources, visit the official TRA APP website.' : isTeam ? 'Learning, reading, and sharing Khmer literature. Explore the collection prepared for TRA APP readers.' : 'Discover Khmer literature, explore its characters and history, and understand the ideas behind each story.'}</p>
      <p className="muted">{isContact ? 'This is a local recreation. Support requests are not sent from this preview.' : labels.learn}</p>
      <div className="information-actions">
        {isContact ? <a className="button button-primary" href="https://rylapp.com" target="_blank" rel="noopener noreferrer"><Mail size={17} />Visit official TRA APP<ExternalLink size={15} /></a> : <button className="button button-primary" onClick={() => onNavigate('library')}><BookOpen size={18} />{labels.library}<ArrowUpRight size={17} /></button>}
        {isTeam && <button className="button button-outline" onClick={() => onNavigate('contact')}><UsersRound size={17} />{labels.contact}</button>}
      </div>
    </div>
  </main>;
}