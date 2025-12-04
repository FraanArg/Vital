import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { FOOD_ICONS, ALL_FOOD_ICONS, getSuggestedIcon } from "../../lib/food-icons";

interface IconPickerProps {
    currentIcon: string;
    foodName?: string;
    onSelect: (icon: string) => void;
    onClose: () => void;
}

export default function IconPicker({ currentIcon, foodName, onSelect, onClose }: IconPickerProps) {
    const [activeCategory, setActiveCategory] = useState<string>("Fruits");
    const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
    const containerRef = useRef<HTMLDivElement>(null);

    const suggestedIcon = foodName ? getSuggestedIcon(foodName) : null;

    // Handle positioning
    useLayoutEffect(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.top;
            const spaceAbove = rect.top;

            // If it goes off screen (rect.bottom > window.innerHeight) and there is more space above, flip it
            if (rect.bottom > window.innerHeight && spaceAbove > spaceBelow) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setPosition('top');
            }
        }
    }, []);

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
            initial={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? 10 : -10 }}
            className={`absolute z-50 w-[320px] bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden ${position === 'bottom' ? 'mt-2 top-full' : 'mb-2 bottom-full'}`}
            ref={containerRef}
            style={{ left: "50%", translateX: "-50%" }}
        >
            <div className="p-3 border-b border-border/50 flex items-center justify-between bg-secondary/30">
                <h3 className="font-semibold text-sm">Select Icon</h3>
                <button onClick={onClose} className="p-1 hover:bg-secondary rounded-full transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                </button>
            </div>

            {suggestedIcon && (
                <div className="p-3 bg-primary/5 border-b border-border/50 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-medium text-primary">Suggested for &quot;{foodName}&quot;</p>
                    </div>
                    <button
                        onClick={() => {
                            onSelect(suggestedIcon);
                            onClose();
                        }}
                        className="w-10 h-10 flex items-center justify-center text-2xl rounded-xl bg-background border border-border/50 hover:scale-110 transition-transform shadow-sm"
                    >
                        {suggestedIcon}
                    </button>
                </div>
            )}

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
