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
	$: allData = countryDataJson || [];

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

<div class="flex flex-col h-full">
	<div class="flex-1 pt-16 place-content-center">
	  <div class="heading-container">
		<h1 class="heading text-2xl align-middle justify-center w-full ml-4 mr-12 mt-8 font-semibold text-slate-800">
		  Feasibility Mapper<span class="tag text-[9.25px] w-fit h-fit ml-2">Beta</span>
		</h1>	
	  </div>	
	  <div class="header-filter-container w-4/5">	
	  {#if allData.length > 0}
		<HeaderFilter 
		  bind:selectedMetric={$selectedMetricStore}
		  {metrics}
		  on:change={handleMetricChange}    
		/>
	  {/if}
	  </div>
	  
	  <div class="flex flex-row min-h-[85vh] w-full">
		<div class="outline-wrapper flex-1 bg-[#E9EEFB]/30 w-4/5 px-8 pt-24 min-h-full">
		  <BubbleMapper
			width={1200}
			height={950}
			{rankedData}
			{colorGradient}
			onCountryClick={(country) => handleCountryClick(country)}
			onCountryHover={(country) => handleCountryHover(country)}
		  />
		</div>
		
		<div class="outline-wrapper w-1/5">
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
		</div>
	  </div>
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
    }

		.map-wrapper {
		display: flex;
		flex-direction: row;
		width: 100%;
		height: 100%;
		}

		.outline-wrapper {
		padding: 0;
		border: .25px solid #B4C7FF;
		}

    :global(.mapContainer) {
        width: 100%;
        height: 100%;
    }

	:global(.heading-container) {
		backdrop-filter: blur(10px);
		display: flex;
		flex-direction: row;
		min-height: 10vh;
		border: 1px solid #e0e0e0;
		border-bottom: 0.25px solid #e0e0e0;
	}

	:global(.outline-wrapper) {
		padding: 0;
		border: .25px solid #AA9AFA;
		border-bottom: 0px;
		z-index: 10;
	}

	.tag {
		border: 1px solid #ff4a4a;
		color: #ff4a4a;
		padding: 0.25rem 0.5rem;
		border-radius: 150px;
	}

</style>