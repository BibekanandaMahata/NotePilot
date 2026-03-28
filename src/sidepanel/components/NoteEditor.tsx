import { useRef } from 'react';
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
    AlignRight,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Quote,
    Code,
    Link,
    Image,
    CheckSquare
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

// Format command definitions
const FORMAT_COMMANDS: Record<string, { prefix: string; suffix: string; placeholder?: string }> = {
    bold: { prefix: '**', suffix: '**', placeholder: 'bold text' },
    italic: { prefix: '*', suffix: '*', placeholder: 'italic text' },
    underline: { prefix: '__', suffix: '__', placeholder: 'underlined text' },
    strikethrough: { prefix: '~~', suffix: '~~', placeholder: 'strikethrough text' },
    h1: { prefix: '# ', suffix: '\n', placeholder: 'Heading 1' },
    h2: { prefix: '## ', suffix: '\n', placeholder: 'Heading 2' },
    quote: { prefix: '> ', suffix: '\n', placeholder: 'quote' },
    code: { prefix: '`', suffix: '`', placeholder: 'code' },
    bullet: { prefix: '- ', suffix: '\n', placeholder: '' },
    numbered: { prefix: '1. ', suffix: '\n', placeholder: '' },
    task: { prefix: '- [ ] ', suffix: '\n', placeholder: '' },
    link: { prefix: '[', suffix: '](url)', placeholder: 'link text' },
    image: { prefix: '![', suffix: '](image-url)', placeholder: 'alt text' },
};

export const NoteEditor = ({ note, onChange, onBack, onSave, onDiscard, onDelete }: NoteEditorProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
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

    const insertFormat = (commandKey: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const command = FORMAT_COMMANDS[commandKey];
        if (!command) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        const selectedText = value.substring(start, end);

        let newText: string;

        if (selectedText) {
            newText = value.substring(0, start) + command.prefix + selectedText + command.suffix + value.substring(end);
        } else {
            const placeholder = command.placeholder || '';
            newText = value.substring(0, start) + command.prefix + placeholder + command.suffix + value.substring(end);
        }

        onChange({ ...note, content: newText });
        
        setTimeout(() => {
            textarea.focus();
            const cursorPos = selectedText 
                ? start + command.prefix.length + selectedText.length + command.suffix.length
                : start + command.prefix.length + (command.placeholder?.length || 0);
            textarea.setSelectionRange(cursorPos, cursorPos);
        }, 0);
    };

    const ToolbarButton = ({ onClick, icon: Icon, title }: { onClick: () => void; icon: React.ComponentType<{ size?: number }>; title: string }) => (
        <button onClick={onClick} title={title} className={`p-1.5 rounded-md transition-colors ${toolbarClass}`}>
            <Icon size={15} />
        </button>
    );

    const ToolbarDivider = () => (
        <div className={`w-px h-4 mx-1 ${light ? 'bg-gray-300' : 'bg-white/30'}`} />
    );

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
            <div className={`flex items-center gap-1 px-4 py-2 border-b ${dividerClass} flex-wrap`}>
                <ToolbarButton onClick={() => insertFormat('bold')} icon={Bold} title="Bold" />
                <ToolbarButton onClick={() => insertFormat('italic')} icon={Italic} title="Italic" />
                <ToolbarButton onClick={() => insertFormat('underline')} icon={Underline} title="Underline" />
                <ToolbarButton onClick={() => insertFormat('strikethrough')} icon={Strikethrough} title="Strikethrough" />
                <ToolbarDivider />
                <ToolbarButton onClick={() => insertFormat('h1')} icon={Heading1} title="Heading 1" />
                <ToolbarButton onClick={() => insertFormat('h2')} icon={Heading2} title="Heading 2" />
                <ToolbarDivider />
                <ToolbarButton onClick={() => {}} icon={AlignLeft} title="Align Left" />
                <ToolbarButton onClick={() => {}} icon={AlignCenter} title="Align Center" />
                <ToolbarButton onClick={() => {}} icon={AlignRight} title="Align Right" />
                <ToolbarDivider />
                <ToolbarButton onClick={() => insertFormat('bullet')} icon={List} title="Bullet List" />
                <ToolbarButton onClick={() => insertFormat('numbered')} icon={ListOrdered} title="Numbered List" />
                <ToolbarButton onClick={() => insertFormat('task')} icon={CheckSquare} title="Task List" />
                <ToolbarDivider />
                <ToolbarButton onClick={() => insertFormat('quote')} icon={Quote} title="Quote" />
                <ToolbarButton onClick={() => insertFormat('code')} icon={Code} title="Code" />
                <ToolbarButton onClick={() => insertFormat('link')} icon={Link} title="Link" />
                <ToolbarButton onClick={() => insertFormat('image')} icon={Image} title="Image" />
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
                    ref={textareaRef}
                    className={`flex-1 w-full min-h-[400px] outline-none resize-none bg-transparent text-base leading-relaxed font-body ${textareaClass}`}
                    placeholder="Start writing... (supports Markdown formatting)"
                    value={note.content}
                    onChange={e => onChange({ ...note, content: e.target.value })}
                />
            </div>
        </div>
    );
};
