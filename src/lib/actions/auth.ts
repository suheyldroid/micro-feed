"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { LoginFormData, SignupFormData } from "@/lib/validations";
import type { Profile } from "@/types";

import { revalidatePath } from "next/cache";

interface ActionResult {
	success: boolean;
	error?: string;
}

export async function signup(data: SignupFormData): Promise<ActionResult> {
	try {
		const supabase = await createServerSupabaseClient();

		const usernameAvailable = await isUsernameAvailable(data.username);

		if (!usernameAvailable) {
			return {
				success: false,
				error: "Username already exists",
			};
		}

		// Create user with Supabase Auth (client-side signup)
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email: data.email,
			password: data.password,
			options: { data: { username: data.username } },
		});

		if (authError) {
			return {
				success: false,
				error: authError.message,
			};
		}

		if (!authData.user) {
			return {
				success: false,
				error: "Failed to create user",
			};
		}

		const { error: profileError } = await supabase.from("profiles").insert({
			id: authData.user.id,
			username: data.username,
		});

		if (profileError) {
			console.error("Profile creation error:", profileError.message);
		}

		revalidatePath("/", "layout");

		return {
			success: true,
		};
	} catch (error) {
		console.error("Signup error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Signup failed",
		};
	}
}

export async function login({
	email,
	password,
}: LoginFormData): Promise<ActionResult> {
	try {
		const supabase = await createServerSupabaseClient();

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			return {
				success: false,
				error: error.message,
			};
		}

		// Revalidate auth-dependent pages
		revalidatePath("/", "layout");

		return {
			success: true,
		};
	} catch (error) {
		console.error("Login error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Login failed",
		};
	}
}

export async function logout(): Promise<ActionResult> {
	try {
		const supabase = await createServerSupabaseClient();
		const { error } = await supabase.auth.signOut();

		if (error) {
			return {
				success: false,
				error: error.message,
			};
		}

		// Revalidate auth-dependent pages
		revalidatePath("/", "layout");

		return {
			success: true,
		};
	} catch (error) {
		console.error("Logout error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Logout failed",
		};
	}
}

async function isUsernameAvailable(username: string) {
	const supabase = await createServerSupabaseClient();
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("username", username)
		.single();

	return !data && !error;
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
	const supabase = await createServerSupabaseClient();

	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", userId)
		.single();

	if (error) {
		console.error("Error fetching user profile:", error);
	}

	return data;
}

export async function getCurrentUser() {
	try {
		const supabase = await createServerSupabaseClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (user) {
			const { data: profile } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", user.id)
				.single();

			if (profile) {
				return {
					id: profile.id,
					username: profile.username,
					email: user.email,
				};
			}
		}
	} catch (error) {
		console.error("Error fetching initial user:", error);
	}

	return null;
}
