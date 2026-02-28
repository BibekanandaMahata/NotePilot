import { useState } from 'react';
import { type Note } from '../../services/storage/StorageManager';
import { Archive, Search, Plus, Settings, MoreHorizontal } from 'lucide-react';

type NoteListProps = {
    notes: Note[];
    onCreateNote: () => void;
    onSelectNote: (note: Note) => void;
};

type Tab = 'all' | 'collections';

// Determines whether card text/icons should be light or dark depending on bg color
function isLightColor(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Perceived luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55;
}

// Format timestamp to "Today", "Yesterday", or "Feb 26"
function formatDate(ts: number): string {
    const date = new Date(ts);
    const now = new Date();
    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();
    if (isToday) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Renders note content preview — detects todo-style lines (- [ ] or - [x])
function NoteContentPreview({ content, light }: { content: string; light: boolean }) {
    if (!content.trim()) return null;
    const lines = content.split('\n').slice(0, 4).filter(Boolean);
    const hasTodos = lines.some(l => /^- \[[ x]\]/.test(l));

    if (hasTodos) {
        return (
            <div className="flex flex-col gap-1.5 mt-2">
                {lines.map((line, i) => {
                    const todoMatch = line.match(/^- \[([ x])\] (.+)/);
                    if (todoMatch) {
                        const done = todoMatch[1] === 'x';
                        return (
                            <div key={i} className="flex items-center gap-2">
                                <div
                                    className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${done
                                        ? light
                                            ? 'border-gray-600 bg-gray-600'
                                            : 'border-white bg-white'
                                        : light
                                            ? 'border-gray-600'
                                            : 'border-white/70'
                                        }`}
                                >
                                    {done && (
                                        <svg className={`w-2.5 h-2.5 ${light ? 'text-white' : 'text-gray-700'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span
                                    className={`text-sm leading-tight truncate ${done
                                        ? light
                                            ? 'line-through opacity-60 text-gray-700'
                                            : 'line-through opacity-60 text-white'
                                        : light
                                            ? 'text-gray-800'
                                            : 'text-white'
                                        }`}
                                >
                                    {todoMatch[2]}
                                </span>
                            </div>
                        );
                    }
                    return (
                        <p key={i} className={`text-sm leading-tight truncate ${light ? 'text-gray-700' : 'text-white/80'}`}>
                            {line}
                        </p>
                    );
                })}
            </div>
        );
    }

    return (
        <p className={`mt-2 text-sm leading-relaxed line-clamp-3 ${light ? 'text-gray-700' : 'text-white/85'}`}>
            {content}
        </p>
    );
}

function NoteCard({ note, onSelect }: { note: Note; onSelect: () => void }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const bg = note.color ?? getComputedStyle(document.documentElement).getPropertyValue('--color-note-card-default').trim();
    const light = isLightColor(bg);
    const titleColor = light ? 'text-gray-900' : 'text-white';
    const dateColor = light ? 'text-gray-500' : 'text-white/70';
    const menuIconColor = light ? 'text-gray-400' : 'text-white/70';

    return (
        <div
            className="rounded-2xl p-4 pb-3 cursor-pointer relative border border-gray-100 hover:shadow-sm transition-shadow"
            style={{ backgroundColor: bg }}
            onClick={onSelect}
        >
            {/* Top row: title + menu */}
            <div className="flex items-start justify-between gap-2">
                <h3 className={`font-semibold text-base leading-snug flex-1 min-w-0 truncate ${titleColor}`}>
                    {note.title || 'Untitled'}
                </h3>
                <button
                    className={`flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors ${menuIconColor}`}
                    onClick={e => {
                        e.stopPropagation();
                        setMenuOpen(v => !v);
                    }}
                >
                    <MoreHorizontal size={18} />
                </button>
            </div>

            {/* Content preview */}
            <NoteContentPreview content={note.content} light={light} />

            {/* Bottom: date */}
            <p className={`mt-3 text-xs font-medium ${dateColor}`}>
                {formatDate(note.updatedAt)}
            </p>

            {/* Dropdown menu */}
            {menuOpen && (
                <div
                    className="absolute right-3 top-10 w-36 bg-white rounded-xl shadow-xl py-1 z-50 border border-gray-100"
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => { setMenuOpen(false); onSelect(); }}
                    >
                        Edit
                    </button>
                </div>
            )}
        </div>
    );
}

export const NoteList = ({ notes, onCreateNote, onSelectNote }: NoteListProps) => {
    const [activeTab, setActiveTab] = useState<Tab>('all');
    const [activePanel, setActivePanel] = useState<'search' | 'settings' | 'archive' | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const togglePanel = (panel: 'search' | 'settings' | 'archive') => {
        if (activePanel === panel) {
            setActivePanel(null);
            if (panel === 'search') setSearchQuery('');
        } else {
            setActivePanel(panel);
            if (panel !== 'search') setSearchQuery('');
        }
    };

    const filteredNotes = notes.filter(note => {
        const matchTab =
            activeTab === 'all'
                ? true
                : note.pageUrl != null; // Keeping existing condition for collections placeholder
        const matchSearch =
            !searchQuery ||
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchTab && matchSearch;
    });

    return (
        <div className="flex flex-col h-full bg-card-bg overflow-hidden">
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3">
                <h1 className="text-2xl italic text-content">Notes</h1>

                <div className="flex items-center gap-0.5">
                    {/* Utility icons - use .icon-btn utility class */}
                    <button
                        onClick={() => togglePanel('search')}
                        className={`icon-btn ${activePanel === 'search' ? 'active' : ''}`}
                        aria-label="Search"
                        title="Search"
                    >
                        <Search size={19} />
                    </button>
                    <button
                        onClick={() => togglePanel('archive')}
                        className={`icon-btn ${activePanel === 'archive' ? 'active' : ''}`}
                        aria-label="Archived notes"
                        title="Archived"
                    >
                        <Archive size={19} />
                    </button>
                    <button
                        onClick={() => togglePanel('settings')}
                        className={`icon-btn ${activePanel === 'settings' ? 'active' : ''}`}
                        aria-label="Settings"
                        title="Settings"
                    >
                        <Settings size={19} />
                    </button>

                    {/* Divider */}
                    <div className="w-px h-5 bg-border mx-1.5" />

                    {/* Primary CTA — uses .btn-new-note CSS utility */}
                    <button
                        onClick={onCreateNote}
                        className="btn-new-note"
                        aria-label="New note"
                        title="Add note"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        New
                    </button>
                </div>
            </div>

            {/* ── Search Bar — always above panels ── */}
            {activePanel === 'search' && (
                <div className="px-4 pb-3">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-surface-muted text-content text-sm outline-none placeholder-content-placeholder border border-border focus:border-yellow-300 transition-colors"
                    />
                </div>
            )}

            {/* ── Archive Panel ── */}
            {activePanel === 'archive' && (
                <div className="mx-4 mb-2 px-4 py-3 rounded-2xl bg-yellow-50 border border-yellow-100 flex items-center gap-2">
                    <Archive size={15} className="text-yellow-500 shrink-0" />
                    <p className="text-xs text-content-muted">Archived notes — <span className="font-medium text-content">coming soon</span></p>
                </div>
            )}

            {/* ── Settings Panel ── */}
            {activePanel === 'settings' && (
                <div className="mx-4 mb-2 px-4 py-3 rounded-2xl bg-yellow-50 border border-yellow-100 flex items-center gap-2">
                    <Settings size={15} className="text-yellow-500 shrink-0" />
                    <p className="text-xs text-content-muted">Settings — <span className="font-medium text-content">coming soon</span></p>
                </div>
            )}

            {/* ── Tabs ── */}
            <div className="flex border-b border-border">
                {(['all', 'collections'] as Tab[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-center text-sm font-semibold transition-colors relative ${activeTab === tab ? 'text-content' : 'text-tab-inactive'
                            }`}
                    >
                        {tab === 'all' ? 'All Notes' : 'Collections'}
                        {activeTab === tab && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-content rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* ── Note Cards / Collections ── */}
            <div className={`flex-1 overflow-y-auto scrollbar-custom px-4 py-4 flex flex-col gap-3 ${activeTab === 'collections' ? 'items-center justify-center' : ''}`}>
                {activeTab === 'collections' ? (
                    <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-full bg-yellow-50 flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <p className="font-semibold text-content text-sm">Collections</p>
                        <p className="text-xs mt-1 text-content-muted">Coming soon</p>
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-content-muted text-center pt-16">
                        <div className="w-14 h-14 rounded-full bg-surface-muted flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-content-placeholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="font-medium text-content text-sm">No notes yet</p>
                        <p className="text-xs mt-1 text-content-muted">Tap + to create your first note</p>
                    </div>
                ) : (
                    filteredNotes.map(note => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            onSelect={() => onSelectNote(note)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
