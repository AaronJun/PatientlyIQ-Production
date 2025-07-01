import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const [visitScheduleResponse, studyMetadataResponse] = await Promise.all([
			fetch('/api/journeymapper/visit-schedule'),
			fetch('/api/journeymapper/study-metadata')
		]);
		
		const visitScheduleData = await visitScheduleResponse.json();
		const studyMetadata = await studyMetadataResponse.json();
		
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