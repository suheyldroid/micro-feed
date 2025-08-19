import type { Post, User } from "@/types";

export const mockUsers: User[] = [
	{
		id: "user-1",
		name: "John Doe",
		username: "johndoe",
	},
	{
		id: "user-2",
		name: "Jane Smith",
		username: "janesmith",
	},
	{
		id: "user-3",
		name: "Mike Johnson",
		username: "mikejohnson",
	},
	{
		id: "user-4",
		name: "Sarah Wilson",
		username: "sarahwilson",
	},
];

export const currentUser = mockUsers[0]; // John Doe is the current user

export const mockPosts: Post[] = [
	{
		id: "post-1",
		content:
			"Just shipped a new feature! Really excited about how it turned out. The team worked really hard on this one. 🚀",
		authorId: "user-1",
		authorName: "John Doe",
		authorUsername: "johndoe",
		createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
		updatedAt: new Date(Date.now() - 1000 * 60 * 30),
		likes: ["user-2", "user-3"],
	},
	{
		id: "post-2",
		content:
			"Beautiful sunset today! Sometimes you just need to stop and appreciate the little things in life. Nature is truly amazing.",
		authorId: "user-2",
		authorName: "Jane Smith",
		authorUsername: "janesmith",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
		updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
		likes: ["user-1", "user-3", "user-4"],
	},
	{
		id: "post-3",
		content:
			"Learning TypeScript has been such a game changer for my development workflow. The type safety really helps catch bugs early.",
		authorId: "user-3",
		authorName: "Mike Johnson",
		authorUsername: "mikejohnson",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
		updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
		likes: ["user-1", "user-2"],
	},
	{
		id: "post-4",
		content:
			"Coffee shop vibes today ☕ Working on some exciting new projects. Anyone else love the energy of a good coffee shop?",
		authorId: "user-4",
		authorName: "Sarah Wilson",
		authorUsername: "sarahwilson",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
		updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
		likes: ["user-2"],
	},
	{
		id: "post-5",
		content:
			"Quick update on the project - we're making great progress! Thanks to everyone who provided feedback on the initial designs.",
		authorId: "user-1",
		authorName: "John Doe",
		authorUsername: "johndoe",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
		updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 10), // edited 2 hours later
		likes: ["user-3", "user-4"],
	},
	{
		id: "post-6",
		content:
			"React 19 is looking amazing! The new features are going to make development so much smoother. Can't wait to try them out.",
		authorId: "user-2",
		authorName: "Jane Smith",
		authorUsername: "janesmith",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
		updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
		likes: ["user-1"],
	},
];
