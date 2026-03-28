import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { storage, type Note, type Collection } from '../services/storage/StorageManager';
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
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [originalNote, setOriginalNote] = useState<Note | null>(null);

  useEffect(() => {
    loadNotes();
    loadCollections();
  }, []);

  const loadNotes = async () => {
    const loaded = await storage.getNotes();
    setNotes(loaded);
  };

  const loadCollections = async () => {
    const loaded = await storage.getCollections();
    setCollections(loaded);
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
    setOriginalNote(newNote);
    setView('editor');
  };

  const handleSave = async () => {
    if (activeNote) {
      // Auto-delete if both title and content are blank
      if (!activeNote.title.trim() && !activeNote.content.trim()) {
        await storage.deleteNote(activeNote.id);
        await loadNotes();
        setActiveNote(null);
        setOriginalNote(null);
        setView('list');
      } else {
        await storage.saveNote({ ...activeNote, updatedAt: Date.now() });
        await loadNotes();
        setOriginalNote(activeNote);
      }
    }
  };

  const handleBack = async () => {
    if (activeNote) {
      // Auto-delete if both title and content are blank
      if (!activeNote.title.trim() && !activeNote.content.trim()) {
        await storage.deleteNote(activeNote.id);
        await loadNotes();
      } else {
        await storage.saveNote({ ...activeNote, updatedAt: Date.now() });
        await loadNotes();
      }
    }
    setActiveNote(null);
    setOriginalNote(null);
    setView('list');
  };

  const handleDiscard = () => {
    if (originalNote) {
      setActiveNote(originalNote);
    }
  };

  const handleDelete = async () => {
    if (activeNote) {
      await storage.deleteNote(activeNote.id);
      await loadNotes();
      setActiveNote(null);
      setOriginalNote(null);
      setView('list');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    await storage.deleteNote(noteId);
    await loadNotes();
  };

  const handleAddToCollection = async (noteId: string, collectionId: string) => {
    await storage.addNoteToCollection(noteId, collectionId);
    await loadNotes();
  };

  const handleRemoveFromCollection = async (noteId: string, collectionId: string) => {
    await storage.removeNoteFromCollection(noteId, collectionId);
    await loadNotes();
  };

  return (
    <div className="h-screen w-full bg-app-bg flex items-stretch font-body overflow-hidden">
      {/* White rounded card container */}
      <div className="flex-1 bg-card-bg rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {view === 'list' ? (
          <NoteList
            notes={notes}
            collections={collections}
            onCreateNote={handleCreate}
            onSelectNote={(note) => {
              setActiveNote(note);
              setOriginalNote(note);
              setView('editor');
            }}
            onDeleteNote={handleDeleteNote}
            onAddToCollection={handleAddToCollection}
            onRemoveFromCollection={handleRemoveFromCollection}
            loadCollections={loadCollections}
          />
        ) : (
          <NoteEditor
            note={activeNote!}
            onChange={setActiveNote}
            onBack={handleBack}
            onSave={handleSave}
            onDiscard={handleDiscard}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<SidePanel />);