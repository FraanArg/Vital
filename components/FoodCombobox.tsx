"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Doc } from "../convex/_generated/dataModel";
import { Check, Plus, X } from "lucide-react";

interface FoodComboboxProps {
    selectedItems: string[];
    onItemsChange: (items: string[]) => void;
}

export default function FoodCombobox({ selectedItems, onItemsChange }: FoodComboboxProps) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const allItems = useQuery(api.foodItems.list);
    const createItem = useMutation(api.foodItems.create);
    const incrementUsage = useMutation(api.foodItems.incrementUsage);

    // Filter and sort items
    const suggestions = allItems?.filter((item: Doc<"foodItems">) => {
        if (!query) return true;
        return item.name.toLowerCase().includes(query.toLowerCase());
    }).sort((a: Doc<"foodItems">, b: Doc<"foodItems">) => (b.usage_count || 0) - (a.usage_count || 0))
        .slice(0, 5);

    const addItem = async (name: string) => {
        if (!selectedItems.includes(name)) {
            const newItems = [...selectedItems, name];
            onItemsChange(newItems);

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

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {selectedItems.map(item => (
                    <span key={item} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium animate-in fade-in zoom-in duration-200">
                        {item}
                        <button onClick={() => removeItem(item)} className="hover:bg-primary/20 rounded-full p-0.5">
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>

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
                    onBlur={() => {
                        // Delay to allow item click to register
                        setTimeout(() => setIsOpen(false), 200);
                    }}
                    placeholder="Add food (e.g. 'Pancakes')"
                    className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && query) {
                            e.preventDefault();
                            addItem(query);
                        }
                    }}
                />

                {isOpen && (suggestions?.length || query) && (
                    <div className="absolute w-full mt-1 bg-card border border-border rounded-xl shadow-lg z-[100] overflow-hidden">
                        {suggestions?.map((item: Doc<"foodItems">) => (
                            <button
                                key={item._id}
                                onClick={() => addItem(item.name)}
                                className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors flex items-center justify-between group"
                            >
                                <span>{item.name}</span>
                                {selectedItems.includes(item.name) && <Check className="w-4 h-4 text-primary" />}
                            </button>
                        ))}
                        {query && !suggestions?.some((s: Doc<"foodItems">) => s.name.toLowerCase() === query.toLowerCase()) && (
                            <button
                                onClick={() => addItem(query)}
                                className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors text-primary font-medium flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add &quot;{query}&quot;
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
