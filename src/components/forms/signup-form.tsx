"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { signup } from "@/lib/actions/auth";
import type { SignupFormData } from "@/lib/validations";
import { signupSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export function SignupForm() {
	const { toast } = useToast();

	const form = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			username: "",
			email: "",
			password: "",
		},
	});

	const handleSubmit = async (data: SignupFormData) => {
		try {
			const result = await signup(data);
			if (result.success) {
				form.reset();
				toast.success(
					"Account created successfully!",
					"Please check your email to verify your account.",
				);
			} else {
				throw new Error(result.error);
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An error occurred";

			toast.error("Signup failed", errorMessage);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
			<div className="space-y-2">
				<label htmlFor="signup-username" className="text-sm font-medium">
					Username
				</label>
				<Input
					id="signup-username"
					type="text"
					placeholder="Choose a username"
					{...form.register("username")}
					disabled={form.formState.isSubmitting}
				/>
				{form.formState.errors.username && (
					<p className="text-sm text-red-500">
						{form.formState.errors.username.message}
					</p>
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
				<label htmlFor="signup-password" className="text-sm font-medium">
					Password
				</label>
				<Input
					id="signup-password"
					type="password"
					placeholder="Choose a password"
					{...form.register("password")}
					disabled={form.formState.isSubmitting}
				/>
				{form.formState.errors.password && (
					<p className="text-sm text-red-500">
						{form.formState.errors.password.message}
					</p>
				)}
			</div>

			{form.formState.errors.root && (
				<p className="text-sm text-red-500">
					{form.formState.errors.root.message}
				</p>
			)}

			<Button
				type="submit"
				className="w-full"
				disabled={form.formState.isSubmitting}
			>
				{form.formState.isSubmitting ? "Creating account..." : "Sign Up"}
			</Button>
		</form>
	);
}
