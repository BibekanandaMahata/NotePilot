// A simple interface ensuring all adapters look the same
export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  color?: string;
  pageUrl?: string;
  isArchived?: boolean;
  collectionIds?: string[];
}

export interface Collection {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
}

export interface IStorageAdapter {
  saveNote(note: Note): Promise<void>;
  getNotes(): Promise<Note[]>;
  deleteNote(noteId: string): Promise<void>;
  saveCollection(collection: Collection): Promise<void>;
  getCollections(): Promise<Collection[]>;
  deleteCollection(collectionId: string): Promise<void>;
  addNoteToCollection(noteId: string, collectionId: string): Promise<void>;
  removeNoteFromCollection(noteId: string, collectionId: string): Promise<void>;
}

// The Manager that the UI talks to
class StorageManager {
  private adapter: IStorageAdapter;

  constructor() {
    this.adapter = new LocalAdapter();
  }

  async saveNote(note: Note) {
    return this.adapter.saveNote(note);
  }

  async getNotes() {
    return this.adapter.getNotes();
  }

  async deleteNote(noteId: string) {
    return this.adapter.deleteNote(noteId);
  }

  async saveCollection(collection: Collection) {
    return this.adapter.saveCollection(collection);
  }

  async getCollections() {
    return this.adapter.getCollections();
  }

  async deleteCollection(collectionId: string) {
    return this.adapter.deleteCollection(collectionId);
  }

  async addNoteToCollection(noteId: string, collectionId: string) {
    return this.adapter.addNoteToCollection(noteId, collectionId);
  }

  async removeNoteFromCollection(noteId: string, collectionId: string) {
    return this.adapter.removeNoteFromCollection(noteId, collectionId);
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
    return (result.notes as Note[]) || [];
  }

  async deleteNote(noteId: string): Promise<void> {
    const notes = await this.getNotes();
    const updatedNotes = notes.filter(n => n.id !== noteId);
    await chrome.storage.local.set({ notes: updatedNotes });
  }

  async saveCollection(collection: Collection): Promise<void> {
    const collections = await this.getCollections();
    const index = collections.findIndex(c => c.id === collection.id);
    if (index >= 0) collections[index] = collection;
    else collections.push(collection);
    await chrome.storage.local.set({ collections });
  }

  async getCollections(): Promise<Collection[]> {
    const result = await chrome.storage.local.get("collections");
    return (result.collections as Collection[]) || [];
  }

  async deleteCollection(collectionId: string): Promise<void> {
    const collections = await this.getCollections();
    const updatedCollections = collections.filter(c => c.id !== collectionId);
    await chrome.storage.local.set({ collections: updatedCollections });
    
    const notes = await this.getNotes();
    const updatedNotes = notes.map(note => ({
      ...note,
      collectionIds: note.collectionIds?.filter(id => id !== collectionId) || []
    }));
    await chrome.storage.local.set({ notes: updatedNotes });
  }

  async addNoteToCollection(noteId: string, collectionId: string): Promise<void> {
    const notes = await this.getNotes();
    const note = notes.find(n => n.id === noteId);
    if (note) {
      if (!note.collectionIds) note.collectionIds = [];
      if (!note.collectionIds.includes(collectionId)) {
        note.collectionIds.push(collectionId);
        await this.saveNote(note);
      }
    }
  }

  async removeNoteFromCollection(noteId: string, collectionId: string): Promise<void> {
    const notes = await this.getNotes();
    const note = notes.find(n => n.id === noteId);
    if (note && note.collectionIds) {
      note.collectionIds = note.collectionIds.filter(id => id !== collectionId);
      await this.saveNote(note);
    }
  }
}

export const storage = new StorageManager();