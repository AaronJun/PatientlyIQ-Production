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

    import {
      Calendar, 
      Purchase,
      Building,
      WatsonHealthDna,
    } from 'carbon-icons-svelte';
  
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
<div class="light">


<RPDHeader />
<div class="page-container content-start">
  <div class="main-content dark:bg-white">
    <div class="tabs">
      <button
        class="tab-button {activeTab === 'By Year' ? 'active' : ''}"
        on:click={() => setActiveTab('By Year')}
      >
      <div class="flex gap-8 content-start justify-center">By Year <Calendar /></div>
      </button>
      <button
        class="tab-button {activeTab === 'transactions' ? 'active' : ''}"
        on:click={() => setActiveTab('transactions')}
      >
        <div class="flex gap-8">By Transaction <Purchase /> </div>
      </button>
  <!--     <button
      class="tab-button {activeTab === 'By Sponsor' ? 'active' : ''}"
      on:click={() => setActiveTab('By Sponsor')}
    >
    <div class="flex gap-8 justify-center">By Sponsor<Building /></div>
    </button
    <button
    class="tab-button {activeTab === 'By Therapeutic Area' ? 'active' : ''}"
    on:click={() => setActiveTab('By Therapeutic Area')}

  <div class="flex gap-8 justify-center">By Therapeutic Area <WatsonHealthDna /></div>
  </button>   -->
  </div>
    <div class="tab-content">
      {#if activeTab === 'By Year'}
        <div class="flowers-view content-start">
          <div class="info-panel flex flex-col pr-16 col-span-1 border-r-2 border-orange-600">
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
          </div>

          <div class="timeline-container content-start">
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
      <div class="flowers-view">
        <div class="info-panel row col-span-2 align-center p-8 pl-0 pb-10 text-orange-600">
            <h2 class="text-xs mb-8 font-bold col-span-1">Inside the PRV Transactions Ecosystem</h2>
            <p class="text-base w-full pr-2 max-w-4xl col-span-2 text-gray-900">
              Priority Review Vouchers (PRVs) accelerate FDA review by 4 months, reducing the timeline from 10 months to 6. These transferable vouchers incentivize rare disease research - smaller companies can sell them to fund continued research, while larger companies use them to expedite their own programs.
            </p>
            <br><br>
            <p class="text-base w-full pr-2 max-w-4xl col-span-2 text-gray-900">
              With a median price of $110M and over 25 transactions completed, the PRV market has become a significant force in drug development. Below, we present a comprehensive dataset of PRV transactions through 2024. We encourage you to explore the trends and patterns within this unique marketplace.
            </p>
          </div>

          <SaleBenchmarks 
          constellationData={processedConstellationData} 
          onCompanySelect={(data, color) => {
            selectedData = data;
            selectedColor = color;
            isDrawerOpen = true;
          }}
          onDrugClick={(drugData) => {
            selectedData = drugData;
            selectedColor = getColorForTherapeuticArea(drugData.name);
            isDrawerOpen = true;
          }}
        />
        </div>
        <div class="border-b-slate-700 border-b-2"></div>
      {:else}
        <div class="therapeutic-area-view">
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
    x={tooltipX-290}
    y={tooltipY-220}
    visible={tooltipVisible}
    content={tooltipContent}
    borderColor={tooltipBorderColor}
  />
</div>
</div>  
<style>
  .page-container {
    position: relative;
    min-height: 100vh;
    width: 100vw;
    padding: 2.25rem;
    overflow: auto;
  }

  .header {
    background-color: #f6f0e4;
  }

  .main-content {
    display: block;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .tabs {
    display: grid;
    font-size: 0.8725rem;
    grid-template-columns: repeat(4, 1fr);
    border-bottom: .5px dotted #6b7280;
    padding-top: 2.25rem;
    gap: .525rem;
    background-color: #fff;
  }

  .tab-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-transform: uppercase;
    max-width: 22.5vw;  
    letter-spacing: .325px;
    padding: 0.5rem 1rem 0.5rem 2.25rem;
    font-size: 0.875rem;
    color: #6b7280;
    border-bottom: .5px solid #797979;
    transition: all 0.2s;
  }

  .tab-button:hover {
    color: #C9623F;
    border-bottom: 1px solid #C9623F;
    transition: ease-in 0.2s;    
  }

  .tab-button.active {
    background-color: #fff;
    font-weight: 800;
    padding: 0.5rem 1rem 0.5rem 2.25rem;
    color: #C9623F;
    border-bottom: 2px solid #C9623F;
  }

  .tab-content {
    overflow: hidden;
    min-width: 100%;
    align-items: top;
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
    min-width: 100%;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .timeline-container {
    padding: rem 2rem 2rem 1.25rem;
    height: 95vh;
    width: 75vw;

    overflow: hidden;
  }

  .info-panel {
    width: 22.25vw;
  }

  .info-panel-nav {
    height: 100%;
    padding: 0 2.25rem 0 0rem;
    position: relative;
    align-content: space-between;
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