"use client";

import { useState, useEffect } from "react";
import { Lightbulb, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTIONS = [
    { time: "morning", text: "Start your day with a glass of water to hydrate!" },
    { time: "morning", text: "Take 5 minutes to plan your top 3 tasks for today." },
    { time: "afternoon", text: "Feeling a slump? A short walk can boost your energy." },
    { time: "afternoon", text: "Have you stretched your legs recently?" },
    { time: "evening", text: "Avoid screens 1 hour before bed for better sleep." },
    { time: "evening", text: "Reflect on one good thing that happened today." },
    { time: "any", text: "Consistency is key. Even a small log counts!" },
];

export default function SmartSuggestions() {
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const hour = new Date().getHours();
        let timeOfDay = "any";
        if (hour < 12) timeOfDay = "morning";
        else if (hour < 18) timeOfDay = "afternoon";
        else timeOfDay = "evening";

        const relevantSuggestions = SUGGESTIONS.filter(
            (s) => s.time === timeOfDay || s.time === "any"
        );
        const randomSuggestion =
            relevantSuggestions[Math.floor(Math.random() * relevantSuggestions.length)];

        setTimeout(() => setSuggestion(randomSuggestion.text), 0);
    }, []);

    if (!isVisible || !suggestion) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-primary/10 border border-primary/20 p-4 rounded-2xl mb-6 flex items-start gap-3 relative"
            >
                <div className="p-2 bg-primary/20 rounded-full shrink-0">
                    <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-sm text-primary mb-1">Daily Tip</h4>
                    <p className="text-sm text-foreground/80">{suggestion}</p>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-primary/10 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                    <X className="w-4 h-4" />
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
