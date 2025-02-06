// src/lib/data/diseaseData.ts

export interface SentimentDetail {
  totalMentions: number;
  topTerms: string[];
  trends: Array<{
    date: string;
    value: number;
  }>;
}

export interface SentimentCategory {
  category: string;
  positive: number;
  neutral: number;
  negative: number;
  mixed: number;
  details: SentimentDetail;
}

export interface DiseaseCategory {
  category: string;
  items: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

// Disease Categories and Items
export const diseases: DiseaseCategory[] = [
  {
    category: "Rare Diseases",
    items: [
      { 
        id: "cidp",
        name: "CIDP",
        description: "A rare autoimmune disorder affecting the peripheral nerves"
      },
      {
        id: "pompe",
        name: "Pompe Disease",
        description: "A rare genetic condition affecting muscle and nerve cells"
      },
      {
        id: "gaucher",
        name: "Gaucher Disease",
        description: "An inherited metabolic disorder"
      },
      {
        id: "fabry",
        name: "Fabry Disease",
        description: "A rare genetic disease affecting multiple organs"
      },
      {
        id: "mps1",
        name: "MPS I",
        description: "Mucopolysaccharidosis type I, a genetic lysosomal storage disease"
      },
      {
        id: "niemann-pick",
        name: "Niemann-Pick Disease",
        description: "A group of inherited metabolic disorders"
      }
    ]
  },
  {
    category: "Neurological",
    items: [
      {
        id: "als",
        name: "ALS",
        description: "Amyotrophic lateral sclerosis, affecting nerve cells"
      },
      {
        id: "ms",
        name: "Multiple Sclerosis",
        description: "An autoimmune disease affecting the central nervous system"
      },
      {
        id: "parkinsons",
        name: "Parkinson's Disease",
        description: "A progressive nervous system disorder affecting movement"
      },
      {
        id: "alzheimers",
        name: "Alzheimer's Disease",
        description: "A progressive brain disorder affecting memory and thinking"
      },
      {
        id: "epilepsy",
        name: "Epilepsy",
        description: "A neurological disorder characterized by recurring seizures"
      }
    ]
  },
  {
    category: "Oncology",
    items: [
      {
        id: "lungcancer",
        name: "Lung Cancer",
        description: "Cancer that begins in the lungs"
      },
      {
        id: "breastcancer",
        name: "Breast Cancer",
        description: "Cancer originating in breast tissue"
      },
      {
        id: "melanoma",
        name: "Melanoma",
        description: "A serious type of skin cancer"
      },
      {
        id: "lymphoma",
        name: "Lymphoma",
        description: "Cancer of the lymphatic system"
      },
      {
        id: "leukemia",
        name: "Leukemia",
        description: "Cancer of blood-forming tissues"
      }
    ]
  },
  {
    category: "Immunological",
    items: [
      {
        id: "rheumatoid",
        name: "Rheumatoid Arthritis",
        description: "An autoimmune disorder affecting joints"
      },
      {
        id: "lupus",
        name: "Lupus Nephritis",
        description: "A systemic autoimmune disease"
      },
      {
        id: "crohns",
        name: "Crohn's Disease",
        description: "An inflammatory bowel disease"
      }
    ]
  }
];

// Common terms used across different sentiment categories
const sentimentTerms = {
  safety: {
    positive: ["well-tolerated", "safe", "minimal side effects", "manageable", "consistent"],
    negative: ["adverse events", "complications", "risks", "severe reactions", "concerns"],
    neutral: ["monitoring", "regular checks", "standard protocol", "guidelines", "routine"],
  },
  efficacy: {
    positive: ["effective", "improvement", "success", "progress", "breakthrough"],
    negative: ["ineffective", "limited results", "no change", "resistance", "failure"],
    neutral: ["variable results", "ongoing assessment", "continued monitoring", "mixed outcomes"],
  },
  treatment: {
    positive: ["convenient", "easy to manage", "flexible", "accessible", "straightforward"],
    negative: ["complicated", "difficult", "challenging", "burdensome", "complex"],
    neutral: ["regular schedule", "maintenance", "routine care", "standard procedure"],
  },
  support: {
    positive: ["helpful", "supportive", "responsive", "understanding", "available"],
    negative: ["lacking", "insufficient", "unavailable", "limited", "inadequate"],
    neutral: ["basic", "standard", "typical", "expected", "normal"],
  }
};

// Function to generate detailed sentiment data for a specific disease
export function generateDiseaseData(diseaseId: string): SentimentCategory[] {
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

  return [
    {
      category: "Safety",
      positive: 35 + random() * 25,
      neutral: 20 + random() * 20,
      negative: 10 + random() * 15,
      mixed: 5 + random() * 10,
      details: {
        totalMentions: Math.floor(1500 + random() * 3000),
        topTerms: [...sentimentTerms.safety.positive, ...sentimentTerms.safety.negative]
          .sort(() => random() - 0.5)
          .slice(0, 5),
        trends: Array.from({ length: 6 }, (_, i) => ({
          date: `2024-${String(i + 1).padStart(2, '0')}`,
          value: 65 + (random() - 0.5) * 30
        }))
      }
    },
    {
      category: "Treatment Experience",
      positive: 40 + random() * 25,
      neutral: 15 + random() * 20,
      negative: 15 + random() * 15,
      mixed: 5 + random() * 10,
      details: {
        totalMentions: Math.floor(2000 + random() * 2500),
        topTerms: [...sentimentTerms.treatment.positive, ...sentimentTerms.treatment.negative]
          .sort(() => random() - 0.5)
          .slice(0, 5),
        trends: Array.from({ length: 6 }, (_, i) => ({
          date: `2024-${String(i + 1).padStart(2, '0')}`,
          value: 70 + (random() - 0.5) * 25
        }))
      }
    },
    {
      category: "Healthcare Support",
      positive: 45 + random() * 25,
      neutral: 20 + random() * 15,
      negative: 10 + random() * 15,
      mixed: 5 + random() * 10,
      details: {
        totalMentions: Math.floor(1000 + random() * 2000),
        topTerms: [...sentimentTerms.support.positive, ...sentimentTerms.support.negative]
          .sort(() => random() - 0.5)
          .slice(0, 5),
        trends: Array.from({ length: 6 }, (_, i) => ({
          date: `2024-${String(i + 1).padStart(2, '0')}`,
          value: 75 + (random() - 0.5) * 20
        }))
      }
    },
    {
      category: "Treatment Efficacy",
      positive: 50 + random() * 20,
      neutral: 15 + random() * 15,
      negative: 10 + random() * 15,
      mixed: 5 + random() * 10,
      details: {
        totalMentions: Math.floor(2500 + random() * 2000),
        topTerms: [...sentimentTerms.efficacy.positive, ...sentimentTerms.efficacy.negative]
          .sort(() => random() - 0.5)
          .slice(0, 5),
        trends: Array.from({ length: 6 }, (_, i) => ({
          date: `2024-${String(i + 1).padStart(2, '0')}`,
          value: 80 + (random() - 0.5) * 15
        }))
      }
    },
    {
      category: "Access & Availability",
      positive: 30 + random() * 25,
      neutral: 25 + random() * 15,
      negative: 15 + random() * 20,
      mixed: 5 + random() * 10,
      details: {
        totalMentions: Math.floor(1800 + random() * 2200),
        topTerms: [
          "availability",
          "insurance coverage",
          "cost",
          "accessibility",
          "supply"
        ],
        trends: Array.from({ length: 6 }, (_, i) => ({
          date: `2024-${String(i + 1).padStart(2, '0')}`,
          value: 60 + (random() - 0.5) * 35
        }))
      }
    },
    {
      category: "Quality of Life",
      positive: 45 + random() * 25,
      neutral: 20 + random() * 15,
      negative: 10 + random() * 15,
      mixed: 5 + random() * 10,
      details: {
        totalMentions: Math.floor(2200 + random() * 2000),
        topTerms: [
          "improvement",
          "daily activities",
          "independence",
          "lifestyle changes",
          "well-being"
        ],
        trends: Array.from({ length: 6 }, (_, i) => ({
          date: `2024-${String(i + 1).padStart(2, '0')}`,
          value: 72 + (random() - 0.5) * 25
        }))
      }
    }
  ];
}