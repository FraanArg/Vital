"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { Dumbbell, Trophy, Activity, Footprints, Timer, Plus, Trash2, ChevronDown, ChevronUp, Circle, Waves, Swords, Target, Settings, LucideIcon } from "lucide-react";
import RoutineManager from "./RoutineManager";
import IconPicker from "../../components/IconPicker";
import { ICON_LIBRARY } from "../../lib/icon-library";

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
    const [workout, setWorkout] = useState<{ name: string; sets: { reps: number; weight: number }[] }[]>([]);

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

    const handleSave = async () => {
        if (!activity) return;

        const finalType = activity === "sports" ? subActivity : activity;
        if (!finalType) return;

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
    };

    const handleRoutineSelect = (routine: Doc<"routines">) => {
        setWorkout(routine.exercises.map((e) => ({
            name: e.name,
            sets: Array(e.defaultSets).fill({ reps: 0, weight: 0 })
        })));
        setGymMode("log");
    };

    const updateSet = (exerciseIndex: number, setIndex: number, field: "reps" | "weight", value: number) => {
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

    // Activity Selection View
    if (!activity) {
        return (
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

    // Fetch dynamic sports
    const dynamicSports = useQuery(api.sports.getSports);

    interface SportItem {
        id: string;
        label: string;
        icon: LucideIcon;
        isCustom?: boolean;
        _id?: string;
    }

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
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setActivity(null)} className="text-sm text-muted-foreground hover:text-foreground">
                        ← Back
                    </button>
                    <h3 className="font-semibold">Gym Workout</h3>
                </div>

                <RoutineManager onSelect={handleRoutineSelect} onClose={onClose} />

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
                        type="number"
                        value={distance}
                        onChange={(e) => setDistance(parseFloat(e.target.value))}
                        placeholder="0.0"
                        className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary text-lg font-semibold"
                    />
                </div>
            )}

            {/* Gym Logger */}
            {activity === "gym" && (
                <div className="space-y-6">
                    {workout.map((exercise, i) => (
                        <div key={i} className="space-y-3 p-4 rounded-2xl bg-secondary/20 border border-border/50">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold">{exercise.name}</h4>
                            </div>

                            <div className="space-y-2">
                                <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 text-xs text-muted-foreground font-medium px-1">
                                    <span className="w-6 text-center">#</span>
                                    <span>kg</span>
                                    <span>reps</span>
                                    <span className="w-8"></span>
                                </div>
                                {exercise.sets.map((set, j) => (
                                    <div key={j} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center">
                                        <span className="w-6 text-center text-sm font-medium text-muted-foreground">{j + 1}</span>
                                        <input
                                            type="number"
                                            value={set.weight || ""}
                                            onChange={(e) => updateSet(i, j, "weight", parseFloat(e.target.value))}
                                            placeholder="0"
                                            className="p-2 rounded-lg bg-background border border-border/50 text-center"
                                        />
                                        <input
                                            type="number"
                                            value={set.reps || ""}
                                            onChange={(e) => updateSet(i, j, "reps", parseFloat(e.target.value))}
                                            placeholder="0"
                                            className="p-2 rounded-lg bg-background border border-border/50 text-center"
                                        />
                                        <button onClick={() => removeSet(i, j)} className="p-2 text-muted hover:text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => addSet(i)} className="text-xs text-primary font-medium flex items-center gap-1 mt-2">
                                    <Plus className="w-3 h-3" /> Add Set
                                </button>
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
                    className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary min-h-[80px] resize-none"
                />
            </div>

            <button
                onClick={handleSave}
                className="w-full p-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95"
            >
                Save Activity
            </button>
        </div>
    );
}
