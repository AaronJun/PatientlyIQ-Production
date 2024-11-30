<script lang="ts">
  import { onMount } from 'svelte';
  import { RadialTimeline, YearlySummary } from '$lib/componentStores';
  import rpdPrvDataRaw from '../data/RPDPRVOverviewData.json';
  import constellationDataRaw from '../data/RPDConstellationData.json';

  let currentYear = "Overview";
  let hoveredPetalData: any = null;
  let isDrawerOpen = false;
  let selectedData: any = null;
  let processedRpdPrvData: any[] = [];
  let processedConstellationData: any[] = [];

  // Keep existing data processing functions and handlers
  function processRpdPrvData(data: any[]): any[] {
    let processed = data.map(item => {
      if (!item.RPD || item.RPD === "0") {
        const averageRPD = calculateAverageRPD(data, parseInt(item.Year));
        return { ...item, RPD: averageRPD.toString(), "RPD PRV": item["RPD PRV"] || "0" };
      }
      return item;
    });

    const currentDate = new Date().getFullYear();
    for (let year = 2021; year <= currentDate; year++) {
      if (!processed.find(item => item.Year === year.toString())) {
        const averageRPD = calculateAverageRPD(processed, year);
        processed.push({ Year: year.toString(), RPD: averageRPD.toString(), "RPD PRV": "0" });
      }
    }
    return processed.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
  }

  function calculateAverageRPD(data: any[], targetYear: number): number {
    const lastFiveYears = data
      .filter(item => +item.Year >= targetYear - 5 && +item.Year < targetYear)
      .filter(item => item.RPD && item.RPD !== "0");
    if (lastFiveYears.length === 0) return 0;
    const sum = lastFiveYears.reduce((acc, curr) => acc + parseInt(curr.RPD), 0);
    return Math.round(sum / lastFiveYears.length);
  }

  function processConstellationData(data: any[]): any[] {
    return data;
  }

  const handleYearChange = (event: CustomEvent) => currentYear = event.detail.year;
  const handlePetalHover = (event: CustomEvent) => hoveredPetalData = event.detail;
  const handlePetalLeave = () => hoveredPetalData = null;
  const handleClusterElementClick = (event: CustomEvent) => {
    selectedData = event.detail.entry;
    isDrawerOpen = true;
  };

  onMount(async () => {
    try {
      processedRpdPrvData = processRpdPrvData(rpdPrvDataRaw);
      processedConstellationData = processConstellationData(constellationDataRaw);
      const [RadialTimelineComp, YearlySummaryComp] = await Promise.all([
        import('$lib/RPDComponents/RadialTimeline.svelte'),
        import('$lib/RPDComponents/RPDYearSummary.svelte')
      ]);
      RadialTimeline.set(RadialTimelineComp.default);
      YearlySummary.set(YearlySummaryComp.default);
    } catch (error) {
      console.error('Error initializing:', error);
    }
  });
</script>

<div class="page-container">
  <div class="info-panel">
    {#if $YearlySummary && processedConstellationData.length > 0}
      <svelte:component 
        this={$YearlySummary}
        {currentYear}
        constellationData={processedConstellationData}
        {hoveredPetalData}
        {isDrawerOpen}
        {selectedData}
        on:clusterElementClick={handleClusterElementClick}
      />
    {/if}
  </div>
  <div class="timeline-container">
    {#if $RadialTimeline && processedRpdPrvData.length > 0 && processedConstellationData.length > 0}
      <svelte:component 
        this={$RadialTimeline}
        data={processedRpdPrvData}
        constellationData={processedConstellationData}
        on:yearChange={handleYearChange}
        on:petalHover={handlePetalHover}
        on:petalLeave={handlePetalLeave}
        on:clusterElementClick={handleClusterElementClick}
      />
    {/if}
  </div>
</div>

<style>
  .page-container {
  display: grid;
  grid-template-columns: 25vw 70vw; /* Adjust ratio between timeline and info panel */
  height: 100vh;
  overflow: hidden;
}

.timeline-container {
  width: 75vw;
  height: 100vh;
  display: flex;
  justify-content: left;
  align-items: flex-start; /* Change from center to flex-start */
  padding-top: 0rem; /* Add some top padding */
}

.info-panel {
  background-color: #fff;
  height: 90vh;
  padding: 1rem;
  overflow-y: auto;
}

  h3 {
    font-weight: 800;
    text-transform: uppercase;
    font-size: .65rem;
    color: #C9623F;
    margin-bottom: .62rem;
  }
</style>