<!-- ALZsentimentTracker.svelte -->
<script lang="ts">
import { onMount } from 'svelte';

// Track section views using Intersection Observer
export function trackSectionViews() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          window.trackEvent('section_view', {
            section_id: entry.target.id,
            section_name: entry.target.dataset.sectionName || entry.target.id
          });
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

// Track chart interactions
export function trackChartInteraction(chartId, interactionType, detail = {}) {
  window.trackEvent('chart_interaction', {
    chart_id: chartId,
    interaction_type: interactionType,
    ...detail
  });
}

// Track patient story interactions
export function trackPatientStoryInteraction(storyId, interactionType) {
  window.trackEvent('patient_story_interaction', {
    story_id: storyId,
    interaction_type: interactionType
  });
}

// Track sentiment analysis interactions
export function trackSentimentAnalysis(category, sentiment, value) {
  window.trackEvent('sentiment_analysis_interaction', {
    category,
    sentiment,
    value
  });
}
</script>