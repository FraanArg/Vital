import { LucideIcon, Briefcase, Moon, Droplets, Utensils, Book, Plus } from "lucide-react";
import WorkTracker from "../features/work/WorkTracker";
import SleepTracker from "../features/sleep/SleepTracker";
import WaterTracker from "../features/water/WaterTracker";
import FoodTracker from "../features/food/FoodTracker";
import JournalTracker from "../features/journal/JournalTracker";
import CustomTracker from "../features/custom/CustomTracker";

export interface TrackerConfig {
    id: string;
    label: string;
    icon: LucideIcon;
    color: string; // Tailwind class for text color
    bgColor: string; // Tailwind class for background color
    component: React.ComponentType<{ onClose: () => void; selectedDate: Date }>;
}

export const TRACKERS: TrackerConfig[] = [
    {
        id: "work",
        label: "Work",
        icon: Briefcase,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        component: WorkTracker
    },
    {
        id: "sleep",
        label: "Sleep",
        icon: Moon,
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-100 dark:bg-purple-900/30",
        component: SleepTracker
    },
    {
        id: "water",
        label: "Water",
        icon: Droplets,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        component: WaterTracker
    },
    {
        id: "food",
        label: "Food",
        icon: Utensils,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
        component: FoodTracker
    },
    {
        id: "journal",
        label: "Journal",
        icon: Book,
        color: "text-pink-600 dark:text-pink-400",
        bgColor: "bg-pink-100 dark:bg-pink-900/30",
        component: JournalTracker
    },
    {
        id: "custom",
        label: "Custom",
        icon: Plus,
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-100 dark:bg-gray-800",
        component: CustomTracker
    }
];
