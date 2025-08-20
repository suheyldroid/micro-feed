import { useCallback, useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
	hasNextPage?: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: () => Promise<unknown> | undefined;
	rootMargin?: string;
	threshold?: number;
	enabled?: boolean;
}

export function useInfiniteScroll({
	hasNextPage = false,
	isFetchingNextPage,
	fetchNextPage,
	rootMargin = "100px",
	threshold = 0.1,
	enabled = true,
}: UseInfiniteScrollOptions) {
	const targetRef = useRef<HTMLDivElement>(null);
	const observerRef = useRef<IntersectionObserver | null>(null);

	const isLoadingRef = useRef(false);

	const handleIntersection = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			const [entry] = entries;
			
			if (
				entry?.isIntersecting &&
				hasNextPage &&
				!isFetchingNextPage &&
				!isLoadingRef.current &&
				enabled
			) {
				isLoadingRef.current = true;
				const result = fetchNextPage();
				if (result && typeof result.finally === 'function') {
					result.finally(() => {
						isLoadingRef.current = false;
					});
				} else {
					isLoadingRef.current = false;
				}
			}
		},
		[hasNextPage, isFetchingNextPage, fetchNextPage, enabled]
	);

	useEffect(() => {
		const currentTarget = targetRef.current;
		
		if (!currentTarget || !enabled) {
			return;
		}

		// Disconnect previous observer if exists
		if (observerRef.current) {
			observerRef.current.disconnect();
		}

		// Create new observer
		observerRef.current = new IntersectionObserver(handleIntersection, {
			rootMargin,
			threshold,
		});

		observerRef.current.observe(currentTarget);

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
				observerRef.current = null;
			}
		};
	}, [handleIntersection, rootMargin, threshold, enabled]);

	return {
		targetRef,
		isIntersecting: false, // We could track this if needed
	};
}
