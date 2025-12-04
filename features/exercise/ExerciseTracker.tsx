import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { Dumbbell, Trophy, Activity, Plus, Trash2, Settings, ChevronDown, ChevronUp, Check, Circle } from "lucide-react";
import RoutineManager from "./RoutineManager";
import IconPicker from "../../components/IconPicker";
import { ICON_LIBRARY } from "../../lib/icon-library";
import SuggestionRow from "../../components/SuggestionRow";
import TrackerLayout from "../../components/ui/TrackerLayout";
import ExerciseHistory from "../../components/workouts/ExerciseHistory";
import SaveButton from "../../components/ui/SaveButton";
import { DEFAULT_SPORTS, ACTIVITIES } from "../../lib/constants";
import ChipSelector from "../../components/ui/ChipSelector";
import TimePicker from "../../components/ui/TimePicker";
import CollapsibleNote from "../../components/ui/CollapsibleNote";

export default function ExerciseTracker({ onClose, selectedDate, initialData }: { onClose: () => void, selectedDate: Date, initialData?: Doc<"logs"> | null }) {
    const [activity, setActivity] = useState<string | null>(initialData?.exercise?.type || null);
    const [subActivity, setSubActivity] = useState<string | null>(initialData?.exercise?.type === "sports" ? initialData.exercise.type : null);
    const [footballMode, setFootballMode] = useState(false);

    const [duration, setDuration] = useState(initialData?.exercise?.duration || 60);
    const [distance, setDistance] = useState<number | "">(initialData?.exercise?.distance || "");
    const [notes, setNotes] = useState(initialData?.exercise?.notes || "");

    // Time tracking
    const [timeMode, setTimeMode] = useState<"duration" | "range">("duration");
    const [startTime, setStartTime] = useState("18:00");
    const [endTime, setEndTime] = useState("19:30");

    // Calculate duration from range
    useEffect(() => {
        if (timeMode === "range") {
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);
            let diff = (endH * 60 + endM) - (startH * 60 + startM);
            if (diff < 0) diff += 24 * 60; // Handle overnight
            setDuration(diff);
        }
    }, [startTime, endTime, timeMode]);

    const [gymMode, setGymMode] = useState<"select" | "log">(initialData?.exercise?.workout ? "log" : "select");
    const [workout, setWorkout] = useState<{
        name: string;
        sets: { reps: number; weight: number; rpe?: number }[];
        targetRpe?: string;
        targetReps?: string;
        alternateName?: string;
        routineNotes?: string;
        notes?: string;
        isCollapsed?: boolean;
    }[]>(initialData?.exercise?.workout?.map(w => ({ ...w, isCollapsed: false })) || []);

    // Initialize activity from initialData
    useEffect(() => {
        if (initialData?.exercise) {
            const type = initialData.exercise.type;
            if (["gym", "run", "walk"].includes(type)) {
                setActivity(type);
            } else {
                // Assume it's a sport
                setActivity("sports");
                setSubActivity(type);
            }
        }
    }, [initialData]);

    const updateLog = useMutation(api.logs.updateLog);

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
                time: timeMode === "range" ? startTime : undefined,
            };

            if ((finalType === "run" || finalType === "walk") && distance) {
                exerciseData.distance = Number(distance);
            }

            if (finalType === "gym") {
                exerciseData.workout = workout.map(({ isCollapsed, ...w }) => w);
            }

            if (initialData) {
                await updateLog({
                    id: initialData._id,
                    exercise: exerciseData,
                    date: selectedDate.toISOString()
                });
            } else {
                await createLog({
                    exercise: exerciseData,
                    date: selectedDate.toISOString()
                });
            }
            onClose();
        } catch (error) {
            console.error("Failed to save exercise:", error);
            alert("Failed to save exercise.");
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
            targetReps: e.targetReps,
            alternateName: e.alternateName,
            routineNotes: e.notes,
            notes: "",
            isCollapsed: false
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

    const toggleCollapse = (index: number) => {
        const newWorkout = [...workout];
        newWorkout[index].isCollapsed = !newWorkout[index].isCollapsed;
        setWorkout(newWorkout);
    };

    // Fetch dynamic sports
    const dynamicSports = useQuery(api.sports.getSports);
    const suggestions = useQuery(api.suggestions.getSuggestions, { type: "exercise" });

    interface SportItem {
        id: string;
        label: string;
        icon: any;
        isCustom?: boolean;
        _id?: string;
    }

    // Activity Selection View
    if (!activity) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Activity Type</label>
                    <ChipSelector
                        options={ACTIVITIES.map(a => ({ ...a, icon: <a.icon className="w-4 h-4" /> }))}
                        selectedId={null}
                        onSelect={setActivity}
                    />
                </div>

                <SuggestionRow
                    suggestions={suggestions?.map(s => ({ name: s.name })) || []}
                    type="exercise"
                    onSelect={(name) => {
                        // Map suggestion name back to ID
                        const activityId = ACTIVITIES.find(a => a.id === name)?.id || name;
                        setActivity(activityId);
                    }}
                />
            </div>
        );
    }

    // Icon Customization
    const getCustomIcon = (key: string, defaultIcon: any) => {
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

    // Merge defaults with dynamic sports, prioritizing dynamic sports (custom overrides)
    const allSports: SportItem[] = [
        ...(dynamicSports || []).map(s => ({
            id: s.name.toLowerCase(),
            label: s.name,
            icon: ICON_LIBRARY[s.icon] || Trophy,
            isCustom: true,
            _id: s._id
        })),
        ...DEFAULT_SPORTS.map(s => ({ ...s, isCustom: false })),
    ].filter((sport, index, self) =>
        index === self.findIndex((t) => t.id === sport.id)
    );



    const FOOTBALL_TYPES = [
        { id: "Football 5 Match", label: "Football 5 Match", icon: Circle },
        { id: "Football 6 Match", label: "Football 6 Match", icon: Circle },
        { id: "Football 8 Match", label: "Football 8 Match", icon: Circle },
        { id: "Football League Match", label: "Football League Match", icon: Trophy },
        { id: "Football Club Training", label: "Football Club Training", icon: Activity },
    ];

    // Football Selection View
    if (activity === "sports" && footballMode) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setFootballMode(false)} className="text-sm text-muted-foreground hover:text-foreground">
                        ← Back
                    </button>
                    <h3 className="font-semibold">Select Football Type</h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {FOOTBALL_TYPES.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => {
                                setSubActivity(type.id);
                                setFootballMode(false);
                            }}
                            className="w-full p-4 rounded-2xl border border-border/50 flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] bg-secondary/50 hover:bg-secondary"
                        >
                            <type.icon className="w-6 h-6 text-foreground" />
                            <span className="font-medium">{type.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

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
                        const Icon = sport.isCustom ? sport.icon : getCustomIcon(sport.id, sport.icon);

                        return (
                            <div key={sport.id} className="relative group">
                                <button
                                    onClick={() => {
                                        if (sport.id === "football") {
                                            setFootballMode(true);
                                        } else {
                                            setSubActivity(sport.id);
                                        }
                                    }}
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
        <TrackerLayout
            title={activity === "sports" ? (subActivity ? subActivity.charAt(0).toUpperCase() + subActivity.slice(1) : "Sports") : (activity ? activity.charAt(0).toUpperCase() + activity.slice(1) : "Exercise")}
            onClose={onClose}
            onBack={() => {
                if (activity === "gym" && gymMode === "log") {
                    setGymMode("select");
                } else if (activity === "sports") {
                    setSubActivity(null);
                } else {
                    setActivity(null);
                }
            }}
        >
            {/* Duration / Time Input */}
            <div className="space-y-4">
                <div className="flex justify-center p-1 bg-secondary/50 rounded-xl">
                    <button
                        onClick={() => setTimeMode("duration")}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${timeMode === "duration" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Duration
                    </button>
                    <button
                        onClick={() => setTimeMode("range")}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${timeMode === "range" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Time Range
                    </button>
                </div>

                {timeMode === "duration" ? (
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
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Start</label>
                            <TimePicker value={startTime} onChange={setStartTime} className="w-full" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">End</label>
                            <TimePicker value={endTime} onChange={setEndTime} className="w-full" />
                        </div>
                    </div>
                )}
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
                        className="w-full p-0 text-3xl font-bold bg-transparent border-none focus:ring-0 placeholder:text-muted-foreground/30"
                    />
                </div>
            )}

            {/* Gym Logger */}
            {activity === "gym" && (
                <div className="space-y-4">
                    {workout.map((exercise, i) => (
                        <div key={i} className={`space-y-3 p-4 rounded-2xl border transition-all ${exercise.isCollapsed ? "bg-secondary/20 border-transparent" : "bg-card border-border/50 shadow-sm"}`}>
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleCollapse(i)}>
                                <div className="flex flex-col">
                                    <h4 className="font-bold text-lg">{exercise.name}</h4>
                                    {exercise.isCollapsed && (
                                        <span className="text-xs text-muted-foreground">
                                            {exercise.sets.filter(s => s.weight > 0 || s.reps > 0).length} sets completed
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {exercise.isCollapsed ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronUp className="w-5 h-5 text-muted-foreground" />}
                                </div>
                            </div>

                            {!exercise.isCollapsed && (
                                <div className="space-y-4 pt-2">
                                    {exercise.alternateName && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newWorkout = [...workout];
                                                const currentName = newWorkout[i].name;
                                                newWorkout[i].name = newWorkout[i].alternateName!;
                                                newWorkout[i].alternateName = currentName;
                                                setWorkout(newWorkout);
                                            }}
                                            className="text-xs text-muted-foreground hover:text-primary text-left flex items-center gap-1"
                                        >
                                            <Activity className="w-3 h-3" />
                                            Switch to {exercise.alternateName}
                                        </button>
                                    )}

                                    {exercise.routineNotes && (
                                        <div className="text-xs text-amber-500/90 bg-amber-500/10 p-2 rounded-lg">
                                            💡 {exercise.routineNotes}
                                        </div>
                                    )}

                                    <ExerciseHistory exerciseName={exercise.name} />

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
                                                    className="p-2 rounded-lg bg-secondary/30 border-none text-center focus:ring-2 focus:ring-primary/50"
                                                />
                                                <input
                                                    inputMode="decimal"
                                                    type="number"
                                                    value={set.reps || ""}
                                                    onChange={(e) => updateSet(i, j, "reps", parseFloat(e.target.value))}
                                                    placeholder="0"
                                                    className="p-2 rounded-lg bg-secondary/30 border-none text-center focus:ring-2 focus:ring-primary/50"
                                                />
                                                <input
                                                    inputMode="decimal"
                                                    type="number"
                                                    value={set.rpe || ""}
                                                    onChange={(e) => updateSet(i, j, "rpe", parseFloat(e.target.value))}
                                                    placeholder="-"
                                                    className="p-2 rounded-lg bg-secondary/30 border-none text-center focus:ring-2 focus:ring-primary/50"
                                                />
                                                <button onClick={() => removeSet(i, j)} className="p-2 text-muted hover:text-destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <button onClick={() => addSet(i)} className="text-xs text-primary font-medium flex items-center gap-1 mt-2 px-2 py-1 hover:bg-primary/10 rounded-md transition-colors w-fit">
                                            <Plus className="w-3 h-3" /> Add Set
                                        </button>
                                    </div>

                                    <CollapsibleNote
                                        value={exercise.notes || ""}
                                        onChange={(val) => updateNotes(i, val)}
                                        placeholder="Exercise notes..."
                                    />
                                </div>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={() => {
                            const name = prompt("Exercise Name:");
                            if (name) setWorkout([...workout, { name, sets: [{ reps: 0, weight: 0 }], isCollapsed: false }]);
                        }}
                        className="w-full p-3 border border-dashed border-border rounded-xl text-muted-foreground hover:bg-secondary/50 transition-colors"
                    >
                        + Add Exercise
                    </button>
                </div>
            )}

            {/* Notes Input */}
            <div className="space-y-2">
                <CollapsibleNote
                    value={notes}
                    onChange={setNotes}
                    placeholder="How did it go?"
                />
            </div>

            <div className="mt-8">
                <SaveButton
                    onClick={handleSave}
                    isSaving={isSaving}
                    label="Save Activity"
                />
            </div>
        </TrackerLayout>
    );
}
