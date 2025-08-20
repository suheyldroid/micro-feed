import { z } from "zod";

const envSchema = z.object({
	NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
	NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
});

export const env = envSchema.parse({
	NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
	NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
