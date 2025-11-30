"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { ICON_LIBRARY, ICON_CATEGORIES } from "../lib/icon-library";

interface IconPickerProps {
    onSelect: (iconName: string) => void;
    onClose: () => void;
}

export default function IconPicker({ onSelect, onClose }: IconPickerProps) {
    const [search, setSearch] = useState("");

    const filteredIcons = Object.keys(ICON_LIBRARY).filter(name =>
        name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-border flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search icons..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary text-sm"
                            autoFocus
                        />
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {search ? (
                        <div className="grid grid-cols-5 gap-3">
                            {filteredIcons.map(name => {
                                const Icon = ICON_LIBRARY[name];
                                return (
                                    <button
                                        key={name}
                                        onClick={() => onSelect(name)}
                                        className="aspect-square flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-secondary transition-colors"
                                    >
                                        <Icon className="w-6 h-6" />
                                        <span className="text-[10px] text-muted-foreground truncate w-full text-center">{name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(ICON_CATEGORIES).map(([category, icons]) => (
                                <div key={category}>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 px-1">{category}</h4>
                                    <div className="grid grid-cols-5 gap-3">
                                        {icons.map(name => {
                                            const Icon = ICON_LIBRARY[name];
                                            if (!Icon) return null;
                                            return (
                                                <button
                                                    key={name}
                                                    onClick={() => onSelect(name)}
                                                    className="aspect-square flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-secondary transition-colors"
                                                >
                                                    <Icon className="w-6 h-6" />
                                                    <span className="text-[10px] text-muted-foreground truncate w-full text-center">{name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
