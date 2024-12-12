interface PatientStory {
    id: string;
    color: string;
    img: string;
    name: string;
    age: string;
    disease: string;
    persona: "Patient" | "Caregiver";
    quote: string;
    summary: string;
    "trial-sentiment": string;
    "treatment-sentiment": string;
    "medical-literacy": string;
    "financial-stability": string;
  }
  
  export const patientStories: PatientStory[] = [
    {
      id: "story-1",
      color: "#FF6B6B",
      img: "", 
      name: "Sarah Chen",
      age: "32",
      disease: "Rare Blood Disorder",
      persona: "Patient",
      quote: "Every day brings new challenges, but I've learned to celebrate small victories.",
      summary: "Diagnosed at 28, Sarah has navigated treatment while maintaining her career in tech.",
      "trial-sentiment": "4",
      "treatment-sentiment": "3",
      "medical-literacy": "5",
      "financial-stability": "4",
    },
    {
      id: "story-2",
      color: "#4ECDC4",
      img: "",
      name: "Marcus Johnson",
      age: "45",
      disease: "Genetic Metabolic Condition",
      persona: "Patient",
      quote: "Finding the right treatment took time, but it was worth the wait.",
      summary: "A father of two who discovered his condition after his children were diagnosed.",
      "trial-sentiment": "5",
      "treatment-sentiment": "4",
      "medical-literacy": "3",
      "financial-stability": "2",
    },
    {
      id: "story-3",
      color: "#FFD93D",
      img: "",
      name: "Elena Martinez",
      age: "28",
      disease: "Autoimmune Disorder",
      persona: "Caregiver",
      quote: "Supporting my mother through this has changed both our lives.",
      summary: "Primary caregiver for her mother while managing her own young family.",
      "trial-sentiment": "2",
      "treatment-sentiment": "4",
      "medical-literacy": "4",
      "financial-stability": "3",
    }
  ];
  
  export function generateColorBlock(color: string, width: number = 400, height: number = 300): string {
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
      </svg>
    `)}`;
  }
  
  patientStories.forEach(story => {
    story.img = generateColorBlock(story.color);
  });