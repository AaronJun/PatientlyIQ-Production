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
      fill: '#A8ABC5',    // Lighter green
      stroke: '#4C51BF'   // Darker green
    },
    'Cardiovascular': {
      fill: '#FEEBC8',    // Lighter orange
      stroke: '#C05621'   // Darker orange
    },
    'Cardiology': {
      fill: '#1CD819',    // Lighter red-orange
      stroke: '#38A169'   // Darker red-orange
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
      fill: '#E7FEC4',    // Lighter purple
      stroke: '#C4904D'   // Darker purple
    },
    'Rheumatology': {
      fill: '#FEEBC8',    // Lighter amber-orange
      stroke: '#9C4221'   // Darker amber-orange
    }
  };
  
export function getStageColor(stageName: string) {
  const stageColors = {
      'Preclinical': { fill: '#E3F2FD', stroke: '#4C5BBB' },
      'Phase 1': { fill: '#E8F5E9', stroke: '#414D9D' },
      'Phase 1/2': { fill: '#E8F5E9', stroke: '#2F3A81' },
      'Phase 2': { fill: '#FFF3E0', stroke: '#2F6181' },
      'Phase 3': { fill: '#FFEECE', stroke: '#2F8170' },
      'Filed': { fill: '#FBE9E7', stroke: '#2E7139' },
      'Approved': { fill: '#F3E5F5', stroke: '#2E7139' },
      'PRV Awarded': { fill: '#FFF8E1', stroke: '#2E7139' },
      'PRV Transacted': { fill: '#FCE8A5', stroke: '#127F24' } // Added new color for PRV Transacted
  };

  // Default color
  const defaultColor = { fill: '#ECEFF1', stroke: '#B0BEC5' };

  return stageColors[stageName] || defaultColor;
}
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
  
  export function getCompanyStatusColor(status: string) {
    if (status === 'Public') {
        return { fill: '#E8F0FE', stroke: '#1A73E8' };
    } else {
        return { fill: '#F8F9FA', stroke: '#5F6368' };
    }
  }
  
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