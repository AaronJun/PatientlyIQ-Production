<script lang="ts">
  import { onMount } from 'svelte';
  import { RadialTimeline, YearlySummary } from '$lib/componentStores';
  import MobileWarning from '$lib/RPDComponents/MobileWarning.svelte';
  import RPDPageSummary from '$lib/RPDComponents/RPDPageSummary.svelte';
  import TARadialTimeline from '$lib/RPDComponents/TARadialTimeline.svelte';
  import RPDDrawer from '$lib/RPDComponents/RPDDrawer.svelte';
  import TextDrawer from '$lib/RPDComponents/TextContentDrawer.svelte';
  import RPDHeader from '$lib/RPDComponents/RPDHeader.svelte';
  import SaleBenchmarks from '$lib/RPDComponents/SaleBenchmarks.svelte';

  import TAPageSummary from '$lib/RPDComponents/TASummary.svelte';
  import { RpdProgramInfoMd } from '$lib/content/RPDprogramInfo';
  import rpdPrvDataRaw from '../data/RPDPRVOverviewData.json';
  import constellationDataRaw from '../data/RPDConstellationData.json';

  import {
    Calendar, 
    UserSpeaker,
    Purchase,
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
    Month: string;x
    Date: string;
    Purchaser?: string;
  }

  let activeTab = 'By Year';
  let currentYear = "2012";   
  let hoveredPetalData: ConstellationEntry | null = null;
  
  
  let isDrawerOpen = false;
  let selectedAreaData = null;
  let currentView = null;

  let isProgramInfoDrawerOpen = false;
  let selectedData: ConstellationEntry | null = null;
  let selectedColor: string = "";
  let processedRpdPrvData: RPDData[] = [];
  let processedConstellationData: ConstellationEntry[] = [];
  let currentArea: string | null = null;
  let taSummaryText: string = '';

  let isMobileDevice = false;
  const MOBILE_BREAKPOINT = 520;

  const siteUrl = 'https://patientlyiq.com';
const pageTitle = "The FDA's Rare Disease Research Garden is Blooming";
const pageDescription = "The FDA's Priority Review Voucher Program has planted the seeds for 56 new rare disease treatments, with 42 first-ever therapies blooming where none existed before. 2024 has been the most fruitful year yet -- learn more and join us in asking that this garden is kept flourishing.";
const pageImage = `${siteUrl}/rpd-program-preview.png`; // Make image URL absolute
const pageUrl = `${siteUrl}/rpd`; // Make page URL absolute

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
    "Gastroenterology": "#a6cee3",
    "Neurology": "#1f78b4",
    "Ophthalmology": "#6C6C6C",
    "Immunology": "#33a02c",
    "Metabolic": "#fb9a99",
    "Dermatology": "#fdbf6f",
    "Hematology": "#e31a1c",
    "Orthopedics": "#ff7f00",
    "Pulmonology": "#cab2d6",
    "Nephrology": "#6a3d9a",
    "Oncology": "#ffff99",
    "Endocrinology": "#b15928",
    "Hepatology": "#8dd3c7",
  };
    return colorMap[ta] || "#000000";
  }

  function setActiveTab(tab: string) {
    activeTab = tab;
  }

  function handleAreaSummary(event: CustomEvent<{ summaryText: string }>) {
    // Replace numbers with highlighted span
    const text = event.detail.summaryText.replace(
      /\b(\d+(?:,\d{3})*(?:\.\d+)?)\b/g, 
      '<span class="highlight">$1</span>'
    );
    taSummaryText = text;
  }

  function handleAreaHover(event: CustomEvent<{ area: string }>) {
    currentArea = event.detail.area;
  }

  function handleAreaLeave() {
  currentArea = null;
    taSummaryText = '';
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
    hoveredPetalData = entry;
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

  function handleProgramInfoClick() {
  console.log('handleProgramInfoClick called');
  isProgramInfoDrawerOpen = true;
}

  function closeProgramInfoDrawer() {
    isProgramInfoDrawerOpen = false;
  }


  function checkMobile() {
    isMobileDevice = window.innerWidth <= MOBILE_BREAKPOINT;
  }

  onMount(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  });

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

<svelte:head>
  <!-- Basic Meta Tags -->
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={pageUrl} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:image" content={pageImage} />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={pageUrl} />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={pageDescription} />
  <meta name="twitter:image" content={pageImage} />

  <!-- Additional SEO -->
  <meta name="keywords" content="FDA, Rare Disease, Priority Review Voucher, RPD, Pediatric Disease, Healthcare Policy" />
  <link rel="canonical" href={pageUrl} />
</svelte:head>

{#if isMobileDevice}
  <MobileWarning />
{/if}

<div class="light">
  <RPDHeader on:readMoreClick={handleProgramInfoClick} />
  <div class="page-container content-start">
    <div class="main-content min-h-full dark:bg-white">
      <div class="tabs min-w-full">
        <button
          class="tab-button max-w-[300px] md:max-w-full sm:max-w-full justify-start sm:justify-start {activeTab === 'By Year' ? 'active' : ''}"
          on:click={() => setActiveTab('By Year')}
        >
          <div class="flex gap-4 content-start justify-start">
            By Year <Calendar />
          </div>
        </button>
        
        <button
          class="tab-button max-w-[300px] md:max-w-full sm:max-w-full {activeTab === 'By Therapeutic Area' ? 'active' : ''}"
          on:click={() => setActiveTab('By Therapeutic Area')}
        >
          <div class="flex gap-4 content-start justify-center">
            By Therapeutic Area <WatsonHealthDna />
          </div>
        </button>

<!--         <button
        class="tab-button justify-start sm:justify-start {activeTab === 'stories' ? 'active' : ''}"
        on:click={() => setActiveTab('stories')}>
        <div class="flex gap-4 content-start justify-start">
          Stories <UserSpeaker/>
        </div>
        </button>
 -->
        <button
          class="tab-button max-w-[300px] md:max-w-full sm:max-w-full {activeTab === 'transactions' ? 'active' : ''}"
          on:click={() => setActiveTab('transactions')}
        >
          <div class="flex gap-4">
            By Transaction <Purchase />
          </div>
        </button>
      </div>

      <div class="tab-content">
        {#if activeTab === 'By Year'}
          <div class="flowers-view content-start">
            <div class="w-1/6 flex flex-col md:w-1/6 sm:w-full lg:pr-0 lg:pb-7 md:pb-0 sm:pb-0 lg:border-r-0">
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

            <div class="w-5/6 max-w-[1520px] md:w-full sm:w-full timeline-container content-start align-top">
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

        {:else if activeTab === 'By Therapeutic Area'}
          <div class="flowers-view content-start">
            <div class="w-1/6 flex flex-col lg:pr-0 lg:pb-7 lg:border-r-0">
              <TAPageSummary 
                rpdPrvData={processedRpdPrvData}
                constellationData={processedConstellationData} 
                {currentYear} 
              />
            </div>

            <div class="w-5/6 max-w-[1520px] sm:w-full min-[400px]:w-full md:w-full timeline-container content-start align-top">
              <TARadialTimeline
                constellationData={processedConstellationData}
                selectedArea={hoveredPetalData?.name || null}
                on:petalHover={handlePetalHover}
                on:petalLeave={handlePetalLeave}
                on:areaSummary={handleAreaSummary}
                on:areaHover={handleAreaHover}
                on:areaLeave={handleAreaLeave}
                on:clusterElementClick={handleClusterElementClick}
              />
            </div>
          </div>


        {:else if activeTab === 'stories'}
        <div class="flowers-view content-start">
          <div class="w-1/6 md:w-5/6 sm:w-5/6 flex flex-col lg:pr-0 lg:pb-7 lg:border-r-0">
            <h2 class="text-xs mb-8 mt-8 font-bold col-span-1">Stories</h2>
          </div>

          <div class="flex w-5/6 lg:w-5/6 sm:w-full min-[400px]:w-full timeline-container content-start">

          </div>
        </div>

        {:else if activeTab === 'transactions'}
          <div class="flowers-view">
            <div class="w-1/6 md:w-1/6 sm:w-5/6 flex flex-col pt-16 pr-4 lg:pr-0 lg:pb-7 lg:border-r-0">
              <h2 class="text-xs mb-8 font-bold col-span-1">Inside the PRV Transactions Ecosystem</h2>
              <p class="text-base md:text-sm sm:text-xs w-full pr-2 max-w-4xl col-span-2 text-gray-900">
                Priority Review Vouchers (PRVs) accelerate FDA review by 4 months, reducing the timeline from 10 months to 6. These transferable vouchers incentivize rare disease research - smaller companies can sell them to fund continued research, while larger companies use them to expedite their own programs.
              </p>
              <p class="text-base w-full pr-2 max-w-4xl col-span-2 text-gray-900 mt-4">
                With a median price of $110M and over 25 transactions completed, the PRV market has become a significant force in drug development. Below, we present a comprehensive dataset of PRV transactions through 2024. We encourage you to explore the trends and patterns within this unique marketplace.
              </p>
            </div>
            <div class="w-5/6 max-w-[1520px] sm:w-full min-[400px]:w-full md:w-full timeline-container content-start align-top min-h-full">
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

    {#if isProgramInfoDrawerOpen}
      <TextDrawer 
        isOpen={isProgramInfoDrawerOpen}
        onClose={closeProgramInfoDrawer}
        content={RpdProgramInfoMd}
        contentType="ts"
        color="#C9623F"
      />
    {/if}

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

  .main-content {
    display: block;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .tabs {
    display: grid;
    font-size: 0.725rem;
    grid-template-columns: repeat(4,.35fr);
    border-bottom: .5px dotted #6b7280;
    padding-top: 2.25rem;
    gap: .525rem;
    background-color: #fff;
  }

  .tab-button {
    display: flex;
    align-items: center;
    text-align: left;
    gap: 0.25rem;
    text-transform: uppercase;
    min-width: 22.5vw;  
    letter-spacing: .325px;
    padding: 0.5rem 1rem 0.5rem 0.25rem;
    margin-right: 1.25rem;
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
    padding: 0.5rem .25rem 0.5rem 0.25rem;
    color: #C9623F;
    border-bottom: 2px solid #C9623F;
  }

  .tab-content {
    min-width: 100%;
    align-items: top;
  }

  .flowers-view {
    display: flex;
    flex-direction: row;
    min-width: 95vw;
    min-height: 100vh;
    margin: 1rem;
  }

  .timeline-container {
    padding: 1rem 2rem 2rem 1.25rem;
    height: 95vh;
    width: 75vw;
    overflow: auto;
  }

.timeline-container {
    padding: 1rem 2rem 2rem 1.25rem;
    height: 100vh;
    width: 75vw;
    overflow: auto;
  }

  .info-panel-nav {
    height: 100%;
    padding: 0 2.25rem 0 0rem;
    position: relative;
    align-content: space-between;
    overflow-y: hidden;
  }

  h2 {
    font-weight: 800;
    text-transform: uppercase;
    font-size: .725rem;
    color: #C9623F;
    margin-bottom: 1rem;
    letter-spacing: 0.025em;
  }

  h3 {
    font-weight: 800;
    text-transform: uppercase;
    font-size: .65rem;
    color: #C9623F;
    margin-bottom: .62rem;
  }

  .text-base {
    font-size: 0.925rem;
    line-height: 1.5;
    margin-bottom: 0.5rem;
  }

  .flex {
    display: flex;
  }

  .gap-4 {
    gap: 2rem;
  }

  .content-start {
    align-content: flex-start;
  }

  .justify-center {
    justify-content: center;
  }

  .col-span-1 {
    grid-column: span 1 / span 1;
  }

  .col-span-2 {
    grid-column: span 2 / span 2;
  }

  .border-r-2 {
    border-right-width: 2px;
  }

  .border-orange-600 {
    border-color: #C9623F;
  }

  .text-orange-600 {
    color: #C9623F;
  }

  .text-gray-900 {
    color: #1a202c;
  }

  .mb-8 {
    margin-bottom: 2rem;
  }

  .mt-4 {
    margin-top: 1rem;
  }

  .p-8 {
    padding: 2rem;
  }

  .pl-0 {
    padding-left: 0;
  }

  .pb-10 {
    padding-bottom: 2.5rem;
  }

  .pr-16 {
    padding-right: 4rem;
  }

  .pr-2 {
    padding-right: 0.5rem;
  }

  .w-full {
    width: 100%;
  }

  .max-w-4xl {
    max-width: 56rem;
  }

  .light {
    background-color: #fff;
    color: #1a202c;
  }

  .dark\:bg-white {
    background-color: #fff;
  }

  @media (max-width: 1280px) {
    .page-container {
      padding: 1.5rem;
    }

    .tabs {
      grid-template-columns: repeat(3, .25fr);
    }

    .timeline-container,
    .therapeutic-area-container {
      width: 78vw;
      height: 90vh;
    }
  }

  @media (max-width: 1024px) {
    .flowers-view {
      flex-direction: column;
    }

    .info-panel {
      width: 20vw;
      padding-bottom: 1.725rem;
      margin-bottom: 1.25rem;
    }

    .timeline-container,
    .therapeutic-area-container {
      width: 80vw;
      height: 90vh;
    }
  }

</style>