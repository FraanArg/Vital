"use client";

import { useState, useRef, useMemo, useCallback, memo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Doc } from "../convex/_generated/dataModel";
import { Check, Plus, X, Clock } from "lucide-react";

const RECENT_ITEMS_KEY = "vital_recent_food_items";

interface FoodComboboxProps {
    selectedItems: string[];
    onItemsChange: (items: string[]) => void;
}

function FoodCombobox({ selectedItems, onItemsChange }: FoodComboboxProps) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [recentItems, setRecentItems] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const allItems = useQuery(api.foodItems.list);
    const createItem = useMutation(api.foodItems.create);
    const incrementUsage = useMutation(api.foodItems.incrementUsage);

    // Load recent items from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(RECENT_ITEMS_KEY);
            if (stored) {
                setRecentItems(JSON.parse(stored).slice(0, 8));
            }
        } catch (e) {
            console.error("Failed to load recent items:", e);
        }
    }, []);

    // Save item to recent history
    const saveToRecent = useCallback((name: string) => {
        try {
            const stored = localStorage.getItem(RECENT_ITEMS_KEY);
            let items: string[] = stored ? JSON.parse(stored) : [];
            // Remove if exists, add to front
            items = [name, ...items.filter(i => i.toLowerCase() !== name.toLowerCase())].slice(0, 20);
            localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(items));
            setRecentItems(items.slice(0, 8));
        } catch (e) {
            console.error("Failed to save recent item:", e);
        }
    }, []);

    // Memoize filtered suggestions
    const suggestions = useMemo(() => {
        if (!allItems) return [];
        const filtered = allItems.filter((item: Doc<"foodItems">) => {
            if (!query) return true;
            return item.name.toLowerCase().includes(query.toLowerCase());
        });
        return filtered
            .sort((a: Doc<"foodItems">, b: Doc<"foodItems">) => (b.usage_count || 0) - (a.usage_count || 0))
            .slice(0, 5);
    }, [allItems, query]);

    // Recent items not already selected
    const availableRecent = useMemo(() => {
        return recentItems.filter(item => !selectedItems.includes(item));
    }, [recentItems, selectedItems]);

    const addItem = async (name: string) => {
        if (!selectedItems.includes(name)) {
            const newItems = [...selectedItems, name];
            onItemsChange(newItems);
            saveToRecent(name);

            setQuery("");
            setIsOpen(false);
            inputRef.current?.focus();

            // Update or create food item in DB
            try {
                const existing = allItems?.find((i: Doc<"foodItems">) => i.name.toLowerCase() === name.toLowerCase());
                if (existing) {
                    await incrementUsage({ id: existing._id });
                } else {
                    await createItem({ name });
                }
            } catch (error) {
                console.error("Failed to save food item:", error);
            }
        } else {
            setQuery("");
            setIsOpen(false);
        }
    };

    const removeItem = (name: string) => {
        onItemsChange(selectedItems.filter(i => i !== name));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && query.trim()) {
            e.preventDefault();
            addItem(query.trim());
        }
    };

    return (
        <div className="space-y-3">
            {/* Selected Items as Chips */}
            {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedItems.map(item => (
                        <span
                            key={item}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                        >
                            {item}
                            <button
                                onClick={() => removeItem(item)}
                                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                aria-label={`Remove ${item}`}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add food (type & press Enter)"
                    className="w-full p-3.5 rounded-xl bg-background border border-border/50 focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground/60 text-base"
                />

                {/* Suggestions Dropdown */}
                {isOpen && (suggestions.length > 0 || query) && (
                    <div className="absolute w-full mt-2 bg-card border border-border/50 rounded-xl shadow-lg z-[100] overflow-hidden max-h-[200px] overflow-y-auto">
                        {suggestions.map((item: Doc<"foodItems">) => (
                            <button
                                key={item._id}
                                onClick={() => addItem(item.name)}
                                className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors flex items-center justify-between border-b border-border/30 last:border-none"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{item.icon || "🍽️"}</span>
                                    <span className="font-medium">{item.name}</span>
                                </div>
                                {selectedItems.includes(item.name) && (
                                    <Check className="w-4 h-4 text-primary" />
                                )}
                            </button>
                        ))}
                        {query && !suggestions.some((s: Doc<"foodItems">) => s.name.toLowerCase() === query.toLowerCase()) && (
                            <button
                                onClick={() => addItem(query)}
                                className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors text-primary font-medium flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add "{query}"
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Recent Items Quick Add */}
            {availableRecent.length > 0 && !isOpen && (
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Recent</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {availableRecent.slice(0, 5).map(item => (
                            <button
                                key={item}
                                onClick={() => addItem(item)}
                                className="px-3 py-1.5 text-sm rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            >
                                + {item}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default memo(FoodCombobox);
