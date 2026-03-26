import { type Note } from '../../services/storage/StorageManager';
import { ChevronLeft, Save, Trash2, Bold, Italic, Underline, AlignLeft } from 'lucide-react';

type NoteEditorProps = {
    note: Note | null;
    onChange: (note: Note) => void;
    onBack: () => void;
    onSave: () => void;
    onDelete: () => void;
};

// Calculate if bg color is light to determine text/icon contrast
function isLightColor(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55;
}

export const NoteEditor = ({ note, onChange, onBack, onSave, onDelete }: NoteEditorProps) => {
    if (!note) return null;

    const bg = note.color ?? getComputedStyle(document.documentElement).getPropertyValue('--color-note-card-default').trim();
    const light = isLightColor(bg);
    const headerBtnClass = light
        ? 'text-gray-700 hover:bg-black/10'
        : 'text-white hover:bg-white/20';
    const titleClass = light ? 'text-gray-900 placeholder-gray-400' : 'text-white placeholder-white/50';
    const textareaClass = light ? 'text-gray-800 placeholder-gray-400' : 'text-white/90 placeholder-white/50';
    const toolbarClass = light ? 'text-gray-600 hover:bg-black/10' : 'text-white/70 hover:bg-white/20';
    const dividerClass = light ? 'border-gray-200' : 'border-white/20';

    return (
        <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: bg }}>
            {/* ── Editor Header ── */}
            <div className={`flex items-center justify-between px-4 pt-4 pb-3 border-b ${dividerClass}`}>
                <button
                    onClick={onBack}
                    className={`flex items-center gap-1 text-sm font-medium rounded-lg px-2 py-1.5 transition-colors ${headerBtnClass}`}
                >
                    <ChevronLeft size={18} />
                    Back
                </button>

                <div className="flex items-center gap-1">
                    <button
                        onClick={onSave}
                        className={`flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3 py-1.5 transition-colors ${headerBtnClass}`}
                    >
                        <Save size={16} />
                        Save
                    </button>
                    <button
                        onClick={onDelete}
                        className={`flex items-center gap-1.5 text-sm font-medium rounded-lg px-2 py-1.5 transition-colors text-red-500 hover:bg-red-50`}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* ── Minimal Toolbar ── */}
            <div className={`flex items-center gap-1 px-4 py-2 border-b ${dividerClass}`}>
                <button className={`p-1.5 rounded-md transition-colors ${toolbarClass}`}><Bold size={15} /></button>
                <button className={`p-1.5 rounded-md transition-colors ${toolbarClass}`}><Italic size={15} /></button>
                <button className={`p-1.5 rounded-md transition-colors ${toolbarClass}`}><Underline size={15} /></button>
                <div className={`w-px h-4 mx-1 ${light ? 'bg-gray-300' : 'bg-white/30'}`} />
                <button className={`p-1.5 rounded-md transition-colors ${toolbarClass}`}><AlignLeft size={15} /></button>
            </div>

            {/* ── Writing Area ── */}
            <div className="flex-1 overflow-y-auto scrollbar-custom px-6 py-5 flex flex-col gap-4">
                <input
                    className={`w-full text-2xl font-bold outline-none bg-transparent font-body ${titleClass}`}
                    placeholder="Title"
                    value={note.title}
                    onChange={e => onChange({ ...note, title: e.target.value })}
                />
                <textarea
                    className={`flex-1 w-full min-h-[400px] outline-none resize-none bg-transparent text-base leading-relaxed font-body ${textareaClass}`}
                    value={note.content}
                    onChange={e => onChange({ ...note, content: e.target.value })}
                />
            </div>
        </div>
    );
};
