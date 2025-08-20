import { toast } from "sonner";

export const useToast = () => {
	return {
		toast: {
			success: (message: string, description?: string) => {
				toast.success(message, {
					description,
				});
			},
			error: (message: string, description?: string) => {
				toast.error(message, {
					description,
				});
			},
			info: (message: string, description?: string) => {
				toast.info(message, {
					description,
				});
			},
			warning: (message: string, description?: string) => {
				toast.warning(message, {
					description,
				});
			},
			loading: (message: string, description?: string) => {
				return toast.loading(message, {
					description,
				});
			},
			promise: <T>(
				promise: Promise<T>,
				{
					loading,
					success,
					error,
				}: {
					loading: string;
					success: string | ((data: T) => string);
					error: string | ((error: unknown) => string);
				}
			) => {
				return toast.promise(promise, {
					loading,
					success,
					error,
				});
			},
			dismiss: (toastId?: string | number) => {
				toast.dismiss(toastId);
			},
		},
	};
};

// Direct toast functions for convenience

export const toastSuccess = (message: string, description?: string) => {
	toast.success(message, { description });
};

export const toastError = (message: string, description?: string) => {
	toast.error(message, { description });
};

export const toastInfo = (message: string, description?: string) => {
	toast.info(message, { description });
};

export const toastWarning = (message: string, description?: string) => {
	toast.warning(message, { description });
};

export const toastLoading = (message: string, description?: string) => {
	return toast.loading(message, { description });
};

export const toastPromise = <T>(
	promise: Promise<T>,
	{
		loading,
		success,
		error,
	}: {
		loading: string;
		success: string | ((data: T) => string);
		error: string | ((error: unknown) => string);
	}
) => {
	return toast.promise(promise, {
		loading,
		success,
		error,
	});
};

export const toastDismiss = (toastId?: string | number) => {
	toast.dismiss(toastId);
};
