import { z } from "zod";

// Auth validation schemas
export const loginSchema = z.object({
	email: z.string().min(1, "Email is required").email("Invalid email address"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
	username: z
		.string()
		.min(1, "Username is required")
		.min(3, "Username must be at least 3 characters")
		.max(20, "Username must not exceed 20 characters")
		.regex(
			/^[a-zA-Z0-9_]+$/,
			"Username can only contain letters, numbers and underscores",
		),
	email: z.string().min(1, "Email is required").email("Invalid email address"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(6, "Password must be at least 6 characters")
		.max(50, "Password must not exceed 50 characters"),
});

// Post validation schemas
export const postSchema = z.object({
	content: z
		.string()
		.min(1, "Post content is required")
		.max(280, "Post must not exceed 280 characters"),
});

// Type inference from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type PostFormData = z.infer<typeof postSchema>;
