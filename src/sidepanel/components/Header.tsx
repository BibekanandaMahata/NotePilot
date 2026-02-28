import { Settings, Save, ChevronLeft, MoreVertical, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type HeaderProps = {
    view: 'list' | 'editor';
    onBack: () => void;
    onSave?: () => void;
    onDelete?: () => void;
};

export const Header = ({ view, onBack, onSave, onDelete }: HeaderProps) => {
    const [showSettings, setShowSettings] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="px-4 py-3 flex justify-between items-center text-content min-h-[56px] relative z-10 border-b border-surface-muted">

            {/* Left Action / Navigation */}
            <div className="flex-1 flex items-center">
                {view === 'editor' && (
                    <button
                        onClick={onBack}
                        className="flex items-center text-sm font-medium text-content-muted hover:text-content transition-colors md:hidden"
                    >
                        <ChevronLeft size={18} className="mr-1" /> Back
                    </button>
                )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
                {view === 'editor' && onSave && (
                    <button
                        onClick={onSave}
                        className="text-brand hover:text-brand-hover transition-colors flex items-center gap-1.5 text-sm font-medium hover:bg-brand/5 px-3 py-1.5 rounded-md"
                    >
                        <Save size={16} /> Save
                    </button>
                )}

                {/* Options / Settings Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-1.5 text-content-muted hover:text-content hover:bg-surface-muted rounded-md transition-colors"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {showSettings && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-surface-muted rounded-md shadow-lg overflow-hidden py-1">
                            <button className="w-full text-left px-4 py-2 text-sm text-content hover:bg-surface-muted flex items-center gap-2 transition-colors">
                                <Settings size={14} /> Settings
                            </button>

                            {view === 'editor' && onDelete && (
                                <>
                                    <div className="h-px bg-surface-muted my-1" />
                                    <button
                                        onClick={() => {
                                            onDelete();
                                            setShowSettings(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                    >
                                        <Trash2 size={14} /> Delete Note
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
