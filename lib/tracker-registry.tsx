import { Briefcase, Moon, Droplets, Utensils, Book, Plus, Dumbbell, Timer, Footprints, Swords, Circle, Target, Waves, Trophy } from "lucide-react";
import WorkTracker from "../features/work/WorkTracker";
import SleepTracker from "../features/sleep/SleepTracker";
import WaterTracker from "../features/water/WaterTracker";
import FoodTracker from "../features/food/FoodTracker";
import ExerciseTracker from "../features/exercise/ExerciseTracker";
import JournalTracker from "../features/journal/JournalTracker";
import CustomTracker from "../features/custom/CustomTracker";
import { Doc } from "../convex/_generated/dataModel";
import React from "react";
import { ICON_LIBRARY } from "./icon-library";

export interface TrackerConfig {
    id: string;
    label: string;
    icon: React.ElementType;
    color: string; // Tailwind class for text color
    bgColor: string; // Tailwind class for background color
    component: React.ComponentType<{ onClose: () => void; selectedDate: Date; initialData?: Doc<"logs"> | null }>;
    matcher: (log: Doc<"logs">) => boolean;
    renderContent: (log: Doc<"logs">) => React.ReactNode;
    getIcon?: (log: Doc<"logs">, iconMappings?: Doc<"icon_mappings">[]) => React.ElementType;
}

export const TRACKERS: TrackerConfig[] = [
    {
        id: "work",
        label: "Work",
        icon: Briefcase,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        component: WorkTracker,
        matcher: (log) => log.work !== undefined,
        renderContent: (log) => `Work: ${log.work}h`
    },
    {
        id: "sleep",
        label: "Sleep",
        icon: Moon,
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-100 dark:bg-purple-900/30",
        component: SleepTracker,
        matcher: (log) => log.sleep !== undefined,
        renderContent: (log) => (
            <div className="flex flex-col" >
                <span className="font-semibold text-sm"> Sleep: {log.sleep}h </span>
                {
                    log.sleep_start && log.sleep_end && (
                        <span className="text-xs text-muted-foreground"> {log.sleep_start} - {log.sleep_end} </span>
                    )}
            </div>
        )
    },
    {
        id: "water",
        label: "Water",
        icon: Droplets,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        component: WaterTracker,
        matcher: (log) => log.water !== undefined,
        renderContent: (log) => `Water: ${log.water} L`
    },
    {
        id: "food",
        label: "Food",
        icon: Utensils,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
        component: FoodTracker,
        matcher: (log) => log.meal !== undefined || log.food !== undefined,
        renderContent: (log) => {
            if (log.meal) {
                const typeName = log.meal.type.charAt(0).toUpperCase() + log.meal.type.slice(1).replace('_', ' ');
                return (
                    <div className="flex flex-col" >
                        <span className="font-semibold text-sm flex items-center gap-2" >
                            {typeName} < span className="text-xs text-muted font-normal" > {log.meal.time} </span>
                        </span>
                        < span className="text-xs text-muted-foreground" > {log.meal.items.join(", ")} </span>
                    </div>
                );
            }
            return `Food: ${log.food}`;
        }
    },
    {
        id: "journal",
        label: "Journal",
        icon: Book,
        color: "text-pink-600 dark:text-pink-400",
        bgColor: "bg-pink-100 dark:bg-pink-900/30",
        component: JournalTracker,
        matcher: (log) => log.journal !== undefined,
        renderContent: (log) => `Journal: ${log.journal?.substring(0, 30)}${(log.journal?.length || 0) > 30 ? '...' : ''}`
    },
    {
        id: "exercise",
        label: "Exercise",
        icon: Dumbbell,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        component: ExerciseTracker,
        matcher: (log) => log.exercise !== undefined,
        getIcon: (log, iconMappings) => {
            if (!log.exercise) return Dumbbell;

            const defaultIcons: Record<string, React.ElementType> = {
                padel: ICON_LIBRARY.Swords || Swords, // Using Swords as closest for Padel for now, or maybe TennisBall?
                football: ICON_LIBRARY.Football || Circle,
                tennis: ICON_LIBRARY.TennisBall || Target,
                basketball: ICON_LIBRARY.Basketball || Circle,
                swimming: ICON_LIBRARY.Swimmer || Waves,
                volleyball: ICON_LIBRARY.Volleyball || Circle,
                gym: Dumbbell,
                run: Timer,
                walk: Footprints,
            };

            const customMapping = iconMappings?.find(m => m.type === "sport" && m.key === log.exercise!.type);
            let Icon = defaultIcons[log.exercise.type] || Trophy;

            if (customMapping && ICON_LIBRARY[customMapping.icon]) {
                Icon = ICON_LIBRARY[customMapping.icon];
            }
            return Icon;
        },
        renderContent: (log) => {
            if (!log.exercise) return null;
            const typeName = log.exercise.type.charAt(0).toUpperCase() + log.exercise.type.slice(1);

            if (log.exercise.type === "gym" && log.exercise.workout) {
                const exerciseCount = log.exercise.workout.length;
                const exerciseNames = log.exercise.workout.map(w => w.name).join(", ");
                return (
                    <div className="flex flex-col" >
                        <span className="font-semibold text-sm flex items-center gap-2" >
                            {typeName} < span className="text-xs text-muted font-normal" > {log.exercise.time ? `${log.exercise.time} • ` : ""}{log.exercise.duration}m </span>
                        </span>
                        < span className="text-xs text-muted-foreground" >
                            {exerciseCount} exercises: {exerciseNames.substring(0, 30)} {exerciseNames.length > 30 ? '...' : ''}
                        </span>
                        {
                            log.exercise.notes && (
                                <span className="text-xs text-muted-foreground italic mt-1" >& quot; {log.exercise.notes}& quot; </span>
                            )
                        }
                    </div>
                );
            }
            return (
                <div className="flex flex-col" >
                    <span className="font-semibold text-sm flex items-center gap-2" >
                        {typeName} < span className="text-xs text-muted font-normal" > {log.exercise.time ? `${log.exercise.time} • ` : ""}{log.exercise.duration}m </span>
                    </span>
                    {
                        log.exercise.distance && (
                            <span className="text-xs text-muted-foreground" > {log.exercise.distance} km </span>
                        )
                    }
                    {
                        log.exercise.notes && (
                            <span className="text-xs text-muted-foreground italic mt-1" >& quot; {log.exercise.notes}& quot; </span>
                        )
                    }
                </div>
            );
        }
    },
    {
        id: "custom",
        label: "Custom",
        icon: Plus,
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-100 dark:bg-gray-800",
        component: CustomTracker,
        matcher: (log) => log.custom !== undefined,
        renderContent: (log) => log.custom ? `${log.custom[0].name}: ${log.custom[0].value} ${log.custom[0].unit}` : ""
    }
];
