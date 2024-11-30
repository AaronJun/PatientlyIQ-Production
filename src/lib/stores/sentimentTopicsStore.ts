import topicData from '$lib/data/sentimentTopics.json';
import { writable } from 'svelte/store';
import type { ComponentType } from 'svelte';


export interface TopicData {
    topPositiveTopics: Array<{topic: string, score: number}>;
    topNegativeTopics: Array<{topic: string, score: number}>;
}


export const RadialTimeline = writable<ComponentType>(null);
export const SimpleDrawer = writable<ComponentType>(null);
export const SummaryDisplay = writable<ComponentType>(null);
export const YearlySummary = writable<ComponentType>(null);
export const NavigationGuide = writable<ComponentType>(null);
export const TherapeuticAreaLegend = writable<ComponentType>(null);


export const getTopicsForDisease = (diseaseId: string): TopicData => {
    const diseaseTopics = topicData.topicsByDisease[diseaseId];
    return {
        topPositiveTopics: diseaseTopics?.topPositiveTopics || [],
        topNegativeTopics: diseaseTopics?.topNegativeTopics || []
    };
};