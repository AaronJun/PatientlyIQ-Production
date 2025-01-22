// $lib/types.ts
export interface RPDData {
    Year: string;
    RPD: string;
    "RPD PRV": string;
  }
  export interface Section {
    id: string;
    name: string;
    years: string | null;
  }
  
  export interface ScrollState {
    progress: number;
    activeSection: string;
    isHovered: boolean;
    isMobileMenuOpen: boolean;
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

  interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    constellationData: any[];
    color: string;
    sponsorData?: any;
  }
  
  interface TableItem {
    label: string;
    icon: any;
    value: string;
    onClick?: () => void;
  }
  
  interface HeaderProps {
    date: string;
    drugName: string;
    sponsor: string;
    onSponsorClick: () => void;
    TEXT_ANIMATION_DURATION: number;
  }