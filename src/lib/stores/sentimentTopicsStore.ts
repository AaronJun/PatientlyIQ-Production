import topicData from '$lib/data/sentimentTopics.json';

export interface TopicData {
    topPositiveTopics: Array<{topic: string, score: number}>;
    topNegativeTopics: Array<{topic: string, score: number}>;
}

export const getTopicsForDisease = (diseaseId: string): TopicData => {
    const diseaseTopics = topicData.topicsByDisease[diseaseId];
    return {
        topPositiveTopics: diseaseTopics?.topPositiveTopics || [],
        topNegativeTopics: diseaseTopics?.topNegativeTopics || []
    };
};