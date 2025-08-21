import { getCurrentUser } from "@/lib/actions/auth";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { ProvidersClient } from "./providers-client";

interface ProvidersProps {
	children: ReactNode;
}

export async function Providers({ children }: ProvidersProps) {
	const initialUser = await getCurrentUser();
	console.log("initialUser", initialUser);
	return (
		<NuqsAdapter>
			<ProvidersClient initialUser={initialUser}>{children}</ProvidersClient>
		</NuqsAdapter>
	);
}
