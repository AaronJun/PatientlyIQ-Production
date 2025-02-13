// trackingStores.ts
import { writable } from 'svelte/store';

interface TrackedDrug {
    drugName: string;
    Company: string;
    therapeuticArea: string;
    currentStage: string;
    indication: string;
    rpddAwardDate: string;
    voucherAwardDate: string;
    treatmentClass: string;
    mechanismOfAction: string;
    companyUrl: string;
    color: string;
}

export const trackedDrugs = writable<TrackedDrug[]>([]);