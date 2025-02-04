import { writable } from 'svelte/store';

export const selectedQuote = writable('');
export const selectedPatient = writable(null);
export const selectedImage = writable('');
