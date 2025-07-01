import { json } from '@sveltejs/kit';
import studyMetadata from '../../../../data/journeymap/study_metadata_xackt.json';

export async function GET() {
	return json(studyMetadata);
} 