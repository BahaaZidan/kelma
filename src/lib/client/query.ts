import type { QueryClient } from '@tanstack/svelte-query';

export const revertOptimisticUpdate =
	(queryClient: QueryClient) =>
	(
		_e: Error,
		_r: void,
		context?: {
			previousData: [readonly unknown[], unknown | undefined][];
		}
	) => {
		if (!context?.previousData) return;

		context.previousData.forEach(([queryKey, oldData]) => {
			queryClient.setQueryData(queryKey, oldData);
		});
	};
