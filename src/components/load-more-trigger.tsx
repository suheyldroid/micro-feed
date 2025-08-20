"use client";

import { Button } from "@/components/ui/button";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Loader2 } from "lucide-react";

interface LoadMoreTriggerProps {
	hasNextPage?: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: () => Promise<unknown> | undefined;
	autoLoad?: boolean;
	className?: string;
	error?: Error | null;
}

export function LoadMoreTrigger({
	hasNextPage = false,
	isFetchingNextPage,
	fetchNextPage,
	autoLoad = true,
	className = "",
	error = null,
}: LoadMoreTriggerProps) {
	const { targetRef } = useInfiniteScroll({
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		enabled: autoLoad,
		rootMargin: "200px", // Start loading when 200px from viewport
	});

	// Don't render anything if there's no next page and no error
	if (!hasNextPage && !isFetchingNextPage && !error) {
		return null;
	}

	return (
		<div
			ref={targetRef}
			className={`flex justify-center items-center py-8 ${className}`}
		>
			{error ? (
				<div className="text-center">
					<p className="text-destructive text-sm mb-2">Failed to load more posts</p>
					<Button
						variant="outline"
						size="sm"
						onClick={fetchNextPage}
					>
						Try Again
					</Button>
				</div>
			) : isFetchingNextPage ? (
				<div className="flex items-center gap-2 text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span className="text-sm">Loading more posts...</span>
				</div>
			) : autoLoad ? (
				// Auto-load trigger (invisible)
				<div className="h-4 w-full" />
			) : (
				// Manual load button
				<Button
					variant="outline"
					onClick={fetchNextPage}
					disabled={!hasNextPage}
					className="w-full max-w-xs"
				>
					Load More Posts
				</Button>
			)}
		</div>
	);
}
