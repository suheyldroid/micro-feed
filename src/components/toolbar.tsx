"use client";

import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { logout } from "@/lib/actions/auth";
import type { FilterType } from "@/types";
import {
	LogOut,
	Monitor,
	Moon,
	MoreVertical,
	Plus,
	Sun,
	User,
} from "lucide-react";
import { useTheme } from "next-themes";

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
	const { theme, setTheme } = useTheme();

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

					{/* User Menu Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="h-8 w-8 p-0">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuLabel className="flex items-center gap-2">
								<User className="h-4 w-4" />@{user?.username}
							</DropdownMenuLabel>
							<DropdownMenuSeparator />

							{/* Theme Selector */}
							<DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
								Theme
							</DropdownMenuLabel>
							<div className="px-2 py-1">
								<div className="flex gap-1">
									<Button
										variant={theme === "light" ? "default" : "ghost"}
										size="sm"
										onClick={() => setTheme("light")}
										className="h-8 w-8 p-0"
									>
										<Sun className="h-4 w-4" />
									</Button>
									<Button
										variant={theme === "dark" ? "default" : "ghost"}
										size="sm"
										onClick={() => setTheme("dark")}
										className="h-8 w-8 p-0"
									>
										<Moon className="h-4 w-4" />
									</Button>
									<Button
										variant={theme === "system" ? "default" : "ghost"}
										size="sm"
										onClick={() => setTheme("system")}
										className="h-8 w-8 p-0"
									>
										<Monitor className="h-4 w-4" />
									</Button>
								</div>
							</div>

							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={logout} variant="destructive">
								<LogOut className="mr-2 h-4 w-4" />
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Search Bar - Full Width */}
			<div className="w-full">
				<SearchBar
					value={searchValue}
					onChange={onSearchChange}
					placeholder="Search posts..."
				/>
			</div>

			{/* Filter Tabs - Separate Row */}
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
	);
}
