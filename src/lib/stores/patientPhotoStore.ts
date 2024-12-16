// src/lib/stores/patientPhotoStore.ts
import { writable } from 'svelte/store';

export const selectedPhoto = writable<string | null>(null);
export const selectedPatient = writable<any>(null);

export function updatePatientPhoto(photoUrl: string) {
    selectedPhoto.set(photoUrl);
}

export function updateSelectedPatient(patient: any) {
    selectedPatient.set(patient);
    if (patient?.img) {
        updatePatientPhoto(patient.img);
    }
}