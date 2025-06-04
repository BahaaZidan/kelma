type Toast = {
	type: 'info' | 'success' | 'error';
	message?: string;
};

class ToastsBase {
	values: Toast[] = $state([]);

	add(toast: Toast) {
		this.values.push(toast);

		setTimeout(() => {
			this.values = this.values.filter((t) => t.message !== toast.message);
		}, 5000);
	}
}

export const Toasts = new ToastsBase();
