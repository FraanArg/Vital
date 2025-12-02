"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Plus, Trash2, ChevronRight, Dumbbell } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";
import RoutineBuilder from "./RoutineBuilder";
import { Doc } from "../../convex/_generated/dataModel";

export default function RoutinesTab() {
    const routines = useQuery(api.routines.getRoutines);
    const deleteRoutine = useMutation(api.routines.deleteRoutine);
    const [isCreating, setIsCreating] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState<Doc<"routines"> | null>(null);

    if (isCreating || editingRoutine) {
        return (
            <RoutineBuilder
                initialData={editingRoutine}
                onClose={() => {
                    setIsCreating(false);
                    setEditingRoutine(null);
                }}
            />
        );
    }

    if (!routines) {
        return (
            <div className="grid gap-4">
                {[1, 2].map(i => (
                    <div key={i} className="h-32 bg-card rounded-2xl border border-border/50 p-4">
                        <Skeleton className="w-1/2 h-6 mb-2" />
                        <Skeleton className="w-1/3 h-4" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <button
                onClick={() => setIsCreating(true)}
                className="w-full p-4 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create New Routine</span>
            </button>

            <div className="grid gap-4">
                {routines.map((routine) => (
                    <div key={routine._id} className="group relative bg-card rounded-2xl border border-border/50 p-5 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{routine.name}</h3>
                                <p className="text-sm text-muted-foreground">{routine.exercises.length} Exercises</p>
                            </div>
                            <div className="p-2 bg-secondary rounded-full">
                                <Dumbbell className="w-5 h-5 text-primary" />
                            </div>
                        </div>

                        <div className="space-y-1 mb-4">
                            {routine.exercises.slice(0, 3).map((ex, i) => (
                                <div key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                    <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                    {ex.name}
                                </div>
                            ))}
                            {routine.exercises.length > 3 && (
                                <div className="text-xs text-muted-foreground pl-3">
                                    +{routine.exercises.length - 3} more
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                            <button
                                onClick={() => setEditingRoutine(routine)}
                                className="flex-1 py-2 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => deleteRoutine({ id: routine._id })}
                                className="p-2 text-muted hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                aria-label="Delete routine"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
