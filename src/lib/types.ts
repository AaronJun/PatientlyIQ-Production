// $lib/types.ts
import type { SimulationNodeDatum } from 'd3';

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

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  constellationData: any[];
  color: string;
  sponsorData?: any;
}

export interface TableItem {
  label: string;
  icon: any;
  value: string;
  onClick?: () => void;
}

export interface HeaderProps {
  date: string;
  drugName: string;
  sponsor: string;
  onSponsorClick: () => void;
  TEXT_ANIMATION_DURATION: number;
}

// New types for SaleBenchmarks component
export interface SalePoint {
  price: number;
  buyer: string;
  seller: string;
  drugName: string;
}

export interface CompanyStats {
  name: string;
  count: number;
  totalPrice: number;
  avgPrice: number;
}

export interface RPDEntry {
  Company: string;
  TherapeuticArea1: string;
  Candidate: string;
  "RPDD Year": string;
  "Current Development Stage": string;
  Indication: string;
  Class1: string;
  MOA: string;
  "PRV Issue Year": string;
  "Link to CrunchBase": string;
  [key: string]: string;
}