import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronLeft, ListFilter, Search, X } from 'lucide-react';
import library from '../data/library.json';
import labels from '../data/labels.json';
import type { Navigate, Story } from '../types';

export function NoteIcon({ size = 19 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true" className="note-icon">
      <path d="M2 2.5h14v17H2z" fill="#fff" stroke="#b1d6f0" strokeWidth=".9" />
      <path d="M4 5h9M4 7.5h9M4 10h9M4 12.5h6M4 15h4M4 17.5h8" stroke="#acd5f3" strokeWidth=".8" />
      <path d="m7.6 14.3 8.5-11.1 3.3 2.5-8.5 11.1-4.1 2z" fill="#ffb324" />
      <path d="m16.1 3.2 1.1-1.4c.4-.5.8-.5 1.2-.2l1.8 1.3c.4.3.5.8.2 1.2l-1 1.6z" fill="#f66b62" />
      <path d="m7.6 14.3-.8 4.5 4.1-2z" fill="#f3d6aa" />
      <path d="m7.2 16.9-.4 1.9 1.7-.9z" fill="#6c6770" />
      <path d="m9 15.2 8.6-11.1" stroke="#ffdb71" strokeWidth="1.3" />
    </svg>
  );
}

function normalize(text: string) {
  return text.normalize('NFKC').replace(/[\u200b-\u200d\ufeff]/g, '').toLocaleLowerCase().trim();
}

interface LibraryProps {
  onNavigate: Navigate;
  query: string;
  onQueryChange: (query: string) => void;
  filters: number[];
  onFiltersChange: (filters: number[]) => void;
}

export default function Library({ onNavigate, query, onQueryChange, filters, onFiltersChange }: LibraryProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const filterRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    function outside(event: PointerEvent) {
      if (!filterRef.current?.contains(event.target as Node)) setFilterOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setFilterOpen(false);
        filterButtonRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [filterOpen]);

  const visibleStories = useMemo(() => {
    const term = normalize(query);
    return library.stories.filter((story) =>
      (!filters.length || filters.includes(story.category)) &&
      (!term || normalize(`${story.title} ${story.aliases}`).includes(term)),
    );
  }, [query, filters]);

  function toggleCategory(category: number) {
    onFiltersChange(filters.includes(category)
      ? filters.filter((item) => item !== category)
      : [...filters, category]);
  }

  function reset() {
    onQueryChange('');
    onFiltersChange([]);
    searchRef.current?.focus();
  }

  return (
    <main className="library page-container" id="main-content">
      <div className="breadcrumbs" aria-label="Breadcrumb">
        <button className="icon-button breadcrumb-back" aria-label="Back" onClick={() => onNavigate('home')}>
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => onNavigate('home')} className="breadcrumb-parent">{labels.subject}</button>
        <span className="breadcrumb-slash">/</span>
        <h1>{labels.library}</h1>
      </div>

      <div className="library-toolbar">
        <div className="search-control">
          <Search size={19} strokeWidth={1.8} aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search"
            aria-label="Search stories"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          {query && <button type="button" className="search-clear" aria-label="Clear search" onClick={() => {
            onQueryChange('');
            searchRef.current?.focus();
          }}><X size={16} /></button>}
        </div>

        <div className="filter-container" ref={filterRef}>
          <button
            ref={filterButtonRef}
            className={`filter-button ${filterOpen ? 'is-open' : ''} ${filters.length ? 'has-filters' : ''}`}
            onClick={() => setFilterOpen(!filterOpen)}
            aria-label={filters.length ? `Filter (${filters.length} selected)` : 'Filter'}
            aria-expanded={filterOpen}
            aria-controls="category-filter"
          >
            <ListFilter size={18} strokeWidth={1.6} />
            <span className="filter-label">Filter{filters.length ? ` (${filters.length})` : ''}</span>
            <ChevronDown size={16} className="filter-chevron" />
            {filters.length > 0 && <span className="mobile-filter-dot" />}
          </button>
          {filterOpen && (
            <div className="filter-popover" id="category-filter" role="dialog" aria-label="Filter by category">
              <button className="filter-heading" onClick={() => setCategoriesExpanded(!categoriesExpanded)} aria-expanded={categoriesExpanded}>
                <span>{labels.category}</span>
                <ChevronDown size={17} className={!categoriesExpanded ? 'is-collapsed' : ''} />
              </button>
              {categoriesExpanded && <div className="filter-options">
                {[0, 4, 1, 2, 3].map((index) => (
                  <label className="filter-option" key={index}>
                    <NoteIcon />
                    <span>{library.categories[index]}</span>
                    <span className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={filters.includes(index)}
                        onChange={() => toggleCategory(index)}
                        aria-label={library.categories[index]}
                      />
                      {filters.includes(index) && <Check size={15} strokeWidth={2.5} />}
                    </span>
                  </label>
                ))}
              </div>}
              <div className="filter-footer">
                <button className="button button-outline" onClick={() => onFiltersChange([])}>Clear all</button>
                <button className="button button-primary" onClick={() => {
                  setFilterOpen(false);
                  filterButtonRef.current?.focus();
                }}>Done</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sr-only" role="status">{visibleStories.length} stories found</div>
      <div className="library-groups">
        {library.categories.map((category, index) => {
          const stories = visibleStories.filter((story) => story.category === index);
          if (!stories.length) return null;
          return (
            <section className="story-group" aria-labelledby={`category-${index}`} key={category}>
              <h2 className="group-heading" id={`category-${index}`}><NoteIcon /><span>{category}</span></h2>
              <div className="story-grid">
                {stories.map((story: Story) => (
                  <button className="story-card" key={story.id} onClick={() => onNavigate('library', story.id)}>
                    <h3>{story.title}</h3>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
        {visibleStories.length === 0 && (
          <div className="empty-state">
            <Search size={34} strokeWidth={1.4} />
            <h2>No results found</h2>
            <p>Try another story title or clear your filters.</p>
            <button className="button button-outline" onClick={reset}>Clear search and filters</button>
          </div>
        )}
      </div>
    </main>
  );
}