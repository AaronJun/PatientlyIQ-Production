<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
  
    export let data: never[] = []; // Clinical data passed as a prop
    export let width = 800; // Timeline width, defaulting to 800px
    export let enableTooltips = true; // Whether to enable track tooltips
  
    let timelineContainer: HTMLDivElement;
    let timeline: { (): void; (): void; plugins: any; data: any; collapseAll: any; toggleTrackCollapse: any; };
    const dispatch = createEventDispatcher();
  
    $: if (timeline && timeline() && data.length > 0) {
      updateTimeline();
    }
  
    onMount(() => {
      initializeTimeline();
      return () => {
        // Cleanup if necessary
      };
    });
  
    function initializeTimeline() {
      if (!timelineContainer) return;
  
      timeline = clinicalTimeline()
        .width(width)
        .data(clinicalTimelineParser(data))
        .divId("#" + timelineContainer.id)
        .enableTrackTooltips(enableTooltips);
  
      // Add plugins
      timeline.plugins([
        {
          obj: clinicalTimelineZoom,
          enabled: true
        },
        {
          obj: clinicalTimelineVerticalLine,
          enabled: true,
          spec: {
            tooltipControllerId: '#vl-controller-id',
            hoverBegin: 10,
            hoverEnd: width - 10
          }
        }
      ]);
  
      // Render the timeline
      timeline();
  
      // Dispatch an event when the timeline is ready
      dispatch('timelineReady', { timeline });
    }
  
    function updateTimeline() {
      if (timeline) {
        timeline.data(clinicalTimelineParser(data));
        timeline();
      }
    }
  
    export function collapseAll() {
      if (timeline) {
        timeline.collapseAll()();
      }
    }
  
    export function toggleTrackCollapse(track: any) {
      // @ts-ignore
      if (timeline) {
        timeline.toggleTrackCollapse(track)();
      }
    }
  </script>
  
  <div bind:this={timelineContainer} id="clinical-timeline-{Math.random().toString(36).substr(2, 9)}">
    <!-- The timeline will be rendered here -->
  </div>
  
  <style>
    div {
      width: 100%;
      max-width: var(--timeline-width, 800px);
      margin: 0 auto;
    }
  </style>