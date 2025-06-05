// Custom Svelte events type declarations
declare namespace svelte.JSX {
    interface HTMLAttributes<T> {
        'on:lazyload'?: (event: CustomEvent) => void;
    }
} 