"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signup } from "@/lib/actions/auth";
import type { SignupFormData } from "@/lib/validations";
import { signupSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface SignupFormProps {
	onSuccess?: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
	const [loading, setLoading] = useState(false);
	const [signupSuccess, setSignupSuccess] = useState(false);

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
				onSuccess?.();
			} else {
				throw new Error(result.error);
			}
		} catch (error) {
			setSignupSuccess(false);
			const errorMessage = error instanceof Error ? error.message : "Signup failed";

			// Show user-friendly error messages
			let friendlyMessage = errorMessage;
			if (errorMessage.includes("User already registered")) {
				friendlyMessage = "An account with this email already exists. Try logging in instead.";
			} else if (errorMessage.includes("Username already exists")) {
				friendlyMessage = "This username is already taken. Please choose a different one.";
			} else if (errorMessage.includes("Password should be at least")) {
				friendlyMessage = "Password must be at least 6 characters long.";
			} else if (errorMessage.includes("Invalid email")) {
				friendlyMessage = "Please enter a valid email address.";
			}

			form.setError("root", {
				message: friendlyMessage,
			});
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
						Please check your email to confirm your account, then you can log in.
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
