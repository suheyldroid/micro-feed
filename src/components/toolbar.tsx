"use client";

import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { logout } from "@/lib/actions/auth";
import type { FilterType } from "@/types";
import { LogOut, Plus } from "lucide-react";

interface ToolbarProps {
	searchValue: string;
	onSearchChange: (value: string) => void;
	filter: FilterType;
	onFilterChange: (filter: FilterType) => void;
	onCreatePost: () => void;
}

export function Toolbar({
	searchValue,
	onSearchChange,
	filter,
	onFilterChange,
	onCreatePost,
}: ToolbarProps) {
	const { user } = useAuth();

	return (
		<div className="sticky top-0 z-10 space-y-4 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<h1 className="text-2xl font-bold">Micro Feed</h1>
					{user && (
						<span className="text-sm text-muted-foreground">
							Welcome, @{user.username}
						</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<Button onClick={onCreatePost} className="flex items-center gap-2">
						<Plus className="h-4 w-4" />
						New Post
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={logout}
						className="flex items-center gap-2"
					>
						<LogOut className="h-4 w-4" />
						Logout
					</Button>
				</div>
			</div>

			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
				<div className="flex-1 w-full sm:w-auto">
					<SearchBar
						value={searchValue}
						onChange={onSearchChange}
						placeholder="Search posts..."
					/>
				</div>

				<div className="flex gap-2 flex-wrap">
					<Button
						variant={filter === "all" ? "default" : "outline"}
						size="sm"
						onClick={() => onFilterChange("all")}
					>
						All Posts
					</Button>
					<Button
						variant={filter === "mine" ? "default" : "outline"}
						size="sm"
						onClick={() => onFilterChange("mine")}
					>
						My Posts
					</Button>
					<Button
						variant={filter === "liked" ? "default" : "outline"}
						size="sm"
						onClick={() => onFilterChange("liked")}
					>
						Liked Posts
					</Button>
				</div>
			</div>
		</div>
	);
}
