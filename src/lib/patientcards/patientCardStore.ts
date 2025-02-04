import { writable } from 'svelte/store';

type PatientCard = {
    id: string;
    name: string;
    img: string;
    disease: string;
    persona: string;
    age: string;
    bio: string;
    cards: any[];  // You can type this more specifically based on your card structure
    wordCloudData?: any[];
};

type PatientCardState = {
    selectedPatient: PatientCard | null;
    activeCard: number;
    showGrid: boolean;
    imageLoadingStates: Map<string, boolean>;
};

const createPatientCardStore = () => {
    const { subscribe, set, update } = writable<PatientCardState>({
        selectedPatient: null,
        activeCard: 0,
        showGrid: false,
        imageLoadingStates: new Map()
    });

    return {
        subscribe,
        setPatient: (patient: PatientCard) => update(state => ({
            ...state,
            selectedPatient: patient
        })),
        setActiveCard: (index: number) => update(state => ({
            ...state,
            activeCard: index
        })),
        toggleGrid: () => update(state => ({
            ...state,
            showGrid: !state.showGrid
        })),
        setImageLoading: (imageId: string, loading: boolean) => update(state => {
            const newLoadingStates = new Map(state.imageLoadingStates);
            newLoadingStates.set(imageId, loading);
            return {
                ...state,
                imageLoadingStates: newLoadingStates
            };
        }),
        reset: () => set({
            selectedPatient: null,
            activeCard: 0,
            showGrid: false,
            imageLoadingStates: new Map()
        })
    };
};

export const patientCardStore = createPatientCardStore();