"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// VAPID public key - generate your own for production
// You can generate VAPID keys using: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

interface PushNotificationState {
    isSupported: boolean;
    permission: NotificationPermission | 'default';
    isSubscribed: boolean;
    isLoading: boolean;
    error: string | null;
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer as ArrayBuffer;
}

export function usePushNotifications() {
    const [state, setState] = useState<PushNotificationState>({
        isSupported: false,
        permission: 'default',
        isSubscribed: false,
        isLoading: false,
        error: null,
    });

    const updatePreferences = useMutation(api.notifications.updateNotificationPreferences);

    // Check if push notifications are supported
    useEffect(() => {
        const isSupported =
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator &&
            'PushManager' in window &&
            'Notification' in window;

        setState(prev => ({
            ...prev,
            isSupported,
            permission: isSupported ? Notification.permission : 'default',
        }));

        // Register service worker and check subscription
        if (isSupported) {
            registerServiceWorker();
        }
    }, []);

    const registerServiceWorker = async () => {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('[Push] Service worker registered:', registration.scope);

            // Check if already subscribed
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                setState(prev => ({ ...prev, isSubscribed: true }));
            }
        } catch (error) {
            console.error('[Push] Service worker registration failed:', error);
            setState(prev => ({
                ...prev,
                error: 'Error registrando service worker'
            }));
        }
    };

    const requestPermission = useCallback(async () => {
        if (!state.isSupported) {
            setState(prev => ({
                ...prev,
                error: 'Las notificaciones push no están soportadas en este navegador'
            }));
            return false;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const permission = await Notification.requestPermission();
            setState(prev => ({ ...prev, permission }));

            if (permission !== 'granted') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'Permiso de notificaciones denegado'
                }));
                return false;
            }

            return true;
        } catch (error) {
            console.error('[Push] Permission request failed:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Error solicitando permisos'
            }));
            return false;
        }
    }, [state.isSupported]);

    const subscribe = useCallback(async () => {
        if (!state.isSupported) return null;

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Request permission first
            if (Notification.permission !== 'granted') {
                const granted = await requestPermission();
                if (!granted) return null;
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready;

            // Check if VAPID key is configured
            if (!VAPID_PUBLIC_KEY) {
                console.warn('[Push] VAPID public key not configured');
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'Push notifications not configured on server'
                }));
                return null;
            }

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            console.log('[Push] Subscribed:', subscription);

            // Save subscription to database
            // Note: In a real app, you'd send this to your server
            // For now, we store it in the notification preferences
            await updatePreferences({
                enabled: true,
                mealReminders: true,
                waterReminders: true,
                exerciseReminders: true,
                streakAlerts: true,
                smartNudges: true,
            });

            setState(prev => ({
                ...prev,
                isSubscribed: true,
                isLoading: false
            }));

            return subscription;
        } catch (error) {
            console.error('[Push] Subscription failed:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Error suscribiendo a notificaciones'
            }));
            return null;
        }
    }, [state.isSupported, requestPermission, updatePreferences]);

    const unsubscribe = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();
            }

            setState(prev => ({
                ...prev,
                isSubscribed: false,
                isLoading: false
            }));

            return true;
        } catch (error) {
            console.error('[Push] Unsubscribe failed:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Error cancelando suscripción'
            }));
            return false;
        }
    }, []);

    // Send a local test notification
    const sendTestNotification = useCallback(() => {
        if (Notification.permission === 'granted') {
            new Notification('Vital - Test', {
                body: '¡Las notificaciones están funcionando! 🎉',
                icon: '/web-app-manifest-192x192.png',
            });
        }
    }, []);

    return {
        ...state,
        requestPermission,
        subscribe,
        unsubscribe,
        sendTestNotification,
    };
}
