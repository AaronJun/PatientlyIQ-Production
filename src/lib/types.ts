// $lib/types.ts
export interface RPDData {
    Year: string;
    RPD: string;
    "RPD PRV": string;
  }
  
  export interface ConstellationEntry {
    Year: string;
    id: string;
    name: string;
    Sponsor: string;
    "Drug Name": string;
    "Treatment Type"?: string;
    Purchased: string;
    Month: string;
    Date: string;
    Purchaser?: string;
    "Sale  Price (USD, Millions)"?: string;
  }