import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { FOOD_ICONS, ALL_FOOD_ICONS } from "../../lib/food-icons";

interface IconPickerProps {
    currentIcon: string;
    onSelect: (icon: string) => void;
    onClose: () => void;
}

export default function IconPicker({ currentIcon, onSelect, onClose }: IconPickerProps) {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("Fruits");
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter icons based on search
    const filteredIcons = search
        ? ALL_FOOD_ICONS.filter(icon => true) // Emojis are hard to search by text without a mapping. For now, just show all or maybe implement a mapping later.
        // Actually, let's just show all if search is empty, or maybe filter categories?
        // Searching emojis is tricky without a name map. Let's stick to categories for now.
        : null;

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-50 mt-2 w-[320px] bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden"
            ref={containerRef}
            style={{ left: "50%", translateX: "-50%" }}
        >
            <div className="p-3 border-b border-border/50 flex items-center justify-between bg-secondary/30">
                <h3 className="font-semibold text-sm">Select Icon</h3>
                <button onClick={onClose} className="p-1 hover:bg-secondary rounded-full transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                </button>
            </div>

            <div className="flex overflow-x-auto p-2 gap-1 border-b border-border/50 no-scrollbar">
                {Object.keys(FOOD_ICONS).map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === category
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="h-[200px] overflow-y-auto p-3 grid grid-cols-6 gap-2">
                {FOOD_ICONS[activeCategory as keyof typeof FOOD_ICONS].map((icon) => (
                    <button
                        key={icon}
                        onClick={() => {
                            onSelect(icon);
                            onClose();
                        }}
                        className={`w-10 h-10 flex items-center justify-center text-2xl rounded-xl transition-all hover:scale-110 hover:bg-secondary ${icon === currentIcon ? "bg-primary/20 ring-2 ring-primary" : ""
                            }`}
                    >
                        {icon}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}
