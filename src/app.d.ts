// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// WebMCP HTML attributes for Svelte
declare namespace svelteHTML {
	interface HTMLAttributes<T> {
		toolname?: string
		tooldescription?: string
		toolautosubmit?: string | undefined
		toolparamdescription?: string
		toolparamtitle?: string
	}
}

export {};
