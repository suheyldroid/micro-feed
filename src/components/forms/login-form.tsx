"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/actions/auth";
import type { LoginFormData } from "@/lib/validations";
import { loginSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface LoginFormProps {
	onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
	const [loading, setLoading] = useState(false);

	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleSubmit = async (data: LoginFormData) => {
		setLoading(true);
		form.clearErrors("root");

		try {
			const result = await login(data);
			if (result.success) {
				// Show success message briefly before redirect
				form.setError("root", {
					message: "✅ Login successful! Redirecting...",
				});
				onSuccess?.();
			} else {
				throw new Error(result.error);
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Login failed";

			// Show user-friendly error messages
			let friendlyMessage = errorMessage;
			if (errorMessage.includes("Invalid login credentials")) {
				friendlyMessage = "Invalid email or password. Please check your credentials.";
			} else if (errorMessage.includes("Email not confirmed")) {
				friendlyMessage = "Please confirm your email address before signing in.";
			} else if (errorMessage.includes("Too many requests")) {
				friendlyMessage = "Too many login attempts. Please try again later.";
			}

			form.setError("root", {
				message: friendlyMessage,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
			<div className="space-y-2">
				<label htmlFor="login-email" className="text-sm font-medium">
					Email
				</label>
				<Input
					id="login-email"
					type="email"
					placeholder="Enter your email"
					{...form.register("email")}
					disabled={loading}
				/>
				{form.formState.errors.email && (
					<p className="text-sm text-red-500">
						{form.formState.errors.email.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<label htmlFor="login-password" className="text-sm font-medium">
					Password
				</label>
				<Input
					id="login-password"
					type="password"
					placeholder="Enter your password"
					{...form.register("password")}
					disabled={loading}
				/>
				{form.formState.errors.password && (
					<p className="text-sm text-red-500">
						{form.formState.errors.password.message}
					</p>
				)}
			</div>

			{form.formState.errors.root && (
				<p
					className={`text-sm ${
						form.formState.errors.root.message?.includes("✅")
							? "text-green-600"
							: "text-red-500"
					}`}
				>
					{form.formState.errors.root.message}
				</p>
			)}

			<Button type="submit" className="w-full" disabled={loading}>
				{loading ? "Logging in..." : "Login"}
			</Button>
		</form>
	);
}
