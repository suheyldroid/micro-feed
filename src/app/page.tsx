"use client";

import { AuthForm } from "@/components/auth-form";
import { Feed } from "@/components/feed";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
	const { user } = useAuth();

	return user ? <Feed /> : <AuthForm />;
}
