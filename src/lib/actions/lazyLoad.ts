export type LazyLoadOptions = {
    threshold?: number;
    rootMargin?: string;
};

// Declare the custom event for TypeScript
declare global {
    namespace svelte.JSX {
        interface HTMLAttributes<T> {
            'on:lazyload'?: (event: CustomEvent) => void;
        }
    }
}

/**
 * A Svelte action that observes when an element enters the viewport
 * and dispatches a 'lazyload' event when it does.
 * 
 * @param node - The DOM element to observe
 * @param options - IntersectionObserver options
 * @returns A Svelte action object
 */
export function lazyLoad(node: HTMLElement, options: LazyLoadOptions = { threshold: 0.1 }) {
    let loaded = false;
    let observer: IntersectionObserver | null = null;
    
    function handleIntersection(entries: IntersectionObserverEntry[]) {
        const entry = entries[0];
        if (entry.isIntersecting && !loaded) {
            loaded = true;
            node.dispatchEvent(new CustomEvent('lazyload'));
            if (observer) {
                observer.disconnect();
            }
        }
    }
    
    observer = new IntersectionObserver(handleIntersection, options);
    observer.observe(node);
    
    return {
        destroy() {
            if (observer) {
                observer.disconnect();
            }
        }
    };
} 