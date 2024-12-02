<script lang="ts">
  import { onMount } from 'svelte';
  import { RadialTimeline, YearlySummary } from '$lib/componentStores';
  import RPDDrawer from '$lib/RPDComponents/RPDDrawer.svelte';
  import Tooltip from '$lib/RPDComponents/RPDTooltip.svelte';
  import rpdPrvDataRaw from '../data/RPDPRVOverviewData.json';
  import RPDNavDrawer from '$lib/RPDComponents/RPDNavGuide.svelte';
  import constellationDataRaw from '../data/RPDConstellationData.json';

  interface RPDData {
    Year: string;
    RPD: string;
    "RPD PRV": string;
  }

  interface ConstellationEntry {
    Year: string;
    id: string;
    name: string;
    Sponsor: string;
    "Drug Name": string;
    "Treatment Type"?: string;
    Purchased: string;
    Month: string;
    Date: string;
    Purchaser?: string;
  }

  let currentYear = "2012";   
  let hoveredPetalData: ConstellationEntry | null = null;
  let isDrawerOpen = false;
  let selectedData: ConstellationEntry | null = null;
  let selectedColor: string = "";
  let processedRpdPrvData: RPDData[] = [];
  let processedConstellationData: ConstellationEntry[] = [];

  // Tooltip state
  let tooltipVisible = false;
  let tooltipX = 0;
  let tooltipY = 0;
  let tooltipContent = {
    sponsor: '',
    drugName: '',
    therapeuticArea: '',
    id: ''
  };
  let tooltipBorderColor = '';

  function processRpdPrvData(data: RPDData[]): RPDData[] {
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
        processed.push({ 
          Year: year.toString(), 
          RPD: averageRPD.toString(), 
          "RPD PRV": "0" 
        });
      }
    }
    return processed.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
  }

  function calculateAverageRPD(data: RPDData[], targetYear: number): number {
    const lastFiveYears = data
      .filter(item => +item.Year >= targetYear - 5 && +item.Year < targetYear)
      .filter(item => item.RPD && item.RPD !== "0");
    
    if (lastFiveYears.length === 0) return 0;
    const sum = lastFiveYears.reduce((acc, curr) => acc + parseInt(curr.RPD), 0);
    return Math.round(sum / lastFiveYears.length);
  }

  function processConstellationData(data: ConstellationEntry[]): ConstellationEntry[] {
    return data.map(entry => ({
      ...entry,
      Year: entry.Year.toString()
    }));
  }

  const handleYearChange = (event: CustomEvent) => {
    currentYear = event.detail.year;
  };
  
  const handlePetalHover = (event: CustomEvent) => {
    const { event: mouseEvent, entry, color } = event.detail;
    hoveredPetalData = entry;
    
    tooltipContent = {
      sponsor: entry.Sponsor,
      drugName: entry["Drug Name"],
      therapeuticArea: entry.name,
      id: entry.id
    };
    tooltipBorderColor = color;
    tooltipX = mouseEvent.pageX;
    tooltipY = mouseEvent.pageY;
    tooltipVisible = true;
  };

  const handlePetalLeave = () => {
    hoveredPetalData = null;
    tooltipVisible = false;
  };

  const handleClusterElementClick = (event: CustomEvent) => {
    const { entry, color } = event.detail;
    selectedData = entry;
    selectedColor = color;
    isDrawerOpen = true;
  };

  const closeDrawer = () => {
    isDrawerOpen = false;
    selectedData = null;
  };

  onMount(async () => {
    try {
      processedRpdPrvData = processRpdPrvData(rpdPrvDataRaw as RPDData[]);
      processedConstellationData = processConstellationData(constellationDataRaw as ConstellationEntry[]);
      
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
  <RPDNavDrawer />
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
        {isDrawerOpen}
        {selectedData}
        on:yearChange={handleYearChange}
        on:petalHover={handlePetalHover}
        on:petalLeave={handlePetalLeave}
        on:clusterElementClick={handleClusterElementClick}
      />
    {/if}
  </div>
  
  {#if isDrawerOpen && selectedData}
    <RPDDrawer
      {isDrawerOpen}
      onClose={closeDrawer}
      data={selectedData}
      color={selectedColor}
      constellationData={processedConstellationData}
    />
  {/if}

  <Tooltip
    x={tooltipX}
    y={tooltipY}
    visible={tooltipVisible}
    content={tooltipContent}
    borderColor={tooltipBorderColor}
  />
</div>

<style>
.page-container {
  position: relative;
  display: grid;
  grid-template-columns: 25vw 75vw;
  height: 100vh;
  overflow: hidden;
}

.timeline-container {
  padding-top: 5vh;
  padding-bottom: 5vh;
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