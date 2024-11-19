// src/lib/data/trialAwareness.ts

export interface SearchVolume {
    category: string;
    volume: number;
    percentageOfTotal: number;
  }
  
  export interface TrialAwarenessMetrics {
    searchVolumes: SearchVolume[];
    totalMonthlySearches: number;
    trialAwarenessScore: number;
    informationSources: Array<{
      source: string;
      percentage: number;
    }>;
    patientEngagement: {
      discussedWithDoctor: number;
      activelySearching: number;
      intendToParticipate: number;
      previousParticipation: number;
    };
    barriersToParticipation: Array<{
      barrier: string;
      percentage: number;
    }>;
  }
  
  export function generateTrialAwarenessData(diseaseId: string): TrialAwarenessMetrics {
    // Use deterministic randomization based on diseaseId
    const seedRandom = (seed: string) => {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return () => {
        hash = (hash * 9301 + 49297) % 233280;
        return hash / 233280;
      };
    };
  
    const random = seedRandom(diseaseId);
  
    // Base search volumes with some randomization
    const searchVolumes: SearchVolume[] = [
      {
        category: "Treatments",
        volume: Math.floor(5000 + random() * 3000),
        percentageOfTotal: 100
      },
      {
        category: "New Treatments",
        volume: Math.floor(300 + random() * 400),
        percentageOfTotal: 5 + random() * 5
      },
      {
        category: "Clinical Trials + Research",
        volume: Math.floor(100 + random() * 200),
        percentageOfTotal: 2 + random() * 6
      },
      {
        category: "Diet / Natural Remedies",
        volume: Math.floor(1000 + random() * 1000),
        percentageOfTotal: 15 + random() * 10
      }
    ];
  
    const informationSources = [
      {
        source: "Healthcare Provider",
        percentage: 45 + random() * 20
      },
      {
        source: "Online Search",
        percentage: 60 + random() * 20
      },
      {
        source: "Patient Organizations",
        percentage: 30 + random() * 25
      },
      {
        source: "Social Media",
        percentage: 25 + random() * 20
      },
      {
        source: "Other Patients",
        percentage: 20 + random() * 25
      }
    ];
  
    const barriers = [
      {
        barrier: "Distance to Trial Site",
        percentage: 35 + random() * 20
      },
      {
        barrier: "Uncertainty about Costs",
        percentage: 45 + random() * 20
      },
      {
        barrier: "Time Commitment",
        percentage: 40 + random() * 15
      },
      {
        barrier: "Fear of Side Effects",
        percentage: 30 + random() * 25
      },
      {
        barrier: "Lack of Information",
        percentage: 25 + random() * 20
      }
    ];
  
    return {
      searchVolumes,
      totalMonthlySearches: searchVolumes.reduce((acc, curr) => acc + curr.volume, 0),
      trialAwarenessScore: 20 + random() * 40, // Score out of 100
      informationSources,
      patientEngagement: {
        discussedWithDoctor: 25 + random() * 35,
        activelySearching: 15 + random() * 25,
        intendToParticipate: 10 + random() * 20,
        previousParticipation: 5 + random() * 10
      },
      barriersToParticipation: barriers
    };
  }
  
  // Comparative data across disease categories
  export const categoryAverages: Record<string, {
    trialAwareness: number;
    participationIntent: number;
    searchVolume: number;
  }> = {
    "Rare Diseases": {
      trialAwareness: 45,
      participationIntent: 28,
      searchVolume: 2500
    },
    "Neurological": {
      trialAwareness: 38,
      participationIntent: 22,
      searchVolume: 5500
    },
    "Oncology": {
      trialAwareness: 52,
      participationIntent: 35,
      searchVolume: 8500
    },
    "Immunological": {
      trialAwareness: 42,
      participationIntent: 25,
      searchVolume: 4500
    }
  };
  
  // Examples of longitudinal trends
  export function getTrialAwarenessTrends(diseaseId: string) {
    const random = seedRandom(diseaseId);
    
    return Array.from({ length: 12 }, (_, i) => ({
      month: `2024-${String(i + 1).padStart(2, '0')}`,
      awareness: 30 + random() * 40,
      searchVolume: 1000 + random() * 4000,
      participationIntent: 15 + random() * 25
    }));
  }