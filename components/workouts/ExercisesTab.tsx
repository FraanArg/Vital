"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Plus, Dumbbell, Loader2 } from "lucide-react";
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

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async () => {
        if (!newExercise.name) return;
        setIsSubmitting(true);
        try {
            await createExercise(newExercise);
            setIsCreating(false);
            setNewExercise({ name: "", muscle: "Chest", category: "Barbell", icon: "💪" });
            setSearch("");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCreating) {
        return (
            <div className="space-y-4 p-4 bg-card rounded-2xl border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                    <button
                        onClick={() => setIsCreating(false)}
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        ← Back
                    </button>
                    <h3 className="font-semibold text-lg">New Exercise</h3>
                </div>

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
                        <input
                            list="muscles"
                            type="text"
                            value={newExercise.muscle}
                            onChange={e => setNewExercise({ ...newExercise, muscle: e.target.value })}
                            className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                            placeholder="Select or type..."
                        />
                        <datalist id="muscles">
                            {["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Other"].map(m => (
                                <option key={m} value={m} />
                            ))}
                        </datalist>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <input
                            list="categories"
                            type="text"
                            value={newExercise.category}
                            onChange={e => setNewExercise({ ...newExercise, category: e.target.value })}
                            className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                            placeholder="Select or type..."
                        />
                        <datalist id="categories">
                            {["Barbell", "Dumbbell", "Machine", "Bodyweight", "Cable", "Weighted Bodyweight", "Assisted Bodyweight", "Kettlebell", "Plyometric", "Cardio", "Other"].map(c => (
                                <option key={c} value={c} />
                            ))}
                        </datalist>
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    disabled={!newExercise.name || isSubmitting}
                    className="w-full p-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Exercise"}
                </button>
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
                {search && (
                    <button
                        onClick={() => {
                            setNewExercise({ ...newExercise, name: search });
                            setIsCreating(true);
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-secondary transition-colors flex items-center gap-2 text-primary"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Create "{search}"</span>
                    </button>
                )}

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

                {filteredExercises?.length === 0 && !search && (
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="mb-4">No exercises found.</p>
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
