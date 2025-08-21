"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/lib/actions/auth";
import type { LoginFormData } from "@/lib/validations";
import { loginSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export function LoginForm() {
	const { toast } = useToast();

	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleSubmit = async (data: LoginFormData) => {
		try {
			const result = await login(data);
			if (result.success) {
				toast.success("Login successful!", "Redirecting to your feed...");
			} else {
				throw new Error(result.error);
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An error occurred";

			toast.error("Login failed", errorMessage);
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
					disabled={form.formState.isSubmitting}
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
					disabled={form.formState.isSubmitting}
				/>
				{form.formState.errors.password && (
					<p className="text-sm text-red-500">
						{form.formState.errors.password.message}
					</p>
				)}
			</div>

			<Button
				type="submit"
				className="w-full"
				disabled={form.formState.isSubmitting}
			>
				{form.formState.isSubmitting ? "Logging in..." : "Login"}
			</Button>
		</form>
	);
}
