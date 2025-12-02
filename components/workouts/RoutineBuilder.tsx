"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { Search, Plus, Trash2, X, GripVertical, Loader2, Pencil } from "lucide-react";

interface RoutineBuilderProps {
    initialData?: Doc<"routines"> | null;
    onClose: () => void;
}

export default function RoutineBuilder({ initialData, onClose }: RoutineBuilderProps) {
    const exercises = useQuery(api.exercises.getExercises);
    const createRoutine = useMutation(api.routines.createRoutine);
    const updateRoutine = useMutation(api.routines.updateRoutine); // Need to implement this backend mutation if not exists, or just delete/create

    const [name, setName] = useState(initialData?.name || "");
    const [selectedExercises, setSelectedExercises] = useState<{ name: string; defaultSets: number; day?: string; targetRpe?: string; targetReps?: string }[]>(
        initialData?.exercises || []
    );
    const [days, setDays] = useState<string[]>(() => {
        if (initialData?.exercises) {
            const uniqueDays = Array.from(new Set(initialData.exercises.map(e => e.day || "Day 1")));
            return uniqueDays.length > 0 ? uniqueDays : ["Day 1"];
        }
        return ["Day 1"];
    });
    const [activeDay, setActiveDay] = useState("Day 1");

    const [showPicker, setShowPicker] = useState(false);
    const [search, setSearch] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [isCreatingExerciseLoading, setIsCreatingExerciseLoading] = useState(false);

    const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

    const handleSave = async () => {
        if (!name || selectedExercises.length === 0) return;
        setIsSaving(true);
        try {
            if (initialData) {
                await updateRoutine({
                    id: initialData._id,
                    name,
                    exercises: selectedExercises
                });
            } else {
                await createRoutine({ name, exercises: selectedExercises });
            }
            // onClose(); // User wants to keep it open
            alert("Routine saved successfully!");
        } finally {
            setIsSaving(false);
        }
    };

    const addExercise = (ex: Doc<"exercises">) => {
        if (replacingIndex !== null) {
            const updated = [...selectedExercises];
            updated[replacingIndex] = {
                ...updated[replacingIndex],
                name: ex.name
            };
            setSelectedExercises(updated);
            setReplacingIndex(null);
        } else {
            setSelectedExercises([...selectedExercises, {
                name: ex.name,
                defaultSets: 3,
                day: activeDay
            }]);
        }
        setShowPicker(false);
        setSearch("");
    };

    const removeExercise = (index: number) => {
        setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
    };

    const updateExercise = (index: number, field: keyof typeof selectedExercises[0], value: string | number) => {
        const updated = [...selectedExercises];
        updated[index] = { ...updated[index], [field]: value };
        setSelectedExercises(updated);
    };

    const addDay = () => {
        const newDay = `Day ${days.length + 1}`;
        setDays([...days, newDay]);
        setActiveDay(newDay);
    };

    const removeDay = (dayToRemove: string) => {
        if (days.length <= 1) return;
        setDays(days.filter(d => d !== dayToRemove));
        setSelectedExercises(selectedExercises.filter(ex => ex.day !== dayToRemove));
        if (activeDay === dayToRemove) {
            setActiveDay(days[0]);
        }
    };

    const createExercise = useMutation(api.exercises.createExercise);
    const [isCreatingExercise, setIsCreatingExercise] = useState(false);
    const [newExerciseData, setNewExerciseData] = useState({ name: "", muscle: "Chest", category: "Barbell", icon: "💪" });
    const [activeField, setActiveField] = useState<"muscle" | "category" | null>(null);

    const handleCreateExercise = async () => {
        if (!newExerciseData.name) return;
        setIsCreatingExerciseLoading(true);
        try {
            await createExercise(newExerciseData);

            if (replacingIndex !== null) {
                const updated = [...selectedExercises];
                updated[replacingIndex] = {
                    ...updated[replacingIndex],
                    name: newExerciseData.name
                };
                setSelectedExercises(updated);
                setReplacingIndex(null);
            } else {
                setSelectedExercises([...selectedExercises, {
                    name: newExerciseData.name,
                    defaultSets: 3,
                    day: activeDay
                }]);
            }

            setIsCreatingExercise(false);
            setShowPicker(false);
            setSearch("");
            setNewExerciseData({ name: "", muscle: "Chest", category: "Barbell", icon: "💪" });
        } finally {
            setIsCreatingExerciseLoading(false);
        }
    };

    if (showPicker) {
        const filtered = exercises?.filter(ex =>
            ex.name.toLowerCase().includes(search.toLowerCase())
        );

        if (isCreatingExercise) {
            return (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={() => setIsCreatingExercise(false)}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            ← Back
                        </button>
                        <h3 className="font-semibold">Create Exercise</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <input
                                type="text"
                                value={newExerciseData.name}
                                onChange={e => setNewExerciseData({ ...newExerciseData, name: e.target.value })}
                                className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g. Bulgarian Split Squat"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 relative">
                                <label className="text-sm font-medium">Muscle</label>
                                <input
                                    type="text"
                                    value={newExerciseData.muscle}
                                    onChange={e => setNewExerciseData({ ...newExerciseData, muscle: e.target.value })}
                                    onFocus={() => setActiveField("muscle")}
                                    onBlur={() => setTimeout(() => setActiveField(null), 200)}
                                    className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                                    placeholder="Select or type..."
                                />
                                {activeField === "muscle" && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                                        {["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Other"]
                                            .filter(m => m.toLowerCase().includes(newExerciseData.muscle.toLowerCase()))
                                            .map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => setNewExerciseData({ ...newExerciseData, muscle: m })}
                                                    className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors text-sm"
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 relative">
                                <label className="text-sm font-medium">Category</label>
                                <input
                                    type="text"
                                    value={newExerciseData.category}
                                    onChange={e => setNewExerciseData({ ...newExerciseData, category: e.target.value })}
                                    onFocus={() => setActiveField("category")}
                                    onBlur={() => setTimeout(() => setActiveField(null), 200)}
                                    className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                                    placeholder="Select or type..."
                                />
                                {activeField === "category" && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                                        {["Barbell", "Dumbbell", "Machine", "Bodyweight", "Cable", "Weighted Bodyweight", "Assisted Bodyweight", "Kettlebell", "Plyometric", "Cardio", "Other"]
                                            .filter(c => c.toLowerCase().includes(newExerciseData.category.toLowerCase()))
                                            .map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setNewExerciseData({ ...newExerciseData, category: c })}
                                                    className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors text-sm"
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Icon</label>
                            <div className="flex gap-2">
                                <div className="w-12 h-12 flex items-center justify-center bg-secondary rounded-xl text-2xl">
                                    {newExerciseData.icon}
                                </div>
                                <div className="flex-1 flex gap-2 overflow-x-auto p-1">
                                    {["💪", "🏋️‍♂️", "🦵", "🏃", "🧘", "🤸", "🚴", "🏊", "🧗", "🥊"].map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => setNewExerciseData({ ...newExerciseData, icon: emoji })}
                                            className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCreateExercise}
                            disabled={!newExerciseData.name || isCreatingExerciseLoading}
                            className="w-full p-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isCreatingExerciseLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create & Add"}
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => { setShowPicker(false); setReplacingIndex(null); }} className="text-sm text-muted-foreground hover:text-foreground">
                        ← Back
                    </button>
                    <h3 className="font-semibold">{replacingIndex !== null ? "Replace Exercise" : `Add Exercise to ${activeDay}`}</h3>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                        autoFocus
                    />
                </div>

                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {filtered?.map(ex => (
                        <button
                            key={ex._id}
                            onClick={() => addExercise(ex)}
                            className="w-full text-left p-3 rounded-xl hover:bg-secondary transition-colors flex justify-between items-center"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center bg-secondary rounded-lg text-lg">
                                    {ex.icon || "💪"}
                                </div>
                                <span className="font-medium">{ex.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{ex.muscle}</span>
                        </button>
                    ))}

                    {search && (
                        <button
                            onClick={() => {
                                setNewExerciseData({ ...newExerciseData, name: search });
                                setIsCreatingExercise(true);
                            }}
                            className="w-full text-left p-3 rounded-xl hover:bg-secondary transition-colors flex items-center gap-2 text-primary"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Create &quot;{search}&quot;</span>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                    <h3 className="font-semibold text-lg">{initialData ? "Edit Routine" : "New Routine"}</h3>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!name || selectedExercises.length === 0 || isSaving}
                    className="text-primary font-bold disabled:opacity-50 flex items-center gap-2"
                >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save
                </button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Routine Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Push Day"
                        className="w-full p-4 rounded-2xl bg-secondary/50 border-none focus:ring-2 focus:ring-primary text-lg font-semibold"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {days.map(day => (
                            <div key={day} className="flex items-center">
                                <button
                                    onClick={() => setActiveDay(day)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeDay === day
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                        }`}
                                >
                                    {day}
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={addDay}
                            className="px-3 py-2 rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
                            title="Add Day"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-muted-foreground">Exercises ({activeDay})</label>
                                {days.length > 1 && (
                                    <button
                                        onClick={() => removeDay(activeDay)}
                                        className="text-xs text-destructive hover:underline"
                                    >
                                        Remove Day
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setShowPicker(true)}
                                className="text-sm text-primary font-medium flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </div>

                        <div className="space-y-2">
                            {selectedExercises
                                .map((ex, i) => ({ ...ex, originalIndex: i }))
                                .filter(ex => (ex.day || "Day 1") === activeDay)
                                .map((ex) => {
                                    const exerciseDef = exercises?.find(e => e.name === ex.name);
                                    return (
                                        <div key={ex.originalIndex} className="flex flex-col gap-2 p-3 bg-card rounded-xl border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                                                <div className="w-8 h-8 flex items-center justify-center bg-secondary rounded-lg text-lg">
                                                    {exerciseDef?.icon || "💪"}
                                                </div>
                                                <div className="flex-1 font-medium">{ex.name}</div>
                                                <button
                                                    onClick={() => {
                                                        setReplacingIndex(ex.originalIndex);
                                                        setShowPicker(true);
                                                    }}
                                                    className="p-2 text-muted hover:text-primary transition-colors"
                                                    title="Replace Exercise"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => removeExercise(ex.originalIndex)}
                                                    className="p-2 text-muted hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-4 pl-10">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">Sets</span>
                                                    <input
                                                        type="number"
                                                        value={ex.defaultSets}
                                                        onChange={(e) => updateExercise(ex.originalIndex, "defaultSets", parseInt(e.target.value) || 0)}
                                                        className="w-12 p-1 text-center rounded-lg bg-secondary text-sm"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">Target RPE</span>
                                                    <input
                                                        type="text"
                                                        value={ex.targetRpe || ""}
                                                        onChange={(e) => updateExercise(ex.originalIndex, "targetRpe", e.target.value)}
                                                        placeholder="-"
                                                        className="w-16 p-1 text-center rounded-lg bg-secondary text-sm"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">Target Reps</span>
                                                    <input
                                                        type="text"
                                                        value={ex.targetReps || ""}
                                                        onChange={(e) => updateExercise(ex.originalIndex, "targetReps", e.target.value)}
                                                        placeholder="-"
                                                        className="w-16 p-1 text-center rounded-lg bg-secondary text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                            {selectedExercises.filter(ex => (ex.day || "Day 1") === activeDay).length === 0 && (
                                <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border/50">
                                    No exercises in {activeDay}.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
