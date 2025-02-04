<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { writable } from 'svelte/store';
	import BubbleMapper from '$lib/AtlasComponents/BubbleMapper.svelte';
	import InfoDrawer from '$lib/LayoutComponents/InfoDrawer.svelte';
	import MapSidebar from '$lib/AtlasComponents/MapSidebar.svelte';
	import CalcDrawer from '$lib/AtlasComponents/CalcDrawer.svelte';
	import { interpolateRgb, interpolateRgbBasis } from 'd3-interpolate';
	import countryDataJson from '$lib/AtlasComponents/compScore.json';
	import HeaderFilter from '$lib/AtlasComponents/HeaderFilter.svelte';
	import { min } from 'd3';

	interface CountryData {
		name: string;
		id: string;
		geoJsonId?: string;
		compositeScore: number;
		studyStartUpDays: number;
		studiesWithCountryExperience: number;
		competingStudies: number;
		experiencedSites: number;
		totalIPFCases: number;
		ipfPatientRegistry: string;
		worldwideIPFExperience: number;
		medidataAggregateRecruitmentRate: number;
	}

	let isDrawerOpen = false;
	let selectedData: CountryData | null = null;
	let hoveredData: CountryData | null = null;
	let allData: CountryData[] = countryDataJson;
	let circleColor: string = '#FF7F00';
	let mapElement: HTMLDivElement;
	let bubbleMapperComponent: BubbleMapper;
	let isCalculatorOpen = false;

	// Create a store for the selected metric
	const selectedMetricStore = writable('compositeScore');
	let selectedMetric: string;

	const metrics = [
		{ value: 'compositeScore', label: 'Total Composite Score', higherIsBetter: true },
		{ value: 'studyStartUpDays', label: 'Study Start-Up Days', higherIsBetter: false },
		{ value: 'studiesWithCountryExperience', label: 'In-Country Experience', higherIsBetter: false },
		{ value: 'competingStudies', label: 'Total Competing Studies', higherIsBetter: false },
		{ value: 'experiencedSites', label: 'Total Experienced Sites', higherIsBetter: true },
		{ value: 'totalIPFCases', label: 'Total Incidence', higherIsBetter: true },
		{ value: 'worldwideIPFExperience', label: 'Disease Experience', higherIsBetter: true },
		{ value: 'medidataAggregateRecruitmentRate', label: 'Historic Recruitment Rate', higherIsBetter: true }
	];

	const startColor = '#005D5D'; // Red (for worse values)
	const midColor = '#F5BE6B';   // Orange (for neutral values)
	const endColor = '#C34244';   // Green (for better values)

	$: colorGradient = generateColorGradient(allData.length);
	$: rankedData = getRankedData(allData, $selectedMetricStore);
	$: selectedMetricInfo = metrics.find(m => m.value === $selectedMetricStore);

	function generateColorGradient(count: number): string[] {
    const interpolator = interpolateRgbBasis([startColor, midColor, endColor]);
    return Array.from({ length: count }, (_, i) => {
        const t = i / (count - 1);
        return interpolator(t);
    });
}

	
function getRankedData(data: CountryData[], metric: string): {[key: string]: number} {
    if (!data.length) return {};

    const metricInfo = metrics.find(m => m.value === metric);
    if (!metricInfo) return {};

    const higherIsBetter = metricInfo.higherIsBetter;

    const metricData = data.map(d => ({ id: d.id, value: d[metric] as number }));
    const sortedData = metricData.sort((a, b) => 
        higherIsBetter ? b.value - a.value : a.value - b.value
    );
    
    const rankedData: {[key: string]: number} = {};
    sortedData.forEach((item, index) => {
        rankedData[item.id] = index; // Assign rank directly (0 is best)
    });

    return rankedData;
}


function handleCalculatorOpen() {
    isCalculatorOpen = true;
  }
  
  function handleCalculatorClose() {
    isCalculatorOpen = false;
  }

	function handleCountryClick(data: CountryData) {
		selectedData = data;
		circleColor = colorGradient[rankedData[data.id]] || '#b8b8b8';
		console.log("Set circleColor to:", circleColor);
		isDrawerOpen = true;
	}

	function handleCountryHover(data: CountryData | null) {
		hoveredData = data;
	}

	function closeDrawer() {
		isDrawerOpen = false;
		if (bubbleMapperComponent) {
			bubbleMapperComponent.resetZoom();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isDrawerOpen) {
			closeDrawer();
		}
	}

	onMount(() => {
		if (browser) {
			window.addEventListener('keydown', handleKeydown);
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('keydown', handleKeydown);
		}
	});

	function handleDataLoaded(event: CustomEvent<CountryData[]>) {
		console.log("Data loaded:", allData.length, "countries");
		console.log("Color gradient:", colorGradient);
		console.log("Ranked data:", rankedData);
	}

	function handleMetricChange(event: CustomEvent<{ selectedMetric: string }>) {
		selectedMetricStore.set(event.detail.selectedMetric);
		console.log("Selected metric changed to:", $selectedMetricStore);
	}

	function getColorForRank(rank: number): string {
		return colorGradient[rank] || '#b8b8b8';
	}
</script>


<div class="flex flex-col h-screen">
    <!-- Map Container -->
    <div class="flex-1 pt-16"> <!-- Add padding-top to account for header height -->
        <BubbleMapper
            bind:this={bubbleMapperComponent}
            countryData={allData}
            selectedMetric={$selectedMetricStore}
            {rankedData}
            {colorGradient}
            higherIsBetter={selectedMetricInfo?.higherIsBetter}
            onCountryClick={handleCountryClick}
            onCountryHover={handleCountryHover}
            on:dataLoaded={handleDataLoaded}
        />
    </div>

    <!-- Bottom Sidebar -->
	
    <div class="fixed bottom-0 w-full  border-t border-gray-200">
		<div class="header-filter-container">
          
        </div>
		{#if allData.length > 0}
		<HeaderFilter 
		bind:selectedMetric={$selectedMetricStore}
		{metrics}
		on:change={handleMetricChange}    
	/>
	<MapSidebar 
	on:openCalculator={handleCalculatorOpen}
	on:countryHover={(event) => {
	  hoveredData = event.detail;
	  if (bubbleMapperComponent) {
		bubbleMapperComponent.highlightCountry(event.detail?.id);
	  }
	}}
	on:countryClick={(event) => {
	  selectedData = event.detail;
	  isDrawerOpen = true;
	  if (bubbleMapperComponent) {
		bubbleMapperComponent.zoomToCountry(event.detail.id);
	  }
	}}
	{hoveredData}
	{allData}
	selectedMetric={$selectedMetricStore}
	{rankedData}
	{colorGradient}
	{getColorForRank}
  />
			
        {/if}
    </div>

    <InfoDrawer 
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        data={selectedData}
        {circleColor}
        selectedMetric={$selectedMetricStore}
        rank={selectedData ? rankedData[selectedData.id] : null}
        totalCountries={allData.length}
        {allData}
    />

    <CalcDrawer
        isOpen={isCalculatorOpen}
        onClose={handleCalculatorClose}
        on:scoreUpdated={(event) => {
            allData = allData.map(country => 
                country.id === event.detail.countryId 
                    ? {...country, compositeScore: event.detail.newScore}
                    : country
            );
            rankedData = getRankedData(allData, $selectedMetricStore);
        }}
    />
</div>

<style>
    :global(body) {
        @apply overflow-hidden;
    }
    .page-container {
        width: 100%;
		padding-top: 2rem;
        top: 0;
        left: 0;
    }

    :global(body) {
        overflow: hidden;
        position: fixed;
        width: 100%;
        height: 100%;
    }

    .header-filter-container {
		position: relative;
		background-color: rgba(65, 150, 239, .2);
		backdrop-filter: blur(10px);
		z-index: 0;
        border-bottom: 0.25px solid #e0e0e0;
		z-index: 100;
    }

    .map-wrapper {
        top: 0;
        left: 0;
        width: 100%;
        z-index: 10;
    }

    .sidebar-wrapper {
        width: 100%;
		background-color: white;
        z-index: 20;
        pointer-events: auto;
    }

    :global(.mapContainer) {
        width: 100%;
        height: 100%;
    }
</style>