// hooks/useAuthGuard.ts
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useAuthGuard({
    requireLogin = false,
    redirectTo = "/home",
}: {
    requireLogin?: boolean;
    redirectTo?: string;
}) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (requireLogin && !u) {
                router.push("/login");
            } else if (!requireLogin && u) {
                router.push(redirectTo);
            }
            setUser(u);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router, requireLogin, redirectTo]);

    return { user, loading };
}
