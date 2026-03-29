import { useRef, useEffect } from 'react';
import { type Note } from '../../services/storage/StorageManager';
import { 
    ChevronLeft, 
    Trash2, 
    Bold, 
    Italic, 
    Underline, 
    Strikethrough,
    AlignLeft, 
    AlignCenter, 
    AlignRight
} from 'lucide-react';

type NoteEditorProps = {
    note: Note | null;
    onChange: (note: Note) => void;
    onBack: () => void;
    onSave: () => void;
    onDiscard: () => void;
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


export const NoteEditor = ({ note, onChange, onBack, onSave, onDiscard, onDelete }: NoteEditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);
    
    if (!note) return null;

    const bg = note.color ?? getComputedStyle(document.documentElement).getPropertyValue('--color-note-card-default').trim();
    const light = isLightColor(bg);
    const headerBtnClass = light
        ? 'text-gray-700 hover:bg-black/10'
        : 'text-white hover:bg-white/20';
    const titleClass = light ? 'text-gray-900 placeholder-gray-400' : 'text-white placeholder-white/50';
    const editorClass = light ? 'text-gray-800' : 'text-white/90';
    const dividerClass = light ? 'border-gray-200' : 'border-white/20';

    const execCommand = (command: string, value: string = '') => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            onChange({ ...note, content: editorRef.current.innerHTML });
        }
    };

    const ToolbarButton = ({ onClick, icon: Icon, title }: { onClick: () => void; icon: React.ComponentType<{ size?: number }>; title: string }) => (
        <button 
            onClick={onClick} 
            title={title} 
            className={`p-1 rounded transition-colors ${light ? 'text-gray-600 hover:bg-gray-100' : 'text-white/80 hover:bg-white/20'}`}
        >
            <Icon size={14} />
        </button>
    );

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== note.content) {
            editorRef.current.innerHTML = note.content || '<div><br></div>';
        }
    }, [note.id]);

    const handleEditorChange = () => {
        if (editorRef.current) {
            onChange({ ...note, content: editorRef.current.innerHTML });
        }
    };

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
                        Save
                    </button>
                    <button
                        onClick={onDiscard}
                        className={`flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 transition-colors ${headerBtnClass}`}
                    >
                        Undo
                    </button>
                    <button
                        onClick={onDelete}
                        className={`flex items-center gap-1.5 text-sm font-medium rounded-lg px-2 py-1.5 transition-colors text-red-500 hover:bg-red-50`}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* ── Rich Text Toolbar ── */}
            <div className={`flex items-center gap-0.5 px-2 py-1.5 border-b ${dividerClass}`}>
                <ToolbarButton onClick={() => execCommand('bold')} icon={Bold} title="Bold" />
                <ToolbarButton onClick={() => execCommand('italic')} icon={Italic} title="Italic" />
                <ToolbarButton onClick={() => execCommand('underline')} icon={Underline} title="Underline" />
                <ToolbarButton onClick={() => execCommand('strikeThrough')} icon={Strikethrough} title="Strikethrough" />
                <div className={`w-px h-3 mx-1 ${light ? 'bg-gray-300' : 'bg-white/30'}`} />
                <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={AlignLeft} title="Align Left" />
                <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={AlignCenter} title="Align Center" />
                <ToolbarButton onClick={() => execCommand('justifyRight')} icon={AlignRight} title="Align Right" />
            </div>

            {/* ── Writing Area ── */}
            <div className="flex-1 overflow-y-auto scrollbar-custom px-6 py-5 flex flex-col gap-4">
                <input
                    className={`w-full text-2xl font-bold outline-none bg-transparent font-body ${titleClass}`}
                    placeholder="Title"
                    value={note.title}
                    onChange={e => onChange({ ...note, title: e.target.value })}
                />
                <div
                    ref={editorRef}
                    contentEditable
                    className={`flex-1 w-full min-h-[400px] outline-none text-base leading-relaxed font-body ${editorClass}`}
                    style={{ 
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap'
                    }}
                    onInput={handleEditorChange}
                    suppressContentEditableWarning
                />
            </div>
        </div>
    );
};
