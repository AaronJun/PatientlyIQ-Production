// colorDefinitions.ts
// Central repository of color definitions for the RPDD + PRV Dashboard
// Define interface for color combinations (fill and stroke)
export interface ColorCombo {
    fill: string;
    stroke: string;
  }
  
  // Therapeutic area color map with fill and stroke combinations
  export const therapeuticAreaColors: Record<string, ColorCombo> = {
    'Neurology': {
      fill: '#ff1515',    
      stroke: '#FEB2B2'   
    },
    'Neuromuscular': {
        fill: '#2F855A',    // Lighter green
        stroke: '#C6F6D5'   // Darker green
    },
    'Oncology': {
      fill: '#B2F5EA',    // Lighter teal
      stroke: '#5CC988'   // Darker teal
    },
    'Metabolic': {
      fill: '#4C51BF',    // Lighter purple-blue
      stroke: '#B2F5EA'   // Darker purple-blue
    },
    'Ophthalmology': {
      fill: '#FFF',    // Lighter green
      stroke: '#38A169'   // Darker green
    },
    'Cardiovascular': {
      fill: '#FEEBC8',    // Lighter orange
      stroke: '#C05621'   // Darker orange
    },
    'Cardiology': {
      fill: '#fff',    // Lighter red-orange
      stroke: '#DD6B20'   // Darker red-orange
    },
    'Pulmonology': {
      fill: '#E9D8FD',    // Lighter lavender
      stroke: '#6B46C1'   // Darker lavender
    },
    'Hematology': {
       fill: '#FEB299',    // Lighter red  
       stroke: '#ff1515'   // Even darker red 
    },
    'Endocrinology': {
      fill: '#FEFCBF',    // Lighter amber
      stroke: '#B7791F'   // Darker amber
    },
    'Genetic': {
      fill: '#BEE3F8',    // Lighter cyan
      stroke: '#2B6CB0'   // Darker cyan
    },
    'Immunology': {
      fill: '#FED7D7',    // Lighter red
      stroke: '#9B2C2C'   // Darker red
    },
    'Gastroenterology': {
      fill: '#FAF089',    // Lighter yellow
      stroke: '#975A16'   // Darker yellow/brown
    },
    'Hepatology': {
      fill: '#C6F6D5',    // Lighter mint green
      stroke: '#2F855A'   // Darker green
    },
    'Nephrology': {
      fill: '#90CDF4',    // Lighter blue
      stroke: '#2C5282'   // Darker blue
    },
    'Orthopedics': {
      fill: '#E9D8FD',    // Lighter purple
      stroke: '#805AD5'   // Darker purple
    },
    'Dermatology': {
      fill: '#FEB2B2',    // Lighter pink
      stroke: '#E53E3E'   // Darker red
    },
    'Neonatology': {
      fill: '#BEE3F8',    // Lighter blue
      stroke: '#3182CE'   // Darker blue
    },
    'Urology': {
      fill: '#D6BCFA',    // Lighter purple
      stroke: '#6B46C1'   // Darker purple
    },
    'Rheumatology': {
      fill: '#FEEBC8',    // Lighter amber-orange
      stroke: '#9C4221'   // Darker amber-orange
    }
  };
  
  // Development stage color map
  export const stageColors: Record<string, ColorCombo> = {
    'Preclinical': {
      fill: '#E2E8F0',     // Light slate gray
      stroke: '#4A5568'    // Darker slate gray
    },
    'Phase 1': {
      fill: '#B2F5EA',     // Light teal
      stroke: '#2C7A7B'    // Darker teal
    },
    'Phase 1/2': {
      fill: '#BEE3F8',     // Light blue
      stroke: '#2B6CB0'    // Darker blue
    },
    'Phase 2': {
      fill: '#90CDF4',     // Medium blue
      stroke: '#2C5282'    // Darker blue
    },
    'Phase 2a': {
      fill: '#90CDF4',     // Medium blue
      stroke: '#2C5282'    // Darker blue
    },
    'Phase 2b': {
      fill: '#90CDF4',     // Medium blue
      stroke: '#2C5282'    // Darker blue
    },
    'Phase 3': {
      fill: '#63B3ED',     // Deeper blue
      stroke: '#1A365D'    // Navy blue
    },
    'FDA Approved': {
      fill: '#2F855A',     // Light green
      stroke: '#9AE6B4'    // Darker green
    },
    'PRV Awarded': {
      fill: '#68D391',     // Medium green
      stroke: '#276749'    // Darker green
    },
    'Filed': {
      fill: '#FEB2B2',     // Light red
      stroke: '#7B341E'    // Brown
    },
    'Approved': {
      fill: '#9AE6B4',     // Light green
      stroke: '#2F855A'    // Darker green
    }
  };
  
  // Company status color map
  export const companyStatusColors: Record<string, ColorCombo> = {
    'Public': {
      fill: '#BEE3F8',    // Light blue
      stroke: '#2B6CB0'   // Darker blue
    },
    'Private': {
      fill: '#FEEBC8',    // Light orange
      stroke: '#C05621'   // Darker orange
    }
  };
  
  // Helper functions to get colors with fallbacks
  export const getTherapeuticAreaColor = (area: string): ColorCombo => {
    return therapeuticAreaColors[area] || { fill: '#CBD5E0', stroke: '#4A5568' }; // Gray fallback
  };
  
  export const getStageColor = (stage: string): ColorCombo => {
    return stageColors[stage] || { fill: '#E2E8F0', stroke: '#718096' }; // Light gray fallback
  };
  
  export const getCompanyStatusColor = (status: string): ColorCombo => {
    return companyStatusColors[status] || { fill: '#EDF2F7', stroke: '#4A5568' }; // Slate gray fallback
  };
  
  // Helper functions for backward compatibility (returns only fill color)
  export const getTherapeuticAreaFill = (area: string): string => {
    return getTherapeuticAreaColor(area).fill;
  };
  
  export const getStageFill = (stage: string): string => {
    return getStageColor(stage).fill;
  };
  
  export const getTherapeuticAreaStroke = (area: string): string => {
    return getTherapeuticAreaColor(area).stroke;
  };
  
  export const getStageStroke = (stage: string): string => {
    return getStageColor(stage).stroke;
  };