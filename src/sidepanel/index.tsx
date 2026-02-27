import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Pencil, Save, ChevronLeft } from 'lucide-react';
import { storage, type Note } from '../services/storage/StorageManager';
import '@/index.css';

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
    const newNote = { id: Date.now().toString(), title: '', content: '', updatedAt: Date.now() };
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

  return (
    <div className="h-screen bg-white text-gray-900 flex flex-col font-sans">
      {/* HEADER */}
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h1 className="font-bold text-lg flex items-center gap-2">
          <Pencil size={18} className="text-blue-600" /> NotePilot
        </h1>
        {view === 'editor' && (
          <button onClick={handleSave} className="text-blue-600 hover:text-blue-800">
            <Save size={20} />
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4">
        {view === 'list' ? (
          <>
            <button onClick={handleCreate} className="w-full bg-black text-white py-2 rounded-lg mb-4 font-medium">
              + New Note
            </button>
            <div className="space-y-2">
              {notes.map(note => (
                <div key={note.id} onClick={() => { setActiveNote(note); setView('editor'); }}
                  className="p-3 border rounded-lg hover:border-blue-500 cursor-pointer">
                  <div className="font-bold">{note.title || 'Untitled Note'}</div>
                  <div className="text-xs text-gray-500 truncate">{note.content || 'No content'}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full">
            <button onClick={() => setView('list')} className="flex items-center text-sm text-gray-500 mb-2">
              <ChevronLeft size={16} /> Back
            </button>
            <input
              className="text-xl font-bold w-full outline-none mb-2 placeholder-gray-300"
              placeholder="Title"
              value={activeNote?.title}
              onChange={e => setActiveNote({ ...activeNote!, title: e.target.value })}
            />
            <textarea
              className="flex-1 w-full outline-none resize-none placeholder-gray-300"
              placeholder="Start typing..."
              value={activeNote?.content}
              onChange={e => setActiveNote({ ...activeNote!, content: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<SidePanel />);