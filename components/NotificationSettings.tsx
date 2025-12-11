"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Bell, Utensils, Droplets, Dumbbell, Flame, Sparkles, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
}

function Toggle({ enabled, onChange, disabled }: ToggleProps) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            disabled={disabled}
            className={`relative w-12 h-7 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
            <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${enabled ? "translate-x-6" : "translate-x-1"
                    }`}
            />
        </button>
    );
}

interface SettingRowProps {
    icon: React.ReactNode;
    label: string;
    description: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
}

function SettingRow({ icon, label, description, enabled, onChange, disabled }: SettingRowProps) {
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-muted">
                    {icon}
                </div>
                <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </div>
            <Toggle enabled={enabled} onChange={onChange} disabled={disabled} />
        </div>
    );
}

export default function NotificationSettings() {
    const preferences = useQuery(api.notifications.getNotificationPreferences);
    const updatePreferences = useMutation(api.notifications.updateNotificationPreferences);
    const [isSaving, setIsSaving] = useState(false);

    // Local state
    const [settings, setSettings] = useState({
        enabled: true,
        mealReminders: true,
        waterReminders: true,
        exerciseReminders: true,
        streakAlerts: true,
        smartNudges: true,
        quietHoursStart: "",
        quietHoursEnd: "",
    });

    // Load preferences
    useEffect(() => {
        if (preferences) {
            setSettings({
                enabled: preferences.enabled ?? true,
                mealReminders: preferences.mealReminders ?? true,
                waterReminders: preferences.waterReminders ?? true,
                exerciseReminders: preferences.exerciseReminders ?? true,
                streakAlerts: preferences.streakAlerts ?? true,
                smartNudges: preferences.smartNudges ?? true,
                quietHoursStart: preferences.quietHoursStart ?? "",
                quietHoursEnd: preferences.quietHoursEnd ?? "",
            });
        }
    }, [preferences]);

    const handleChange = async (key: keyof typeof settings, value: boolean | string) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        // Auto-save
        setIsSaving(true);
        try {
            await updatePreferences({
                enabled: newSettings.enabled,
                mealReminders: newSettings.mealReminders,
                waterReminders: newSettings.waterReminders,
                exerciseReminders: newSettings.exerciseReminders,
                streakAlerts: newSettings.streakAlerts,
                smartNudges: newSettings.smartNudges,
                quietHoursStart: newSettings.quietHoursStart || undefined,
                quietHoursEnd: newSettings.quietHoursEnd || undefined,
            });
        } catch (error) {
            console.error("Failed to save preferences:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (preferences === undefined) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold">Notificaciones</p>
                        <p className="text-xs text-muted-foreground">
                            {settings.enabled ? "Activas" : "Desactivadas"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                    <Toggle
                        enabled={settings.enabled}
                        onChange={(v) => handleChange("enabled", v)}
                    />
                </div>
            </div>

            {/* Individual Settings */}
            <div className={`space-y-1 divide-y divide-border/50 ${!settings.enabled ? "opacity-50 pointer-events-none" : ""}`}>
                <SettingRow
                    icon={<Utensils className="w-4 h-4 text-orange-500" />}
                    label="Recordatorios de comidas"
                    description="Avisos a tu hora habitual de cada comida"
                    enabled={settings.mealReminders}
                    onChange={(v) => handleChange("mealReminders", v)}
                    disabled={!settings.enabled}
                />

                <SettingRow
                    icon={<Droplets className="w-4 h-4 text-blue-500" />}
                    label="Recordatorios de agua"
                    description="Alertas para mantenerte hidratado"
                    enabled={settings.waterReminders}
                    onChange={(v) => handleChange("waterReminders", v)}
                    disabled={!settings.enabled}
                />

                <SettingRow
                    icon={<Dumbbell className="w-4 h-4 text-green-500" />}
                    label="Recordatorios de ejercicio"
                    description="Avisos si no has entrenado en días"
                    enabled={settings.exerciseReminders}
                    onChange={(v) => handleChange("exerciseReminders", v)}
                    disabled={!settings.enabled}
                />

                <SettingRow
                    icon={<Flame className="w-4 h-4 text-amber-500" />}
                    label="Alertas de racha"
                    description="No pierdas tu racha de registros"
                    enabled={settings.streakAlerts}
                    onChange={(v) => handleChange("streakAlerts", v)}
                    disabled={!settings.enabled}
                />

                <SettingRow
                    icon={<Sparkles className="w-4 h-4 text-purple-500" />}
                    label="Insights inteligentes"
                    description="Análisis semanales de tu progreso"
                    enabled={settings.smartNudges}
                    onChange={(v) => handleChange("smartNudges", v)}
                    disabled={!settings.enabled}
                />
            </div>

            {/* Quiet Hours */}
            <div className={`p-4 bg-muted/30 rounded-xl space-y-3 ${!settings.enabled ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Horas de silencio</span>
                </div>
                <p className="text-xs text-muted-foreground">
                    No recibirás notificaciones durante este horario
                </p>
                <div className="flex items-center gap-3">
                    <input
                        type="time"
                        value={settings.quietHoursStart}
                        onChange={(e) => handleChange("quietHoursStart", e.target.value)}
                        className="flex-1 p-2 rounded-lg bg-background border border-border text-sm"
                        placeholder="22:00"
                    />
                    <span className="text-muted-foreground">a</span>
                    <input
                        type="time"
                        value={settings.quietHoursEnd}
                        onChange={(e) => handleChange("quietHoursEnd", e.target.value)}
                        className="flex-1 p-2 rounded-lg bg-background border border-border text-sm"
                        placeholder="08:00"
                    />
                </div>
            </div>
        </div>
    );
}
