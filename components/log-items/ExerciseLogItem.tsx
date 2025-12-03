import { Dumbbell, Timer, Footprints, Trophy } from "lucide-react";
import { Doc } from "../../convex/_generated/dataModel";
import { ICON_LIBRARY } from "../../lib/icon-library";
import { DEFAULT_SPORTS } from "../../lib/constants";

// ...

export function getExerciseIcon(log: Doc<"logs">, iconMappings?: Doc<"icon_mappings">[]) {
    if (!log.exercise) return Dumbbell;

    const defaultIcons: Record<string, React.ElementType> = {
        gym: Dumbbell,
        run: Timer,
        walk: Footprints,
    };

    DEFAULT_SPORTS.forEach(sport => {
        defaultIcons[sport.id] = sport.icon;
    });

    const customMapping = iconMappings?.find(m => m.type === "sport" && m.key === log.exercise!.type);
    let Icon = defaultIcons[log.exercise.type] || Trophy;

    if (customMapping && ICON_LIBRARY[customMapping.icon]) {
        Icon = ICON_LIBRARY[customMapping.icon];
    }
    return Icon;
}
