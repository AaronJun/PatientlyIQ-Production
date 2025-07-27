import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const [visitScheduleResponse, studyMetadataResponse] = await Promise.all([
			fetch('/api/journeymapper/visit-schedule'),
			fetch('/api/journeymapper/study-metadata')
		]);
		
		const visitScheduleData = await visitScheduleResponse.json();
		const studyMetadataArray = await studyMetadataResponse.json();
		
		// Get the first study from the array as the default
		const studyMetadata = studyMetadataArray[0];
		
		return {
			visitScheduleData,
			studyMetadata
		};
	} catch (error) {
		console.error('Failed to load journeymapper data:', error);
		return {
			visitScheduleData: { visits: [] },
			studyMetadata: {}
		};
	}
}; 