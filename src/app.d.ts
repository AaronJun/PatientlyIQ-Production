// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	interface Window {
        gtag: (
            command: 'event' | 'config' | 'js' | 'set',
            action: string,
            params?: object
        ) => void;
        dataLayer: any[];
    }
	
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	
	namespace svelte.JSX {
		interface HTMLAttributes<T> {
			'on:lazyload'?: (event: CustomEvent) => void;
		}
	}
}

export {};
