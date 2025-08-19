"use client";

import { AuthForm } from "@/components/auth-form";
import { Feed } from "@/components/feed";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	return user ? <Feed /> : <AuthForm />;
}
