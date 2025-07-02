import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Import all study data
import defaultVisitSchedule from '../../../../../data/journeymap/patient_burden_mapper_visit_schedule.json';
import gxfVisitSchedule from '../../../../../data/journeymap/gxf_203_e_visit_schedule.json';
import bnxVisitSchedule from '../../../../../data/journeymap/bnx_451_a_visit_schedule.json';
import pfzVisitSchedule from '../../../../../data/journeymap/pfz_738_d_visit_schedule.json';

const studyDataMap: Record<string, any> = {
	'STUDY-302': defaultVisitSchedule,
	'GXF-203-E': gxfVisitSchedule,
	'BNX-451-A': bnxVisitSchedule,
	'PFZ-738-D': pfzVisitSchedule
};

export const GET: RequestHandler = async ({ params }) => {
	const { studyId } = params;
	
	if (!studyId || !studyDataMap[studyId]) {
		throw error(404, `Study data not found for ID: ${studyId}`);
	}
	
	return json(studyDataMap[studyId]);
}; 