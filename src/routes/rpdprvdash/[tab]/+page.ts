import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params, url }) => {
    const validTabs = ['overview', 'sponsor', 'therapeutic-area', 'transactions'];
    const { tab } = params;
    
    if (!validTabs.includes(tab)) {
        // Redirect to the overview page if an invalid tab is provided
        throw redirect(307, '/rpdprvdash/overview');
    }
    
    // Add navigation timestamp to help with cache busting
    const timestamp = Date.now();
    
    return {
        tab,
        timestamp,
        url: url.pathname
    };
}; 