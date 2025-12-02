"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Trophy, Plus, Trash2, Circle, Swords, Target, Waves } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";
import { ICON_LIBRARY } from "../../lib/icon-library";

const DEFAULT_SPORTS = [
    { id: "padel", label: "Padel", icon: Swords },
    { id: "football", label: "Football", icon: Circle },
    { id: "tennis", label: "Tennis", icon: Target },
    { id: "basketball", label: "Basketball", icon: Circle },
    { id: "swimming", label: "Swimming", icon: Waves },
    { id: "volleyball", label: "Volleyball", icon: Circle },
];

export default function SportsTab() {
    const customSports = useQuery(api.sports.getSports);
    const createSport = useMutation(api.sports.createSport);
    const deleteSport = useMutation(api.sports.deleteSport);

    const [isCreating, setIsCreating] = useState(false);
    const [newSportName, setNewSportName] = useState("");

    const handleCreate = async () => {
        if (!newSportName) return;
        await createSport({ name: newSportName, icon: "Trophy" }); // Default icon for now
        setNewSportName("");
        setIsCreating(false);
    };

    if (!customSports) {
        return (
            <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 bg-card rounded-2xl border border-border/50 p-4">
                        <Skeleton className="w-8 h-8 rounded-full mb-2" />
                        <Skeleton className="w-20 h-4" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Default Sports */}
            <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Default Sports</h3>
                <div className="grid grid-cols-2 gap-3">
                    {DEFAULT_SPORTS.map((sport) => (
                        <div key={sport.id} className="p-4 rounded-2xl border border-border/50 bg-secondary/30 flex flex-col items-center gap-2 opacity-75">
                            <sport.icon className="w-8 h-8 text-foreground" />
                            <span className="font-medium">{sport.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Sports */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">My Sports</h3>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="text-primary text-sm font-medium flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>

                {isCreating && (
                    <div className="mb-4 p-4 bg-card rounded-2xl border border-border/50 flex gap-2">
                        <input
                            type="text"
                            placeholder="Sport Name"
                            value={newSportName}
                            onChange={(e) => setNewSportName(e.target.value)}
                            className="flex-1 p-2 rounded-lg bg-secondary border-none"
                            autoFocus
                        />
                        <button
                            onClick={handleCreate}
                            disabled={!newSportName}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
                        >
                            Save
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    {customSports.map((sport) => {
                        const Icon = ICON_LIBRARY[sport.icon] || Trophy;
                        return (
                            <div key={sport._id} className="relative group p-4 rounded-2xl border border-border/50 bg-card flex flex-col items-center gap-2">
                                <Icon className="w-8 h-8 text-foreground" />
                                <span className="font-medium">{sport.name}</span>
                                <button
                                    onClick={() => deleteSport({ id: sport._id })}
                                    className="absolute top-2 right-2 p-1.5 text-muted hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                    {customSports.length === 0 && !isCreating && (
                        <div className="col-span-2 text-center py-6 text-muted-foreground text-sm border border-dashed border-border/50 rounded-2xl">
                            No custom sports added.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
