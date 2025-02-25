export interface CountryData {
	name: string;
	id: string;
	compositeScore: number;
	studyStartUpDays: number;
	studiesWithCountryExperience: number;
	competingStudies: number;
	experiencedSites: number;
	totalIPFCases: number;
	ipfPatientRegistry: string;
	worldwideIPFExperience: number;
	medidataAggregateRecruitmentRate: number;
}

const countryData: CountryData[] = [
    {
      "name": "United States",
      "id": "USA",
      "compositeScore": 10.85,
      "studyStartUpDays": 112,
      "studiesWithCountryExperience": 46,
      "competingStudies": 17,
      "experiencedSites": 419,
      "totalIPFCases": 53622,
      "ipfPatientRegistry": "yes",
      "worldwideIPFExperience": 8,
      "medidataAggregateRecruitmentRate": 0.11
    },
    // ... include all other country data here
];

export function load() {
    return { countryData };
}