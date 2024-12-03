<script lang="ts">
  import { onMount } from 'svelte';
  import { RadialTimeline, YearlySummary } from '$lib/componentStores';
  import RPDPageSummary from '$lib/RPDComponents/RPDPageSummary.svelte';
  import RPDDrawer from '$lib/RPDComponents/RPDDrawer.svelte';
  import Tooltip from '$lib/RPDComponents/RPDTooltip.svelte';
  import rpdPrvDataRaw from '../data/RPDPRVOverviewData.json';
  import RPDNavDrawer from '$lib/RPDComponents/RPDNavGuide.svelte';
  import RPDHeader from '$lib/RPDComponents/RPDHeader.svelte';
  import constellationDataRaw from '../data/RPDConstellationData.json';
  import SaleBenchmarks from '$lib/RPDComponents/SaleBenchmarks.svelte';
  import DrugSunburst from '$lib/RPDComponents/DrugSunburst.svelte';

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

  let activeTab = 'By Year';
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


function getColorForTherapeuticArea(ta: string): string {
  const colorMap = {
    "Gastroenterology": "#4CAE3B",
    "Neurology": "#4D4DFF",
    "Ophthalmology": "#E79028",
    "Immunology": "#EA38A5",
    "Metabolic": "#133B11",
    "Dermatology": "#559368",
    "Hematology": "#CF3630",
    "Orthopedics": "#441780",
    "Respiratory": "#CBC09F",
    "Nephrology": "#ACA3DB",
    "Oncology": "#FF84DE",
    "Hepatology": "#FF00D4",
  };
  return colorMap[ta] || "#000000";
}

  function setActiveTab(tab: string) {
    activeTab = tab;
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

<RPDHeader />
<div class="page-container">
  <div class="main-content">
    <div class="tabs">
      <button
        class="tab-button {activeTab === 'By Year' ? 'active' : ''}"
        on:click={() => setActiveTab('By Year')}
      >
        <span>By Year</span>
      </button>
      <button
        class="tab-button {activeTab === 'transactions' ? 'active' : ''}"
        on:click={() => setActiveTab('transactions')}
      >
        <span>By Transactions</span>
      </button>
    </div>

    <div class="tab-content">
      {#if activeTab === 'By Year'}
        <div class="flowers-view">
          <div class="info-panel">
            <RPDPageSummary 
              rpdPrvData={processedRpdPrvData}
              constellationData={processedConstellationData} 
              {currentYear} 
            />
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
            <div class="info-panel-nav">
            <RPDNavDrawer />
            </div>  
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
        </div>
      {:else if activeTab === 'transactions'}
        <div class="transactions-view">
          <SaleBenchmarks constellationData={processedConstellationData} 
          onDrugClick={(drugData) => {
            selectedData = drugData;
            selectedColor = getColorForTherapeuticArea(drugData.name);
            isDrawerOpen = true;
          }}
          />
        </div>
      {:else}
        <div class="therapeutic-area-view">
          <DrugSunburst constellationData={processedConstellationData} />
        </div>
      {/if}
    </div>
  </div>

  {#if isDrawerOpen && selectedData}
    <RPDDrawer
      isOpen={isDrawerOpen}
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
    display: block;
    height: 100vh;
    width: 100vw;
    align-content: space-around;
    overflow: hidden;
  }

  .main-content {
    display: block;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .tabs {
    display: flex;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #e5e7eb;
    background-color: #fff;
    gap: 1rem;
    min-width: 100%;
  }

  .tab-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    color: #6b7280;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .tab-button:hover {
    color: #C9623F;
  }

  .tab-button.active {
    color: #C9623F;
    font-weight: 800;
  }

  .tab-content {
    overflow: hidden;
    min-width: 100%;
  }

  .flowers-view {
    display: flex;
    flex-direction: row;
    min-width: 100vw;
    height: 100%;
  }

  .transactions-view, .therapeutic-area-view {
    padding: 2rem;
    height: 100%;
    width: 100%;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .timeline-container {
    padding: 2rem 2rem 2rem 1.25rem;
    height: 90vh;
    width: 75vw;
    overflow: hidden;
  }

  .info-panel {
    background-color: #f9f9f9e7;
    border-right: 1px dotted #e5e7eb;
    min-height: 100%;
    width: 25%;
    padding: 1.25rem 2.25rem 0 1rem;
    overflow-y: hidden;
  }

  .info-panel-nav {
    height: 100%;
    width: 22.5vw;
    padding: 0 2.25rem 0 1rem;
    position: absolute;
    bottom: -72.5vh;
    overflow-y: hidden;
  }

  h3 {
    font-weight: 800;
    text-transform: uppercase;
    font-size: .65rem;
    color: #C9623F;
    margin-bottom: .62rem;
  }
</style>