// A simple interface ensuring all adapters look the same
export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export interface IStorageAdapter {
  saveNote(note: Note): Promise<void>;
  getNotes(): Promise<Note[]>;
}

// The Manager that the UI talks to
class StorageManager {
  private adapter: IStorageAdapter;

  constructor() {
    // Default to Local. In the future, check user settings here.
    this.adapter = new LocalAdapter(); 
  }

  async saveNote(note: Note) {
    return this.adapter.saveNote(note);
  }

  async getNotes() {
    return this.adapter.getNotes();
  }
}

// A simple Local Adapter implementation
class LocalAdapter implements IStorageAdapter {
  async saveNote(note: Note) {
    const notes = await this.getNotes();
    const index = notes.findIndex(n => n.id === note.id);
    if (index >= 0) notes[index] = note;
    else notes.push(note);
    await chrome.storage.local.set({ notes });
  }

  async getNotes(): Promise<Note[]> {
    const result = await chrome.storage.local.get("notes");
    return result.notes || [];
  }
}

export const storage = new StorageManager();