import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        },
    );

    const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

    if (isAdminPath) {
        // Important: call getUser to refresh session if needed
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(new URL("/signin", request.url));
        }

        const { data: profile, error } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (error || profile?.role !== "admin") {
            console.error("Middleware admin check failed:", error || "Not an admin");
            return NextResponse.redirect(new URL("/", request.url));
        }
    } else {
        // For non-admin paths, we still might want to refresh the session
        // but it's less critical to await getUser() if performance is an issue.
        // However, standard Supabase Next.js middleware strategy usually awaits it.
        // We'll keep it for security but ensure it's outside the role query.
        await supabase.auth.getUser();
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
