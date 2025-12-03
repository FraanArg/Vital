"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Trophy, Plus, Trash2, Circle, Swords, Target, Waves, Settings, X, Loader2 } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";
import { ICON_LIBRARY } from "../../lib/icon-library";
import IconPicker from "../../components/IconPicker";

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
    const iconMappings = useQuery(api.icons.getIconMappings);
    const createSport = useMutation(api.sports.createSport);
    const deleteSport = useMutation(api.sports.deleteSport);
    const saveMapping = useMutation(api.icons.saveIconMapping);

    const [isCreating, setIsCreating] = useState(false);
    const [newSportName, setNewSportName] = useState("");

    // Editing State
    const [editingSport, setEditingSport] = useState<{ id: string, name: string, icon: string } | null>(null);
    const [showIconPicker, setShowIconPicker] = useState(false);

    const [isCreatingSport, setIsCreatingSport] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const handleCreate = async () => {
        if (!newSportName) return;
        setIsCreatingSport(true);
        try {
            await createSport({ name: newSportName, icon: "Trophy" }); // Default icon for now
            setNewSportName("");
            setIsCreating(false);
        } finally {
            setIsCreatingSport(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingSport) return;
        setIsSavingEdit(true);
        try {
            await saveMapping({
                type: "sport",
                key: editingSport.id,
                icon: editingSport.icon,
                customLabel: editingSport.name
            });
            setEditingSport(null);
        } finally {
            setIsSavingEdit(false);
        }
    };

    if (!customSports || !iconMappings) {
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
                    {DEFAULT_SPORTS.map((sport) => {
                        const mapping = iconMappings.find(m => m.key === sport.id && m.type === "sport");
                        const label = mapping?.customLabel || sport.label;
                        // const iconName = mapping?.icon || "Trophy"; // Fallback if mapping exists but icon is weird, though usually it has icon
                        // Actually, if mapping exists, use its icon. If not, use sport.icon (component)
                        // But wait, sport.icon is a Component, mapping.icon is a string name.
                        // We need to resolve the component.

                        let Icon: any = sport.icon;
                        if (mapping?.icon && ICON_LIBRARY[mapping.icon]) {
                            Icon = ICON_LIBRARY[mapping.icon];
                        }

                        return (
                            <div key={sport.id} className="relative group p-4 rounded-2xl border border-border/50 bg-secondary/30 flex flex-col items-center gap-2 transition-all hover:bg-secondary/50">
                                <Icon className="w-8 h-8 text-foreground" />
                                <span className="font-medium text-center">{label}</span>

                                <button
                                    onClick={() => setEditingSport({
                                        id: sport.id,
                                        name: label,
                                        icon: mapping?.icon || "Trophy" // We need a string name for the picker. "Trophy" is a safe default if we don't know the original string name of the component. 
                                        // Actually, for default sports, we don't have their string names easily available in DEFAULT_SPORTS array unless we add them.
                                        // Let's assume we start with "Trophy" or try to map back if possible, but "Trophy" is fine for the picker default.
                                    })}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-background transition-all"
                                >
                                    <Settings className="w-3 h-3" />
                                </button>
                            </div>
                        );
                    })}
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
                            disabled={!newSportName || isCreatingSport}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            {isCreatingSport && <Loader2 className="w-4 h-4 animate-spin" />}
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

            {/* Edit Modal */}
            {editingSport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-card p-6 rounded-3xl border border-border shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg">Customize Sport</h3>
                            <button onClick={() => setEditingSport(null)} className="p-2 hover:bg-secondary rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Name</label>
                            <input
                                type="text"
                                value={editingSport.name}
                                onChange={(e) => setEditingSport({ ...editingSport, name: e.target.value })}
                                className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Icon</label>
                            <button
                                onClick={() => setShowIconPicker(true)}
                                className="w-full p-3 rounded-xl bg-secondary border-none flex items-center justify-between hover:bg-secondary/80 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {(() => {
                                        const Icon = ICON_LIBRARY[editingSport.icon] || Trophy;
                                        return <Icon className="w-6 h-6" />;
                                    })()}
                                    <span className="text-sm">{editingSport.icon}</span>
                                </div>
                                <span className="text-xs text-primary font-medium">Change</span>
                            </button>
                        </div>

                        <button
                            onClick={handleSaveEdit}
                            disabled={isSavingEdit}
                            className="w-full p-3 bg-primary text-primary-foreground rounded-xl font-bold mt-2 flex items-center justify-center gap-2"
                        >
                            {isSavingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                </div>
            )}

            {showIconPicker && editingSport && (
                <IconPicker
                    onSelect={(iconName) => {
                        setEditingSport({ ...editingSport, icon: iconName });
                        setShowIconPicker(false);
                    }}
                    onClose={() => setShowIconPicker(false)}
                />
            )}
        </div>
    );
}
