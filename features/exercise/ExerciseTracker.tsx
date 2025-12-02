"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { Dumbbell, Trophy, Activity, Footprints, Timer, Plus, Trash2, ChevronDown, ChevronUp, Circle, Waves, Swords, Target, Settings, LucideIcon, Loader2 } from "lucide-react";
import RoutineManager from "./RoutineManager";
import IconPicker from "../../components/IconPicker";
import { ICON_LIBRARY } from "../../lib/icon-library";
import SuggestionRow from "../../components/SuggestionRow";
import ExerciseHistory from "../../components/workouts/ExerciseHistory";

const ACTIVITIES = [
    { id: "sports", label: "Sports", icon: Trophy },
    { id: "gym", label: "Gym", icon: Dumbbell },
    { id: "run", label: "Running", icon: Timer },
    { id: "walk", label: "Walking", icon: Footprints },
];

const SPORTS = [
    { id: "padel", label: "Padel", icon: Swords }, // Competition/Rackets
    { id: "football", label: "Football", icon: Circle }, // Ball
    { id: "tennis", label: "Tennis", icon: Target }, // Accuracy/Ball
    { id: "basketball", label: "Basketball", icon: Circle }, // Ball
    { id: "swimming", label: "Swimming", icon: Waves },
    { id: "volleyball", label: "Volleyball", icon: Circle },
];

export default function ExerciseTracker({ onClose, selectedDate }: { onClose: () => void, selectedDate: Date }) {
    const [activity, setActivity] = useState<string | null>(null);
    const [subActivity, setSubActivity] = useState<string | null>(null); // For Sports
    const [duration, setDuration] = useState(60);
    const [distance, setDistance] = useState<number | "">("");
    const [notes, setNotes] = useState("");

    // Gym State
    const [gymMode, setGymMode] = useState<"select" | "log">("select");
    const [workout, setWorkout] = useState<{
        name: string;
        sets: { reps: number; weight: number; rpe?: number }[];
        targetRpe?: string;
        notes?: string;
    }[]>([]);

    // Icon Customization State
    const [showIconPicker, setShowIconPicker] = useState<{ type: "sport", id: string } | null>(null);
    const saveIconMapping = useMutation(api.icons.saveIconMapping);
    const iconMappings = useQuery(api.icons.getIconMappings);

    const createLog = useMutation(api.logs.createLog).withOptimisticUpdate((localStore, args) => {
        const { date, ...logData } = args;
        const logDate = new Date(date);
        const start = new Date(logDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(logDate);
        end.setHours(23, 59, 59, 999);

        const queryArgs = { from: start.toISOString(), to: end.toISOString() };
        const existingLogs = localStore.getQuery(api.logs.getLogs, queryArgs);

        if (existingLogs) {
            const newLog: any = {
                _id: crypto.randomUUID(),
                _creationTime: Date.now(),
                userId: "temp-optimistic-id",
                date: date,
                ...logData
            };
            localStore.setQuery(api.logs.getLogs, queryArgs, [...existingLogs, newLog]);
        }
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!activity) return;

        const finalType = activity === "sports" ? subActivity : activity;
        if (!finalType) return;

        setIsSaving(true);
        try {
            const exerciseData: any = {
                type: finalType,
                duration: duration,
                notes: notes.trim() || undefined,
            };

            if ((finalType === "run" || finalType === "walk") && distance) {
                exerciseData.distance = Number(distance);
            }

            if (finalType === "gym") {
                exerciseData.workout = workout;
            }

            await createLog({
                exercise: exerciseData,
                date: selectedDate.toISOString()
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const [selectedRoutine, setSelectedRoutine] = useState<Doc<"routines"> | null>(null);

    const handleRoutineSelect = (routine: Doc<"routines">) => {
        const uniqueDays = Array.from(new Set(routine.exercises.map(e => e.day || "Day 1")));

        if (uniqueDays.length > 1) {
            setSelectedRoutine(routine);
        } else {
            loadDayExercises(routine, uniqueDays[0]);
        }
    };

    const loadDay = (day: string) => {
        if (selectedRoutine) {
            loadDayExercises(selectedRoutine, day);
            setSelectedRoutine(null);
        }
    };

    const loadDayExercises = (routine: Doc<"routines">, day: string) => {
        const dayExercises = routine.exercises.filter(e => (e.day || "Day 1") === day);

        setWorkout(dayExercises.map(e => ({
            name: e.name,
            sets: Array(e.defaultSets).fill({ reps: 0, weight: 0 }),
            targetRpe: e.targetRpe,
            notes: ""
        })));
        setGymMode("log");
    };

    const updateSet = (exerciseIndex: number, setIndex: number, field: "reps" | "weight" | "rpe", value: number) => {
        const newWorkout = [...workout];
        newWorkout[exerciseIndex].sets[setIndex] = {
            ...newWorkout[exerciseIndex].sets[setIndex],
            [field]: value
        };
        setWorkout(newWorkout);
    };

    const addSet = (exerciseIndex: number) => {
        const newWorkout = [...workout];
        const lastSet = newWorkout[exerciseIndex].sets[newWorkout[exerciseIndex].sets.length - 1] || { reps: 0, weight: 0 };
        newWorkout[exerciseIndex].sets.push({ ...lastSet });
        setWorkout(newWorkout);
    };

    const removeSet = (exerciseIndex: number, setIndex: number) => {
        const newWorkout = [...workout];
        newWorkout[exerciseIndex].sets = newWorkout[exerciseIndex].sets.filter((_, i) => i !== setIndex);
        setWorkout(newWorkout);
    };

    const updateNotes = (exerciseIndex: number, notes: string) => {
        const newWorkout = [...workout];
        newWorkout[exerciseIndex].notes = notes;
        setWorkout(newWorkout);
    };

    // Fetch dynamic sports
    const dynamicSports = useQuery(api.sports.getSports);
    const suggestions = useQuery(api.suggestions.getSuggestions, { type: "exercise" });

    interface SportItem {
        id: string;
        label: string;
        icon: LucideIcon;
        isCustom?: boolean;
        _id?: string;
    }

    // ... (existing code)

    // Activity Selection View
    if (!activity) {
        return (
            <div className="space-y-4">
                <SuggestionRow
                    suggestions={suggestions?.map(s => ({ name: s.name })) || []}
                    type="exercise"
                    onSelect={(name) => {
                        // Map suggestion name back to ID
                        const activityId = ACTIVITIES.find(a => a.id === name)?.id || name;
                        setActivity(activityId);
                    }}
                />
                <div className="grid grid-cols-2 gap-3">
                    {ACTIVITIES.map((act) => (
                        <button
                            key={act.id}
                            onClick={() => setActivity(act.id)}
                            className="p-4 rounded-2xl border border-border/50 flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95 bg-secondary/50 hover:bg-secondary"
                        >
                            <act.icon className="w-8 h-8 text-foreground" />
                            <span className="font-medium">{act.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Icon Customization


    const getCustomIcon = (key: string, defaultIcon: LucideIcon) => {
        const mapping = iconMappings?.find(m => m.type === "sport" && m.key === key);
        return mapping && ICON_LIBRARY[mapping.icon] ? ICON_LIBRARY[mapping.icon] : defaultIcon;
    };

    const handleIconSelect = async (iconName: string) => {
        if (!showIconPicker) return;
        await saveIconMapping({
            type: "sport",
            key: showIconPicker.id,
            icon: iconName
        });
        setShowIconPicker(null);
    };



    // Merge defaults with dynamic sports, avoiding duplicates by ID/Name
    const allSports: SportItem[] = [
        ...SPORTS.map(s => ({ ...s, isCustom: false })),
        ...(dynamicSports || []).map(s => ({
            id: s.name.toLowerCase(), // Use name as ID for simplicity
            label: s.name,
            icon: ICON_LIBRARY[s.icon] || Trophy,
            isCustom: true,
            _id: s._id
        }))
    ].filter((sport, index, self) =>
        index === self.findIndex((t) => t.id === sport.id)
    );

    // Sports Sub-selection
    if (activity === "sports" && !subActivity) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setActivity(null)} className="text-sm text-muted-foreground hover:text-foreground">
                        ← Back
                    </button>
                    <h3 className="font-semibold">Select Sport</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {allSports.map((sport) => {
                        // For custom sports, the icon is already resolved. For defaults, we check for overrides.
                        const Icon = sport.isCustom ? sport.icon : getCustomIcon(sport.id, sport.icon);

                        return (
                            <div key={sport.id} className="relative group">
                                <button
                                    onClick={() => setSubActivity(sport.id)}
                                    className="w-full p-4 rounded-2xl border border-border/50 flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95 bg-secondary/50 hover:bg-secondary"
                                >
                                    {/* @ts-ignore - Icon type compatibility */}
                                    <Icon className="w-8 h-8 text-foreground" />
                                    <span className="font-medium">{sport.label}</span>
                                </button>
                                {!sport.isCustom && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowIconPicker({ type: "sport", id: sport.id });
                                        }}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-background transition-all"
                                        title="Customize Icon"
                                    >
                                        <Settings className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
                {showIconPicker && (
                    <IconPicker
                        onSelect={handleIconSelect}
                        onClose={() => setShowIconPicker(null)}
                    />
                )}
            </div>
        );
    }

    // Gym Routine Selection View
    if (activity === "gym" && gymMode === "select") {
        if (selectedRoutine) {
            const uniqueDays = Array.from(new Set(selectedRoutine.exercises.map(e => e.day || "Day 1")));

            return (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setSelectedRoutine(null)} className="text-sm text-muted-foreground hover:text-foreground">
                            ← Back
                        </button>
                        <h3 className="font-semibold">Select Day</h3>
                    </div>
                    <div className="grid gap-3">
                        {uniqueDays.map(day => (
                            <button
                                key={day}
                                onClick={() => loadDay(day)}
                                className="w-full p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left font-medium flex justify-between items-center"
                            >
                                <span>{day}</span>
                                <span className="text-xs text-muted-foreground">
                                    {selectedRoutine.exercises.filter(e => (e.day || "Day 1") === day).length} exercises
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setActivity(null)} className="text-sm text-muted-foreground hover:text-foreground">
                        ← Back
                    </button>
                    <h3 className="font-semibold">Gym Workout</h3>
                </div>

                <div className="grid gap-3 max-h-[40vh] overflow-y-auto">
                    {/* We can still show a simple list here or just a link */}
                    <RoutineManager onSelect={handleRoutineSelect} onClose={onClose} />
                </div>

                <div className="text-center">
                    <a href="/workouts" className="text-sm text-primary hover:underline">
                        Manage Routines & Exercises
                    </a>
                </div>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
                </div>

                <button
                    onClick={() => { setWorkout([]); setGymMode("log"); }}
                    className="w-full p-3 border border-border rounded-xl font-medium hover:bg-secondary transition-colors"
                >
                    Start Empty Workout
                </button>
            </div>
        );
    }

    // Main Logging View
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => {
                        if (activity === "gym" && gymMode === "log") {
                            setGymMode("select");
                        } else if (activity === "sports") {
                            setSubActivity(null);
                        } else {
                            setActivity(null);
                        }
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                >
                    ← Back
                </button>
                <h3 className="font-semibold capitalize">{activity === "sports" ? subActivity : activity}</h3>
                <div className="w-8" /> {/* Spacer */}
            </div>

            {/* Duration Input */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Duration (minutes)</label>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="10"
                        max="180"
                        step="5"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="flex-1 accent-primary"
                    />
                    <span className="text-xl font-bold w-16 text-right">{duration}m</span>
                </div>
            </div>

            {/* Distance Input (Run/Walk) */}
            {(activity === "run" || activity === "walk") && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Distance (km)</label>
                    <input
                        inputMode="decimal"
                        type="number"
                        value={distance}
                        onChange={(e) => setDistance(parseFloat(e.target.value))}
                        placeholder="0.0"
                        className="w-full p-4 rounded-2xl bg-secondary/50 border border-border/10 focus:bg-secondary focus:ring-2 focus:ring-emerald-500/50 transition-all text-lg font-semibold"
                    />
                </div>
            )}

            {/* Gym Logger */}
            {activity === "gym" && (
                <div className="space-y-6">
                    {workout.map((exercise, i) => (
                        <div key={i} className="space-y-3 p-4 rounded-2xl bg-secondary/20 border border-border/50">
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold">{exercise.name}</h4>
                                    {exercise.targetRpe && (
                                        <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                                            Target RPE: {exercise.targetRpe}
                                        </span>
                                    )}
                                </div>
                                <ExerciseHistory exerciseName={exercise.name} />
                            </div>

                            <div className="space-y-2">
                                <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 text-xs text-muted-foreground font-medium px-1">
                                    <span className="w-6 text-center">#</span>
                                    <span>kg</span>
                                    <span>reps</span>
                                    <span>RPE</span>
                                    <span className="w-8"></span>
                                </div>
                                {exercise.sets.map((set, j) => (
                                    <div key={j} className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 items-center">
                                        <span className="w-6 text-center text-sm font-medium text-muted-foreground">{j + 1}</span>
                                        <input
                                            inputMode="decimal"
                                            type="number"
                                            value={set.weight || ""}
                                            onChange={(e) => updateSet(i, j, "weight", parseFloat(e.target.value))}
                                            placeholder="0"
                                            className="p-2 rounded-lg bg-background/50 border border-border/50 text-center focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                        <input
                                            inputMode="decimal"
                                            type="number"
                                            value={set.reps || ""}
                                            onChange={(e) => updateSet(i, j, "reps", parseFloat(e.target.value))}
                                            placeholder="0"
                                            className="p-2 rounded-lg bg-background/50 border border-border/50 text-center focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                        <input
                                            inputMode="decimal"
                                            type="number"
                                            value={set.rpe || ""}
                                            onChange={(e) => updateSet(i, j, "rpe", parseFloat(e.target.value))}
                                            placeholder="-"
                                            className="p-2 rounded-lg bg-background/50 border border-border/50 text-center focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                        <button onClick={() => removeSet(i, j)} className="p-2 text-muted hover:text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => addSet(i)} className="text-xs text-emerald-500 font-medium flex items-center gap-1 mt-2">
                                    <Plus className="w-3 h-3" /> Add Set
                                </button>
                            </div>

                            <div className="pt-2">
                                <textarea
                                    value={exercise.notes || ""}
                                    onChange={(e) => updateNotes(i, e.target.value)}
                                    placeholder="Notes (e.g. Seat height, cues...)"
                                    className="w-full p-2 text-sm rounded-lg bg-background/50 border border-border/50 focus:ring-2 focus:ring-primary min-h-[60px]"
                                />
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => {
                            const name = prompt("Exercise Name:");
                            if (name) setWorkout([...workout, { name, sets: [{ reps: 0, weight: 0 }] }]);
                        }}
                        className="w-full p-3 border border-dashed border-border rounded-xl text-muted-foreground hover:bg-secondary/50 transition-colors"
                    >
                        + Add Exercise
                    </button>
                </div>
            )}

            {/* Notes Input */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Notes (Optional)</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How did it go?"
                    className="w-full p-4 rounded-2xl bg-secondary/50 border border-border/10 focus:bg-secondary focus:ring-2 focus:ring-emerald-500/50 transition-all min-h-[80px] resize-none"
                />
            </div>

            <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
            >
                {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Activity"}
            </button>
        </div>
    );
}
