"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Plus, Trash2, Dumbbell, Save, X } from "lucide-react";
import { Id, Doc } from "../../convex/_generated/dataModel";

interface RoutineManagerProps {
    onSelect: (routine: Doc<"routines">) => void;
    onClose: () => void;
}

export default function RoutineManager({ onSelect, onClose }: RoutineManagerProps) {
    const routines = useQuery(api.routines.getRoutines);
    const createRoutine = useMutation(api.routines.createRoutine);
    const deleteRoutine = useMutation(api.routines.deleteRoutine);

    const [isCreating, setIsCreating] = useState(false);
    const [newRoutineName, setNewRoutineName] = useState("");
    const [newExercises, setNewExercises] = useState<{ name: string; defaultSets: number }[]>([
        { name: "", defaultSets: 3 }
    ]);

    const handleCreate = async () => {
        if (!newRoutineName || newExercises.some(e => !e.name)) return;

        await createRoutine({
            name: newRoutineName,
            exercises: newExercises
        });
        setIsCreating(false);
        setNewRoutineName("");
        setNewExercises([{ name: "", defaultSets: 3 }]);
    };

    const addExerciseRow = () => {
        setNewExercises([...newExercises, { name: "", defaultSets: 3 }]);
    };

    const removeExerciseRow = (index: number) => {
        setNewExercises(newExercises.filter((_, i) => i !== index));
    };

    const updateExercise = (index: number, field: "name" | "defaultSets", value: string | number) => {
        const updated = [...newExercises];
        updated[index] = { ...updated[index], [field]: value };
        setNewExercises(updated);
    };

    if (isCreating) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">New Routine</h3>
                    <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-secondary rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Routine Name (e.g., Push Day)"
                    value={newRoutineName}
                    onChange={(e) => setNewRoutineName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                />

                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                    {newExercises.map((ex, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <input
                                type="text"
                                placeholder="Exercise Name"
                                value={ex.name}
                                onChange={(e) => updateExercise(i, "name", e.target.value)}
                                className="flex-1 p-2 rounded-lg bg-secondary/50 border-none text-sm"
                            />
                            <input
                                type="number"
                                placeholder="Sets"
                                value={ex.defaultSets}
                                onChange={(e) => updateExercise(i, "defaultSets", parseInt(e.target.value) || 0)}
                                className="w-16 p-2 rounded-lg bg-secondary/50 border-none text-sm text-center"
                            />
                            <button onClick={() => removeExerciseRow(i)} className="p-2 text-muted hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button onClick={addExerciseRow} className="text-sm text-primary font-medium flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add Exercise
                    </button>
                </div>

                <button
                    onClick={handleCreate}
                    disabled={!newRoutineName}
                    className="w-full p-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50"
                >
                    Save Routine
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select Routine</h3>
                <button
                    onClick={() => setIsCreating(true)}
                    className="text-sm bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                    + New
                </button>
            </div>

            <div className="grid gap-3 max-h-[50vh] overflow-y-auto">
                {routines?.map((routine) => (
                    <div key={routine._id} className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex items-center justify-between group">
                        <button
                            onClick={() => onSelect(routine)}
                            className="flex-1 text-left"
                        >
                            <div className="font-semibold">{routine.name}</div>
                            <div className="text-xs text-muted-foreground">
                                {routine.exercises.length} exercises
                            </div>
                        </button>
                        <button
                            onClick={() => deleteRoutine({ id: routine._id })}
                            className="p-2 text-muted hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {routines?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No routines yet. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    );
}
