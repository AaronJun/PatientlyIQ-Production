import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Import all study metadata
import defaultMetadata from '../../../../../data/journeymap/study_metadata_xackt.json';
import gxfMetadata from '../../../../../data/journeymap/gxf_203_e_metadata.json';
import bnxMetadata from '../../../../../data/journeymap/bnx_451_a_metadata.json';
import pfzMetadata from '../../../../../data/journeymap/pfz_738_d_metadata.json';

const studyMetadataMap: Record<string, any> = {
	'STUDY-302': defaultMetadata,
	'GXF-203-E': gxfMetadata,
	'BNX-451-A': bnxMetadata,
	'PFZ-738-D': pfzMetadata
};

export const GET: RequestHandler = async ({ params }) => {
	const { studyId } = params;
	
	if (!studyId || !studyMetadataMap[studyId]) {
		throw error(404, `Study metadata not found for ID: ${studyId}`);
	}
	
	return json(studyMetadataMap[studyId]);
}; 