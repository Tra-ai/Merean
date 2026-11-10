export type PageView =
  | 'library'
  | 'home'
  | 'install'
  | 'sign-in'
  | 'sign-up'
  | 'profile'
  | 'team'
  | 'about'
  | 'contact'
  | 'writing-tips'
  | 'essay-plans'
  | 'linking-words';

export interface Story {
  id: string;
  title: string;
  category: number;
  aliases: string;
}

export interface StoryContent {
  audio: string | null;
  tabs: { label: string; text: string; html: string }[];
}

export interface Profile {
  name: string;
  email: string;
}

export type Navigate = (view: PageView, story?: string) => void;

export interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}