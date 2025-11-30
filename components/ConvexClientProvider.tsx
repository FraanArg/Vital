"use client";

import { ReactNode } from "react";
import { ConvexReactClient, useConvexAuth } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth, useUser } from "@clerk/nextjs";
import { ClerkProvider, useAuth, useUser } from "@clerk/nextjs";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

function AuthDebug() {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const { user, isLoaded } = useUser();
    if (process.env.NODE_ENV === "production") return null;
    return (
        <div className="fixed bottom-0 right-0 bg-black/80 text-white p-2 text-xs z-50 pointer-events-none">
            Convex: {isLoading ? "Loading..." : isAuthenticated ? "Authenticated" : "Unauthenticated"} <br />
            Clerk: {!isLoaded ? "Loading..." : user ? `Signed In (${user.primaryEmailAddress?.emailAddress})` : "Signed Out"}
        </div>
    );
}

export default function ConvexClientProvider({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <ClerkProvider>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
                <AuthDebug />
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
