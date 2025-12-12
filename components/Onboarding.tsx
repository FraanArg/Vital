"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import {
    Sparkles,
    Target,
    Moon,
    Droplets,
    Dumbbell,
    Check,
    ChevronRight,
    Utensils
} from "lucide-react";

interface OnboardingProps {
    onComplete: () => void;
}

const ONBOARDING_KEY = "vital_onboarding_complete";

export function useOnboarding() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { isSignedIn, isLoaded } = useUser();

    useEffect(() => {
        if (!isLoaded) return;

        // Only show onboarding for signed-in users who haven't completed it
        if (isSignedIn) {
            const completed = localStorage.getItem(ONBOARDING_KEY);
            if (!completed) {
                setShowOnboarding(true);
            }
        }
    }, [isSignedIn, isLoaded]);

    const completeOnboarding = () => {
        localStorage.setItem(ONBOARDING_KEY, "true");
        setShowOnboarding(false);
    };

    return { showOnboarding, completeOnboarding };
}

export default function Onboarding({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const updateProfile = useMutation(api.userProfile.upsert);
    const [goals, setGoals] = useState({
        goalSleep: 8,
        goalWater: 2000,
        goalExercise: 30,
        goalMeals: 3,
    });

    const steps = [
        {
            title: "Welcome to Vital! 🎉",
            description: "Your personal health companion for tracking sleep, water, exercise, and more.",
            icon: Sparkles,
            color: "text-primary",
            bgColor: "bg-primary/10",
        },
        {
            title: "Set Your Daily Goals",
            description: "Customize your targets to match your lifestyle. You can always change these later in Settings.",
            icon: Target,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
            hasGoalInputs: true,
        },
        {
            title: "You're All Set!",
            description: "Start logging your activities and watch your progress grow. Let's build healthy habits together!",
            icon: Check,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
    ];

    const handleNext = async () => {
        if (step === steps.length - 1) {
            // Save goals and complete
            try {
                await updateProfile(goals);
            } catch (e) {
                console.error("Failed to save goals:", e);
            }
            onComplete();
        } else {
            setStep(step + 1);
        }
    };

    const currentStep = steps[step];
    const Icon = currentStep.icon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
            <div className="w-full max-w-md p-6">
                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mb-8">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all ${i === step ? "w-6 bg-primary" : i < step ? "bg-primary/50" : "bg-muted"
                                }`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                    >
                        {/* Icon */}
                        <div className={`inline-flex p-6 rounded-3xl ${currentStep.bgColor} mb-6`}>
                            <Icon className={`w-12 h-12 ${currentStep.color}`} />
                        </div>

                        {/* Title & Description */}
                        <h1 className="text-2xl font-bold mb-3">{currentStep.title}</h1>
                        <p className="text-muted-foreground mb-8">{currentStep.description}</p>

                        {/* Goal Inputs (Step 2) */}
                        {currentStep.hasGoalInputs && (
                            <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                                <GoalInput
                                    icon={Moon}
                                    label="Sleep"
                                    value={goals.goalSleep}
                                    unit="hours"
                                    onChange={(v) => setGoals({ ...goals, goalSleep: v })}
                                    min={4}
                                    max={12}
                                    step={0.5}
                                    color="text-indigo-500"
                                />
                                <GoalInput
                                    icon={Droplets}
                                    label="Water"
                                    value={goals.goalWater}
                                    unit="ml"
                                    onChange={(v) => setGoals({ ...goals, goalWater: v })}
                                    min={500}
                                    max={5000}
                                    step={250}
                                    color="text-blue-500"
                                />
                                <GoalInput
                                    icon={Dumbbell}
                                    label="Exercise"
                                    value={goals.goalExercise}
                                    unit="min"
                                    onChange={(v) => setGoals({ ...goals, goalExercise: v })}
                                    min={10}
                                    max={120}
                                    step={5}
                                    color="text-emerald-500"
                                />
                                <GoalInput
                                    icon={Utensils}
                                    label="Meals"
                                    value={goals.goalMeals}
                                    unit="meals"
                                    onChange={(v) => setGoals({ ...goals, goalMeals: v })}
                                    min={1}
                                    max={6}
                                    step={1}
                                    color="text-orange-500"
                                />
                            </div>
                        )}

                        {/* Continue Button */}
                        <button
                            onClick={handleNext}
                            className="w-full py-4 px-6 bg-primary text-primary-foreground rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                        >
                            {step === steps.length - 1 ? "Get Started" : "Continue"}
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Skip Button */}
                        {step < steps.length - 1 && (
                            <button
                                onClick={onComplete}
                                className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Skip for now
                            </button>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

function GoalInput({
    icon: Icon,
    label,
    value,
    unit,
    onChange,
    min,
    max,
    step,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    unit: string;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    color: string;
}) {
    return (
        <div className="bg-card border border-border/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-sm font-medium tabular-nums w-14 text-right">
                    {value} {unit}
                </span>
            </div>
        </div>
    );
}
