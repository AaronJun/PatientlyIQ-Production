import { writable } from 'svelte/store';
import type { SvelteComponentType } from 'svelte';

export const RadialTimeline = writable<SvelteComponentType>(null);
export const SimpleDrawer = writable<SvelteComponentType>(null);
export const SummaryDisplay = writable<SvelteComponentType>(null);
export const YearlySummary = writable<SvelteComponentType>(null);
export const NavigationGuide = writable<SvelteComponentType>(null);
export const TherapeuticAreaLegend = writable<SvelteComponentType>(null);