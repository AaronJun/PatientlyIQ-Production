import { writable } from 'svelte/store';
import type { ComponentType, SvelteComponent } from 'svelte';

interface TimelineComponent extends SvelteComponent {
  navigate(direction: 'next' | 'prev'): void;
  resetZoom(): void;
}

export const RadialTimeline = writable<typeof TimelineComponent>(null);
export const SimpleDrawer = writable<ComponentType>(null);
export const SummaryDisplay = writable<ComponentType>(null);
export const YearlySummary = writable<ComponentType>(null);
export const NavigationGuide = writable<ComponentType>(null);
export const TherapeuticAreaLegend = writable<ComponentType>(null); 