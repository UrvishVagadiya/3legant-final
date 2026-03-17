import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/utils/supabase/middleware";

const ADMIN_EMAIL = "admin1234@yopmail.com";

export async function middleware(request: NextRequest) {
    const response = await createClient(request);

    if (request.nextUrl.pathname.startsWith("/admin")) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll() { },
                },
            },
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
