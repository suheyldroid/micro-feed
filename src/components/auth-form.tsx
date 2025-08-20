"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "./forms/login-form";
import { SignupForm } from "./forms/signup-form";

export function AuthForm() {

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold">Micro Feed</CardTitle>
					<CardDescription>
						Join the conversation or continue where you left off
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="login" className="space-y-4">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="login">Login</TabsTrigger>
							<TabsTrigger value="signup">Sign Up</TabsTrigger>
						</TabsList>

						<TabsContent value="login" className="space-y-4">
							<LoginForm />
						</TabsContent>

						<TabsContent value="signup" className="space-y-4">
							<SignupForm />
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
