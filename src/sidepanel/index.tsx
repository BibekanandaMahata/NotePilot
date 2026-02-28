import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { storage, type Note } from '../services/storage/StorageManager';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import '@/index.css';

// Reads note card colors from CSS variables (values live only in index.css)
function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getNoteColorPalette(): string[] {
  return [
    getCssVar('--color-note-card-1'),
    getCssVar('--color-note-card-2'),
    getCssVar('--color-note-card-3'),
    getCssVar('--color-note-card-4'),
  ];
}

const SidePanel = () => {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const loaded = await storage.getNotes();
    setNotes(loaded);
  };

  const handleCreate = () => {
    // Pick a random neutral color from the CSS-var-defined palette
    const palette = getNoteColorPalette();
    const color = palette[Math.floor(Math.random() * palette.length)];
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      updatedAt: Date.now(),
      color,
    };
    setActiveNote(newNote);
    setView('editor');
  };

  const handleSave = async () => {
    if (activeNote) {
      await storage.saveNote({ ...activeNote, updatedAt: Date.now() });
      await loadNotes();
      setView('list');
    }
  };

  const handleBack = () => {
    setView('list');
    setActiveNote(null);
  };

  const handleDelete = async () => {
    if (activeNote) {
      const updatedNotes = notes.filter(n => n.id !== activeNote.id);
      await chrome.storage.local.set({ notes: updatedNotes });
      await loadNotes();
      setView('list');
      setActiveNote(null);
    }
  };

  return (
    <div className="h-screen w-full bg-app-bg flex items-stretch font-body overflow-hidden">
      {/* White rounded card container */}
      <div className="flex-1 bg-card-bg rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {view === 'list' ? (
          <NoteList
            notes={notes}
            onCreateNote={handleCreate}
            onSelectNote={(note) => {
              setActiveNote(note);
              setView('editor');
            }}
          />
        ) : (
          <NoteEditor
            note={activeNote!}
            onChange={setActiveNote}
            onBack={handleBack}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<SidePanel />);