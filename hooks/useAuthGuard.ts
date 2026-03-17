import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

export function useAuthGuard() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsAuthenticated(!!session);
        });
    }, []);

    const requireAuth = useCallback(
        (action: () => void) => {
            if (isAuthenticated) {
                action();
            } else {
                toast("Please sign in to continue", {
                    icon: "🔒",
                    style: {
                        borderRadius: "8px",
                        background: "#141718",
                        color: "#fff",
                    },
                });
                router.push("/signin");
            }
        },
        [isAuthenticated, router],
    );

    return { isAuthenticated, requireAuth };
}
