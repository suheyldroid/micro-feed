"use client";

import { mockUsers } from "@/data/mock";
import type {
  AuthContextType,
  AuthUser,
  LoginFormData,
  SignupFormData,
} from "@/types";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Check for existing session on mount
	useEffect(() => {
		const savedUser = localStorage.getItem("micro-feed-user");
		if (savedUser) {
			try {
				setUser(JSON.parse(savedUser));
			} catch (error) {
				console.error("Failed to parse saved user:", error);
				localStorage.removeItem("micro-feed-user");
			}
		}
		setIsLoading(false);
	}, []);

	const login = async (data: LoginFormData): Promise<void> => {
		setIsLoading(true);

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Find user by username (mock authentication)
		const foundUser = mockUsers.find((u) => u.username === data.username);

		if (foundUser) {
			const authUser: AuthUser = {
				id: foundUser.id,
				name: foundUser.name,
				username: foundUser.username,
			};

			setUser(authUser);
			localStorage.setItem("micro-feed-user", JSON.stringify(authUser));
		} else {
			throw new Error("User not found");
		}

		setIsLoading(false);
	};

	const signup = async (data: SignupFormData): Promise<void> => {
		setIsLoading(true);

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Check if username already exists
		const existingUser = mockUsers.find((u) => u.username === data.username);
		if (existingUser) {
			setIsLoading(false);
			throw new Error("Username already exists");
		}

		// Create new user
		const newUser: AuthUser = {
			id: `user-${Date.now()}`,
			name: data.name,
			username: data.username,
			email: data.email,
		};

		setUser(newUser);
		localStorage.setItem("micro-feed-user", JSON.stringify(newUser));
		setIsLoading(false);
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("micro-feed-user");
	};

	const value = {
		user,
		login,
		signup,
		logout,
		isLoading,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
