import { Sparkles, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface SuggestionRowProps {
    suggestions: { name: string; icon?: LucideIcon }[];
    onSelect: (name: string) => void;
    label?: string;
    type?: "food" | "exercise" | "default";
}

export default function SuggestionRow({ suggestions, onSelect, label = "Suggested for you", type = "default" }: SuggestionRowProps) {
    if (!suggestions || suggestions.length === 0) return null;

    const colors = {
        food: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
        exercise: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
        default: "bg-primary/10 text-primary hover:bg-primary/20"
    };

    const iconColors = {
        food: "text-orange-500",
        exercise: "text-emerald-500",
        default: "text-primary"
    };

    return (
        <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                <Sparkles className={`w-3 h-3 ${iconColors[type]}`} />
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors whitespace-nowrap font-medium text-sm ${colors[type]}`}
                    >
                        {item.icon && <item.icon className="w-4 h-4" />}
                        <span className="capitalize">{item.name.replace('_', ' ')}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
