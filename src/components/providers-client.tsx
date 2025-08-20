"use client";

import { AuthProvider } from "@/contexts/auth-context";
import type { AuthUser } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

interface ProvidersClientProps {
	children: ReactNode;
	initialUser: AuthUser | null;
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			refetchOnWindowFocus: false,
		},
	},
});

export function ProvidersClient({
	children,
	initialUser,
}: ProvidersClientProps) {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				<AuthProvider value={{ user: initialUser }}>{children}</AuthProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
