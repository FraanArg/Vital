import { Sparkles, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface SuggestionRowProps {
    suggestions: { name: string; icon?: LucideIcon }[];
    onSelect: (name: string) => void;
    label?: string;
}

export default function SuggestionRow({ suggestions, onSelect, label = "Suggested for you" }: SuggestionRowProps) {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                <Sparkles className="w-3 h-3 text-primary" />
                {label}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {suggestions.map((item, i) => (
                    <motion.button
                        key={item.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => onSelect(item.name)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors whitespace-nowrap font-medium text-sm"
                    >
                        {item.icon && <item.icon className="w-4 h-4" />}
                        <span className="capitalize">{item.name.replace('_', ' ')}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
