// src/routes/rpdprvdash/+page.ts
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
    // Redirect to the overview tab by default
    throw redirect(307, '/rpdprvdash/overview');
};
