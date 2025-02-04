import { writable } from 'svelte/store';

const firstNames = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "William"];
const lastNames = ["Smith", "Johnson", "Brown", "Taylor", "Miller", "Davis", "Wilson", "Moore", "Anderson", "Jackson"];
const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"];
const states = ["NY", "CA", "IL", "TX", "AZ", "PA", "TX", "CA", "TX", "CA"];
const quotes = [
"Some days, I can't tell if it's the disease or the meds making me feel worse.",
"I'm sick of people telling me to 'just breathe.' Trust me, I'm trying.",
"Explaining IPF to people is exhausting. No, it's not like asthma.",
"I miss being able to play with my grandkids without needing a break every 5 minutes.",
"The constant dry cough drives me nuts. And everyone around me, probably.",
"I never thought I'd be jealous of people who can do their own grocery shopping.",
"Dealing with insurance for oxygen supplies is a part-time job I never wanted.",
"Sometimes I wonder if the doctors even know what they're doing with this disease.",
"I'm tired of pretending I'm okay when I'm not. This sucks, and it's okay to say that.",
"The support groups are helpful, but it's depressing to see others get worse."
];
const imageUrls = [
    '/Users/aaronjun/RaPIDLocal/static/PatientImage1.png',
    '/Users/aaronjun/RaPIDLocal/static/PatientImage2.png'
  ];
  

function generateRandomPatient(index) {
    return {
    name: `${firstNames[index]} ${lastNames[index]}`,
    age: Math.floor(Math.random() * 50) + 20, // Random age between 20 and 69
    location: `${cities[index]}, ${states[index]}`,
    quote: quotes[index],
    imageUrl: imageUrls[Math.floor(Math.random() * imageUrls.length)] // Randomly select one of the two images
    };
}

const randomPatients = Array(10).fill(null).map((_, index) => generateRandomPatient(index));

export const patients = writable(randomPatients);