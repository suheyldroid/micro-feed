import { env } from "@/config/env";
import type { Database } from "@/types/database.types";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Note: We don't use admin client - we respect RLS policies instead

// Server-side client that respects user auth context (for regular operations)
// This maintains user permissions and RLS
export async function createServerSupabaseClient() {
	const cookieStore = await cookies();

	return createServerClient<Database>(
		env.NEXT_PUBLIC_SUPABASE_URL,
		env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) => {
							cookieStore.set(name, value, options);
						});
					} catch (error) {
						// Handle cookie setting errors in middleware/server components
						console.warn("Failed to set cookies:", error);
					}
				},
			},
		},
	);
}

// For use in server actions where we need the user context
export async function createAuthenticatedSupabaseClient() {
	const supabase = await createServerSupabaseClient();

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		throw new Error("Unauthorized");
	}

	return { supabase, user };
}
