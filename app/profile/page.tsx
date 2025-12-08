"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import SyncData from "../../components/SyncData";
import { Settings, Shield, Mail, Loader2, Trash2, FileText, Heart, Check, Scale, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "../../components/ThemeToggle";
import DataExport from "../../components/DataExport";
import ExportDialog from "../../components/reports/ExportDialog";
import { db } from "../../lib/db";

export default function ProfilePage() {
    const { user, isLoaded } = useUser();
    const { openUserProfile, openSignIn } = useClerk();
    const [isLoading, setIsLoading] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);

    // Biometrics state
    const [age, setAge] = useState<number | "">("");
    const [weight, setWeight] = useState<number | "">("");
    const [height, setHeight] = useState<number | "">("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);

    const profile = useQuery(api.userProfile.get);
    const upsertProfile = useMutation(api.userProfile.upsert);

    // Load existing profile
    useEffect(() => {
        if (profile) {
            if (profile.age) setAge(profile.age);
            if (profile.weight) setWeight(profile.weight);
            if (profile.height) setHeight(profile.height);
        }
    }, [profile]);

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        try {
            await upsertProfile({
                age: age === "" ? undefined : age,
                weight: weight === "" ? undefined : weight,
                height: height === "" ? undefined : height,
            });
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 2000);
        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleSignIn = () => {
        setIsLoading(true);
        openSignIn();
        setTimeout(() => setIsLoading(false), 2000);
    };

    const clearData = async () => {
        if (confirm("Are you sure you want to delete ALL data? This cannot be undone.")) {
            await db.logs.clear();
            alert("All data cleared.");
            window.location.reload();
        }
    };

    if (!isLoaded) {
        return (
            <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-8 pb-24 sm:pb-8 animate-pulse">
                <div className="space-y-2">
                    <div className="h-8 w-32 bg-muted rounded-lg" />
                    <div className="h-4 w-48 bg-muted rounded-lg" />
                </div>
                <div className="bg-card border border-border/50 rounded-2xl p-6 h-40" />
                <div className="h-20 bg-card border border-border/50 rounded-2xl" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-6">
                <div className="p-4 bg-primary/10 rounded-full">
                    <Shield className="w-12 h-12 text-primary" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Sign In Required</h1>
                    <p className="text-muted-foreground">Please sign in to view your profile and manage your data.</p>
                </div>
                <button
                    onClick={handleSignIn}
                    disabled={isLoading}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {isLoading ? "Signing in..." : "Sign In"}
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-8 pb-24 sm:pb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Profile</h1>
                <p className="text-muted-foreground">Manage your account and preferences.</p>
            </div>

            {/* Custom Profile Card */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="relative">
                    <Image
                        src={user.imageUrl}
                        alt={user.fullName || "User"}
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full border-4 border-background shadow-lg"
                    />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-background rounded-full"></div>
                </div>

                <div className="flex-1 space-y-2">
                    <h2 className="text-2xl font-bold">{user.fullName}</h2>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{user.primaryEmailAddress?.emailAddress}</span>
                    </div>
                </div>

                <button
                    onClick={() => openUserProfile()}
                    className="px-6 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                    <Settings className="w-4 h-4" />
                    Manage Account
                </button>
            </div>

            <div className="grid gap-6">
                {/* Health Profile */}
                <section className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        Health Profile
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Add your details for personalized AI insights on nutrition and recovery.
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Age</label>
                            <input
                                type="number"
                                inputMode="numeric"
                                value={age}
                                onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : "")}
                                placeholder="25"
                                className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary text-center"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Weight (kg)</label>
                            <input
                                type="number"
                                inputMode="decimal"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : "")}
                                placeholder="70"
                                className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary text-center"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Height (cm)</label>
                            <input
                                type="number"
                                inputMode="numeric"
                                value={height}
                                onChange={(e) => setHeight(e.target.value ? parseInt(e.target.value) : "")}
                                placeholder="175"
                                className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary text-center"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="w-full p-3 bg-primary text-primary-foreground rounded-xl font-medium transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSavingProfile ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : profileSaved ? (
                            <>
                                <Check className="w-4 h-4" />
                                Saved!
                            </>
                        ) : (
                            "Save Profile"
                        )}
                    </button>

                    <Link
                        href="/body"
                        className="w-full p-4 mt-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3 hover:from-blue-500/20 hover:to-purple-500/20 transition-all"
                    >
                        <div className="p-2 rounded-xl bg-blue-500/20">
                            <Scale className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium">Body Composition</h3>
                            <p className="text-xs text-muted-foreground">Track weight, measurements, BMI & TDEE</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </Link>
                </section>

                {/* Appearance */}
                <section className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Preferences
                    </h2>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Theme</span>
                        <ThemeToggle />
                    </div>
                </section>

                {/* Data Management */}
                <section className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Data Management
                    </h2>

                    <div className="space-y-6">
                        <SyncData />

                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <div>
                                <p className="font-medium">Nutritionist Report</p>
                                <p className="text-sm text-muted-foreground">Generate a printable summary</p>
                            </div>
                            <button
                                onClick={() => setShowExportDialog(true)}
                                className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                Generate
                            </button>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <div>
                                <p className="font-medium">Export / Import</p>
                                <p className="text-sm text-muted-foreground">Backup your data to JSON</p>
                            </div>
                            <DataExport />
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <div>
                                <p className="font-medium text-destructive">Danger Zone</p>
                                <p className="text-sm text-muted-foreground">Delete all your logs permanently</p>
                            </div>
                            <button
                                onClick={clearData}
                                className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            <ExportDialog isOpen={showExportDialog} onClose={() => setShowExportDialog(false)} />
        </div>
    );
}

