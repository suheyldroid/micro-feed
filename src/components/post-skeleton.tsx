"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PostSkeleton() {
	return (
		<Card>
			<CardHeader className="space-y-3">
				<div className="flex items-center space-x-2">
					{/* Avatar skeleton */}
					<div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
					{/* Username skeleton */}
					<div className="h-4 bg-muted rounded w-24 animate-pulse" />
					{/* Timestamp skeleton */}
					<div className="h-3 bg-muted rounded w-16 animate-pulse" />
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{/* Content skeleton */}
				<div className="space-y-2">
					<div className="h-4 bg-muted rounded w-full animate-pulse" />
					<div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
					<div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
				</div>
				{/* Actions skeleton */}
				<div className="flex items-center space-x-4 pt-3">
					<div className="h-8 bg-muted rounded w-16 animate-pulse" />
					<div className="h-8 bg-muted rounded w-16 animate-pulse" />
				</div>
			</CardContent>
		</Card>
	);
}

export function PostSkeletonList({ count = 3 }: { count?: number }) {
	return (
		<div className="space-y-4">
			{Array.from({ length: count }, () => (
				<PostSkeleton key={Math.random().toString(36)} />
			))}
		</div>
	);
}
