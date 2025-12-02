"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Plus, Dumbbell } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";

export default function ExercisesTab() {
    const exercises = useQuery(api.exercises.getExercises);
    const createExercise = useMutation(api.exercises.createExercise);
    const [search, setSearch] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newExercise, setNewExercise] = useState({ name: "", muscle: "Chest", category: "Barbell", icon: "💪" });

    const filteredExercises = exercises?.filter(ex =>
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.muscle.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = async () => {
        if (!newExercise.name) return;
        await createExercise(newExercise);
        setIsCreating(false);
        setNewExercise({ name: "", muscle: "Chest", category: "Barbell", icon: "💪" });
    };

    if (!exercises) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="w-32 h-4" />
                            <Skeleton className="w-20 h-3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (isCreating) {
        return (
            <div className="space-y-4 p-4 bg-card rounded-2xl border border-border/50">
                <h3 className="font-semibold text-lg">New Exercise</h3>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <input
                        type="text"
                        value={newExercise.name}
                        onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
                        placeholder="e.g. Bulgarian Split Squat"
                        className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Icon (Emoji)</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newExercise.icon}
                            onChange={e => setNewExercise({ ...newExercise, icon: e.target.value })}
                            placeholder="💪"
                            className="w-16 p-3 text-center rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                        />
                        <div className="flex-1 flex gap-2 overflow-x-auto p-1">
                            {["💪", "🏋️‍♂️", "🦵", "🏃", "🧘", "🤸", "🚴", "🏊", "🧗", "🥊"].map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => setNewExercise({ ...newExercise, icon: emoji })}
                                    className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Muscle</label>
                        <select
                            value={newExercise.muscle}
                            onChange={e => setNewExercise({ ...newExercise, muscle: e.target.value })}
                            className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary appearance-none"
                        >
                            {["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <select
                            value={newExercise.category}
                            onChange={e => setNewExercise({ ...newExercise, category: e.target.value })}
                            className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary appearance-none"
                        >
                            {["Barbell", "Dumbbell", "Machine", "Bodyweight", "Cable", "Weighted Bodyweight", "Assisted Bodyweight", "Kettlebell", "Plyometric", "Cardio"].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        onClick={() => setIsCreating(false)}
                        className="flex-1 p-3 rounded-xl font-medium hover:bg-secondary transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!newExercise.name}
                        className="flex-1 p-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50"
                    >
                        Create
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search exercises..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            <div className="space-y-2">
                {filteredExercises?.map((ex) => (
                    <div key={ex._id} className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 hover:bg-secondary/30 transition-colors">
                        <div className="p-3 bg-secondary rounded-xl text-2xl">
                            {ex.icon || <Dumbbell className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                            <div className="font-semibold">{ex.name}</div>
                            <div className="text-xs text-muted-foreground">{ex.muscle} • {ex.category}</div>
                        </div>
                    </div>
                ))}
                {filteredExercises?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="mb-4">No exercises found.</p>
                        <button
                            onClick={() => createExercise({ name: "Seed Defaults", muscle: "System", category: "System" }).then(() => window.location.reload())} // Hacky trigger for now, better to call the seed mutation directly
                            className="text-sm text-primary hover:underline"
                        >
                            {/* Actually let's use the proper seed mutation */}
                        </button>
                        <SeedButton />
                    </div>
                )}
            </div>
        </div>
    );
}

function SeedButton() {
    const seed = useMutation(api.exercises.seedDefaults);
    return (
        <button
            onClick={() => seed()}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
        >
            Load Default Exercises
        </button>
    );
}
