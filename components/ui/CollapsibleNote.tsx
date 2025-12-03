import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CollapsibleNoteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    initialOpen?: boolean;
}

export default function CollapsibleNote({ value, onChange, placeholder = "Add a note...", initialOpen = false }: CollapsibleNoteProps) {
    const [isOpen, setIsOpen] = useState(initialOpen || value.length > 0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (value.length > 0 && !isOpen) {
            setIsOpen(true);
        }
    }, [value]);

    return (
        <div className="w-full">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors px-1"
                >
                    <Plus className="w-4 h-4" />
                    Add Note
                </button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                >
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full p-0 bg-transparent border-b border-border/50 focus:border-primary focus:ring-0 transition-colors resize-none min-h-[80px] text-sm leading-relaxed placeholder:text-muted-foreground/50"
                        autoFocus
                    />
                    {value.length === 0 && (
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-0 right-0 p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </motion.div>
            )}
        </div>
    );
}
