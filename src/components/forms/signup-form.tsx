"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { signup } from "@/lib/actions/auth";
import type { SignupFormData } from "@/lib/validations";
import { signupSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function SignupForm() {
	const [loading, setLoading] = useState(false);
	const [signupSuccess, setSignupSuccess] = useState(false);
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
		setLoading(true);
		form.clearErrors("root");

		try {
			const result = await signup(data);
			if (result.success) {
				setSignupSuccess(true);
				form.reset();
				toast.success(
					"Account created successfully!",
					"Please check your email to verify your account.",
				);
			} else {
				throw new Error(result.error);
			}
		} catch (error) {
			setSignupSuccess(false);
			const errorMessage =
				error instanceof Error ? error.message : "An error occurred";

			toast.error("Signup failed", errorMessage);
		} finally {
			setLoading(false);
		}
	};

	if (signupSuccess) {
		return (
			<div className="text-center space-y-4">
				<div className="p-4 bg-green-50 border border-green-200 rounded-md">
					<p className="text-sm text-green-800">
						✅ Account created successfully!
					</p>
					<p className="text-sm text-green-700 mt-2">
						Please check your email to confirm your account, then you can log
						in.
					</p>
				</div>
				<Button
					onClick={() => setSignupSuccess(false)}
					variant="outline"
					className="w-full"
				>
					Back to Sign Up
				</Button>
			</div>
		);
	}

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
					disabled={loading}
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
					disabled={loading}
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
					disabled={loading}
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

			<Button type="submit" className="w-full" disabled={loading}>
				{loading ? "Creating account..." : "Sign Up"}
			</Button>
		</form>
	);
}
