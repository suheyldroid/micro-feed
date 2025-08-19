"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import type { LoginFormData, SignupFormData } from "@/types";
import { useState } from "react";

export function AuthForm() {
	const { login, signup, isLoading } = useAuth();
	const [loginForm, setLoginForm] = useState<LoginFormData>({ username: "" });
	const [signupForm, setSignupForm] = useState<SignupFormData>({
		name: "",
		username: "",
		email: "",
		password: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		if (!loginForm.username.trim()) {
			setErrors({ username: "Username is required" });
			return;
		}

		try {
			await login(loginForm);
		} catch (error) {
			setErrors({ general: error instanceof Error ? error.message : "Login failed" });
		}
	};

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Basic validation
		const newErrors: Record<string, string> = {};
		if (!signupForm.name.trim()) newErrors.name = "Name is required";
		if (!signupForm.username.trim()) newErrors.username = "Username is required";
		if (!signupForm.email.trim()) newErrors.email = "Email is required";
		if (!signupForm.password.trim()) newErrors.password = "Password is required";

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			await signup(signupForm);
		} catch (error) {
			setErrors({ general: error instanceof Error ? error.message : "Signup failed" });
		}
	};

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
							<form onSubmit={handleLogin} className="space-y-4">
								<div className="space-y-2">
									<label htmlFor="login-username" className="text-sm font-medium">
										Username
									</label>
									<Input
										id="login-username"
										type="text"
										placeholder="Enter your username"
										value={loginForm.username}
										onChange={(e) =>
											setLoginForm({ ...loginForm, username: e.target.value })
										}
										disabled={isLoading}
									/>
									{errors.username && (
										<p className="text-sm text-red-500">{errors.username}</p>
									)}
								</div>

								{errors.general && (
									<p className="text-sm text-red-500">{errors.general}</p>
								)}

								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? "Logging in..." : "Login"}
								</Button>
							</form>

							<div className="text-sm text-muted-foreground">
								<p className="font-medium mb-2">Available users to test with:</p>
								<ul className="space-y-1">
									<li>• johndoe</li>
									<li>• janesmith</li>
									<li>• mikejohnson</li>
									<li>• sarahwilson</li>
								</ul>
							</div>
						</TabsContent>

						<TabsContent value="signup" className="space-y-4">
							<form onSubmit={handleSignup} className="space-y-4">
								<div className="space-y-2">
									<label htmlFor="signup-name" className="text-sm font-medium">
										Full Name
									</label>
									<Input
										id="signup-name"
										type="text"
										placeholder="Enter your full name"
										value={signupForm.name}
										onChange={(e) =>
											setSignupForm({ ...signupForm, name: e.target.value })
										}
										disabled={isLoading}
									/>
									{errors.name && (
										<p className="text-sm text-red-500">{errors.name}</p>
									)}
								</div>

								<div className="space-y-2">
									<label htmlFor="signup-username" className="text-sm font-medium">
										Username
									</label>
									<Input
										id="signup-username"
										type="text"
										placeholder="Choose a username"
										value={signupForm.username}
										onChange={(e) =>
											setSignupForm({ ...signupForm, username: e.target.value })
										}
										disabled={isLoading}
									/>
									{errors.username && (
										<p className="text-sm text-red-500">{errors.username}</p>
									)}
								</div>

								<div className="space-y-2">
									<label htmlFor="signup-email" className="text-sm font-medium">
										Email
									</label>
									<Input
										id="signup-email"
										type="email"
										placeholder="Enter your email"
										value={signupForm.email}
										onChange={(e) =>
											setSignupForm({ ...signupForm, email: e.target.value })
										}
										disabled={isLoading}
									/>
									{errors.email && (
										<p className="text-sm text-red-500">{errors.email}</p>
									)}
								</div>

								<div className="space-y-2">
									<label htmlFor="signup-password" className="text-sm font-medium">
										Password
									</label>
									<Input
										id="signup-password"
										type="password"
										placeholder="Choose a password"
										value={signupForm.password}
										onChange={(e) =>
											setSignupForm({ ...signupForm, password: e.target.value })
										}
										disabled={isLoading}
									/>
									{errors.password && (
										<p className="text-sm text-red-500">{errors.password}</p>
									)}
								</div>

								{errors.general && (
									<p className="text-sm text-red-500">{errors.general}</p>
								)}

								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? "Creating account..." : "Sign Up"}
								</Button>
							</form>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
