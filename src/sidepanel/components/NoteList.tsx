import { useState } from 'react';
import { type Note, type Collection, storage } from '../../services/storage/StorageManager';
import { Search, Plus, Settings, MoreHorizontal, FolderPlus, Trash2, Folder } from 'lucide-react';

type NoteListProps = {
    notes: Note[];
    collections: Collection[];
    onCreateNote: () => void;
    onSelectNote: (note: Note) => void;
    onDeleteNote: (noteId: string) => void;
    onAddToCollection: (noteId: string, collectionId: string) => void;
    onRemoveFromCollection: (noteId: string, collectionId: string) => void;
    loadCollections: () => void;
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

function NoteCard({ note, onSelect, onDelete, collections, onAddToCollection, onRemoveFromCollection, onSwitchToCollectionsTab }: { 
    note: Note; 
    onSelect: () => void; 
    onDelete: (noteId: string) => void;
    collections: Collection[];
    onAddToCollection: (noteId: string, collectionId: string) => void;
    onRemoveFromCollection: (noteId: string, collectionId: string) => void;
    onSwitchToCollectionsTab?: () => void;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showCollectionsMenu, setShowCollectionsMenu] = useState(false);
    const bg = note.color ?? getComputedStyle(document.documentElement).getPropertyValue('--color-note-card-default').trim();
    const light = isLightColor(bg);
    const titleColor = light ? 'text-gray-900' : 'text-white';
    const dateColor = light ? 'text-gray-500' : 'text-white/70';
    const menuIconColor = light ? 'text-gray-400' : 'text-white/70';
    const noteCollectionIds = note.collectionIds || [];

    return (
        <div
            className="rounded-2xl p-3 cursor-pointer relative border border-gray-100 hover:shadow-sm transition-shadow"
            style={{ backgroundColor: bg }}
            onClick={onSelect}
        >
            {/* Top row: title + menu */}
            <div className="flex items-start justify-between gap-1">
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
                    className="absolute right-3 top-10 w-48 bg-white rounded-xl shadow-xl py-1 z-50 border border-gray-100"
                    onClick={e => e.stopPropagation()}
                >
                    {!showCollectionsMenu ? (
                        <>
                            <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                onClick={() => setShowCollectionsMenu(true)}
                            >
                                <FolderPlus size={14} />
                                Add to Collection
                            </button>
                            <button
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                onClick={() => {
                                    setMenuOpen(false);
                                    onDelete(note.id);
                                }}
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                onClick={() => setShowCollectionsMenu(false)}
                            >
                                ← Back
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
                                onClick={() => {
                                    setMenuOpen(false);
                                    setShowCollectionsMenu(false);
                                    // Switch to collections tab
                                    onSwitchToCollectionsTab?.();
                                }}
                            >
                                <FolderPlus size={14} />
                                Create New Collection
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            {collections.length === 0 ? (
                                <div className="px-4 py-2 text-sm text-gray-400">No collections</div>
                            ) : (
                                collections.map(collection => {
                                    const isInCollection = noteCollectionIds.includes(collection.id);
                                    return (
                                        <button
                                            key={collection.id}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                            onClick={() => {
                                                if (isInCollection) {
                                                    onRemoveFromCollection(note.id, collection.id);
                                                } else {
                                                    onAddToCollection(note.id, collection.id);
                                                }
                                                setMenuOpen(false);
                                                setShowCollectionsMenu(false);
                                            }}
                                        >
                                            <Folder size={14} style={{ color: collection.color }} />
                                            <span className="flex-1">{collection.name}</span>
                                            {isInCollection && <span className="text-green-500">✓</span>}
                                        </button>
                                    );
                                })
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export const NoteList = ({ notes, collections, onCreateNote, onSelectNote, onDeleteNote, onAddToCollection, onRemoveFromCollection, loadCollections }: NoteListProps) => {
    const [activeTab, setActiveTab] = useState<Tab>('all');
    const [activePanel, setActivePanel] = useState<'search' | 'settings' | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
    const [showCreateCollectionInline, setShowCreateCollectionInline] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');

    const togglePanel = (panel: 'search' | 'settings') => {
        if (activePanel === panel) {
            setActivePanel(null);
            if (panel === 'search') setSearchQuery('');
        } else {
            setActivePanel(panel);
            if (panel !== 'search') setSearchQuery('');
        }
    };

    const filteredNotes = notes.filter(note => {
        const matchSearch =
            !searchQuery ||
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchSearch;
    });

    const handleCreateCollection = async () => {
        if (!newCollectionName.trim()) return;
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        const newCollection: Collection = {
            id: Date.now().toString(),
            name: newCollectionName.trim(),
            color: colors[Math.floor(Math.random() * colors.length)],
            createdAt: Date.now(),
        };
        await storage.saveCollection(newCollection);
        setNewCollectionName('');
        setShowCreateCollectionInline(false);
        loadCollections();
    };

    const switchToCollectionsTab = () => {
        setActiveTab('collections');
        setShowCreateCollectionInline(true);
    };

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
                        onClick={() => togglePanel('settings')}
                        className={`icon-btn ${activePanel === 'settings' ? 'active' : ''}`}
                        aria-label="Settings"
                        title="Settings"
                    >
                        <Settings size={19} />
                    </button>
                    <button
                        onClick={() => setActiveTab('collections')}
                        className={`icon-btn ${activeTab === 'collections' ? 'active' : ''}`}
                        aria-label="Collections"
                        title="Collections"
                    >
                        <Folder size={19} />
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
            <div className="flex-1 overflow-y-auto scrollbar-custom px-4 py-4 flex flex-col gap-3">
                {activeTab === 'collections' ? (
                    activeCollection ? (
                        // Collection Detail View
                        <div className="flex flex-col h-full">
                            {/* Collection Header */}
                            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                                <button
                                    onClick={() => setActiveCollection(null)}
                                    className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    ← Back to Collections
                                </button>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <Folder size={24} style={{ color: activeCollection.color }} />
                                <h2 className="text-xl font-bold text-content">{activeCollection.name}</h2>
                                <span className="text-sm text-content-muted">
                                    ({notes.filter(n => n.collectionIds?.includes(activeCollection.id)).length} notes)
                                </span>
                            </div>
                            {/* Notes in Collection */}
                            <div className="flex flex-col gap-3">
                                {(() => {
                                    const collectionNotes = notes.filter(n => n.collectionIds?.includes(activeCollection.id));
                                    if (collectionNotes.length === 0) {
                                        return (
                                            <div className="flex flex-col items-center text-center pt-8">
                                                <div className="w-14 h-14 rounded-full bg-surface-muted flex items-center justify-center mb-4">
                                                    <Folder size={24} className="text-content-placeholder" />
                                                </div>
                                                <p className="font-medium text-content text-sm">No notes in this collection</p>
                                                <p className="text-xs mt-1 text-content-muted">Add notes to get started</p>
                                            </div>
                                        );
                                    }
                                    return collectionNotes.map(note => (
                                        <NoteCard
                                            key={note.id}
                                            note={note}
                                            onSelect={() => onSelectNote(note)}
                                            onDelete={onDeleteNote}
                                            collections={collections}
                                            onAddToCollection={onAddToCollection}
                                            onRemoveFromCollection={onRemoveFromCollection}
                                            onSwitchToCollectionsTab={switchToCollectionsTab}
                                        />
                                    ));
                                })()}
                            </div>
                        </div>
                    ) : (
                        // Collections List View (as cards)
                        <div className="flex flex-col gap-3">
                            {/* Create Collection Button */}
                            {showCreateCollectionInline ? (
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Collection name"
                                        value={newCollectionName}
                                        onChange={e => setNewCollectionName(e.target.value)}
                                        className="flex-1 px-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-blue-300 outline-none"
                                        onKeyDown={e => e.key === 'Enter' && handleCreateCollection()}
                                        autoFocus
                                    />
                                    <button
                                        className="px-3 py-2 bg-blue-500 text-white rounded-xl text-sm hover:bg-blue-600"
                                        onClick={handleCreateCollection}
                                    >
                                        Create
                                    </button>
                                    <button
                                        className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-xl text-sm"
                                        onClick={() => setShowCreateCollectionInline(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowCreateCollectionInline(true)}
                                    className="rounded-2xl p-4 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex items-center gap-3 text-gray-500 hover:text-gray-600 w-full"
                                >
                                    <FolderPlus size={20} />
                                    <span className="font-medium">Create New Collection</span>
                                </button>
                            )}
                            
                            {collections.length === 0 ? (
                                <div className="flex flex-col items-center text-center pt-8">
                                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                                        <Folder className="w-7 h-7 text-blue-400" />
                                    </div>
                                    <p className="font-semibold text-content text-sm">No collections</p>
                                    <p className="text-xs mt-1 text-content-muted">Create collections to organize your notes</p>
                                </div>
                            ) : (
                                collections.map(collection => {
                                    const collectionNotes = notes.filter(n => n.collectionIds?.includes(collection.id));
                                    return (
                                        <div
                                            key={collection.id}
                                            onClick={() => setActiveCollection(collection)}
                                            className="rounded-2xl p-4 cursor-pointer border border-gray-100 hover:shadow-sm transition-all bg-white"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                    style={{ backgroundColor: collection.color + '20' }}
                                                >
                                                    <Folder size={24} style={{ color: collection.color }} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-content">{collection.name}</h3>
                                                    <p className="text-xs text-content-muted">
                                                        {collectionNotes.length} {collectionNotes.length === 1 ? 'note' : 'notes'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        await storage.deleteCollection(collection.id);
                                                        loadCollections();
                                                        const ac = activeCollection as Collection | null;
                                                        if (ac && ac.id === collection.id) {
                                                            setActiveCollection(null);
                                                        }
                                                    }}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )
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
                            onDelete={onDeleteNote}
                            collections={collections}
                            onAddToCollection={onAddToCollection}
                            onRemoveFromCollection={onRemoveFromCollection}
                            onSwitchToCollectionsTab={switchToCollectionsTab}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
