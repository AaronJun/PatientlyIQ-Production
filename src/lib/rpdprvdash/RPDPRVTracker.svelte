<!-- RPDPRVTracker.svelte -->
<script lang="ts">
import { onMount } from 'svelte';

// Track section views using Intersection Observer
export function trackSectionViews() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'section_view', {
              event_category: 'rpdprv_dashboard',
              event_label: entry.target.dataset.sectionName || entry.target.id,
              section_id: entry.target.id
            });
          }
        }
      });
    },
    {
      threshold: 0.5 // Trigger when 50% of section is visible
    }
  );

  // Observe all major sections
  const sections = document.querySelectorAll('[data-section]');
  sections.forEach(section => observer.observe(section));

  return () => observer.disconnect();
}

// Track tab changes
export function trackTabChange(tabName: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'tab_change', {
      event_category: 'rpdprv_dashboard',
      event_label: tabName,
      tab_name: tabName
    });
  }
}

// Track visualization interactions
export function trackVisualizationInteraction(visualizationId: string, interactionType: string, detail = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'visualization_interaction', {
      event_category: 'rpdprv_dashboard',
      event_label: `${visualizationId}_${interactionType}`,
      visualization_id: visualizationId,
      interaction_type: interactionType,
      ...detail
    });
  }
}

// Track drug detail views
export function trackDrugDetailView(drugName: string, company: string, therapeuticArea: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'drug_detail_view', {
      event_category: 'rpdprv_dashboard',
      event_label: drugName,
      drug_name: drugName,
      company: company,
      therapeutic_area: therapeuticArea
    });
  }
}

// Track company detail views
export function trackCompanyDetailView(companyName: string, drugCount: number) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'company_detail_view', {
      event_category: 'rpdprv_dashboard',
      event_label: companyName,
      company_name: companyName,
      drug_count: drugCount
    });
  }
}

// Track search interactions
export function trackSearch(searchTerm: string, resultCount: number) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'search', {
      event_category: 'rpdprv_dashboard',
      event_label: searchTerm,
      search_term: searchTerm,
      result_count: resultCount
    });
  }
}

// Track dashboard interactions
export function trackDashboardInteraction(interactionType: string, detail = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'dashboard_interaction', {
      event_category: 'rpdprv_dashboard',
      event_label: interactionType,
      interaction_type: interactionType,
      ...detail
    });
  }
}

// Track year selection
export function trackYearSelection(year: string, tabContext: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'year_selection', {
      event_category: 'rpdprv_dashboard',
      event_label: year,
      year: year,
      tab_context: tabContext
    });
  }
}

// Initialize page tracking
export function initializeTracking() {
  if (typeof window.gtag === 'function') {
    // Set page-level custom dimension
    window.gtag('set', {
      'page_type': 'dashboard',
      'dashboard_type': 'rpdprv'
    });
    
    // Send page view
    window.gtag('event', 'page_view', {
      page_title: 'RPDD + PRV Constellation',
      page_location: window.location.href,
      page_path: window.location.pathname
    });
  }
}
</script> 