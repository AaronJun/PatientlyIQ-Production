import { json } from '@sveltejs/kit';
import visitScheduleData from '../../../../data/journeymap/patient_burden_mapper_visit_schedule.json';

export async function GET() {
	return json(visitScheduleData);
} 