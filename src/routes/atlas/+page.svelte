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
	import { fade } from 'svelte/transition';

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
		[key: string]: string | number | undefined;
	}

	let isDrawerOpen = false;
	let selectedData: CountryData | null = null;
	let hoveredData: CountryData | null = null;
	let allData: CountryData[] = countryDataJson;
	let circleColor: string = '#FF7F00';
	let mapElement: HTMLDivElement;
	let bubbleMapperComponent: BubbleMapper;
	let isCalculatorOpen = false;
	let isSidebarVisible = true;

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

	// Track if the header is visible to apply transition
	let isHeaderVisible = false;

	onMount(() => {
		if (browser) {
			window.addEventListener('keydown', handleKeydown);
			// Set header visible after a brief delay for animation
			setTimeout(() => {
				isHeaderVisible = true;
			}, 100);
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

<div class="flex flex-col h-screen w-screen overflow-hidden">
	<!-- Fixed Header -->
	{#if isHeaderVisible}
	<div class="fixed top-0 left-0 right-0 z-50 bg-white shadow-md" transition:fade={{ duration: 300 }}>
		<div class="heading-container px-6 py-3">
			<div class="flex items-center justify-between mb-2">
				<div class="flex items-center">
					<div class="header-logo-accent mr-2"></div>
					<h1 class="heading text-xl font-mono tracking-normal uppercase font-semibold text-slate-700">
						Feasibility Atlas
						<span class="tag text-[10px] font-medium font-mono text-slate-400 tracking-wide uppercase bg-slate-100 rounded px-1.5 py-0.5 ml-2">Beta</span>
					</h1>
				</div>
				<div class="flex items-center space-x-4">
					<!-- You could add navigation or additional buttons here if needed -->
				</div>
			</div>
			
			<div class="header-filter-container relative">
				{#if allData.length > 0}
					<HeaderFilter 
						bind:selectedMetric={$selectedMetricStore}
						{metrics}
						on:change={handleMetricChange}    
					/>
				{/if}
			</div>
		</div>
	</div>
	{/if}

	<!-- Main Content -->
	<div class="flex-1 pt-[90px]">
		<div class="map-view-container">
			<!-- Map Wrapper -->
			<div class="map-container" class:sidebar-collapsed={!isSidebarVisible}>
				<BubbleMapper
					bind:this={bubbleMapperComponent}
					width={1200}
					height={650}
					{rankedData}
					{colorGradient}
					onCountryClick={handleCountryClick}
					onCountryHover={handleCountryHover}
					on:dataLoaded={handleDataLoaded}
				/>
			</div>
			
			<!-- Sidebar with Toggle Button -->
			<div class="sidebar-container" class:sidebar-hidden={!isSidebarVisible}>
				<div class="sidebar">
					<MapSidebar 
						on:openCalculator={handleCalculatorOpen}
						on:countryHover={(event) => {
							hoveredData = event.detail;
							if (bubbleMapperComponent && event.detail) {
								bubbleMapperComponent.highlightCountry(event.detail.id);
							}
						}}
						on:countryClick={(event) => {
							selectedData = event.detail;
							isDrawerOpen = true;
							if (bubbleMapperComponent && event.detail) {
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
				<button 
					class="sidebar-toggle" 
					on:click={() => isSidebarVisible = !isSidebarVisible} 
					title={isSidebarVisible ? "Hide sidebar" : "Show sidebar"}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						{#if isSidebarVisible}
							<polyline points="15 18 9 12 15 6"></polyline>
						{:else}
							<polyline points="9 18 15 12 9 6"></polyline>
						{/if}
					</svg>
				</button>
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
.map-view-container {
  position: relative;
  display: flex;
  width: 100%;
  height: calc(100vh - 90px);
  padding: 0 24px 24px;
  box-sizing: border-box;
  z-index: 1;
}

.map-container {
  flex: 1;
  position: relative;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(170, 154, 250, 0.2);
  background-color: transparent;
  margin-right: 320px;
  z-index: 1;
  transition: margin-right 0.3s ease;
}

.map-container.sidebar-collapsed {
  margin-right: 50px;
}

.sidebar-container {
  position: absolute;
  right: 24px;
  top: 0; /* Positioned within map-view-container which already has pt-[90px] from parent */
  height: 100%;
  z-index: 2;
  display: flex;
  transition: transform 0.3s ease;
}

.sidebar-container.sidebar-hidden {
  transform: translateX(calc(100% - 28px));
}

.sidebar-toggle {
  position: absolute;
  left: -28px;
  top: 50%;
  transform: translateY(-50%);
  height: 50px;
  width: 28px;
  background: white;
  border-radius: 4px 0 0 4px;
  border: 1px solid rgba(170, 154, 250, 0.3);
  border-right: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  box-shadow: -2px 4px 10px rgba(0, 0, 0, 0.05);
  z-index: 3;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  background: #f1f5f9;
  color: #334155;
}

.sidebar {
  width: 320px;
  height: 100%;
  background: white;
  border-radius: 8px;
  border: 1px solid rgba(170, 154, 250, 0.3);
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.heading-container {
  background-color: white;
  border-bottom: 0.25px solid #dadada;
  z-index: 10;
}

.header-filter-container {
  position: relative;
  z-index: 10;
  padding: 0;
  margin: 0 -0.5rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  height: 18px;
  vertical-align: middle;
}

.header-logo-accent {
  width: 4px;
  height: 24px;
  background: linear-gradient(to bottom, #C34244, #005D5D);
  border-radius: 2px;
}

/* Responsive layout adjustments */
@media (max-width: 1200px) {
  .map-view-container {
    flex-direction: column;
    height: auto;
    padding: 0 16px 16px;
  }
  
  .map-container {
    margin-right: 0;
    margin-bottom: 16px;
    height: 60vh;
  }
  
  .sidebar-container {
    position: relative;
    right: 0;
    width: 100%;
    height: auto;
    max-height: 35vh;
    transform: none;
  }
  
  .sidebar-container.sidebar-hidden {
    transform: translateY(calc(100% - 30px));
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    max-height: 35vh;
  }
  
  .sidebar-toggle {
    height: 30px;
    width: 60px;
    left: 50%;
    top: -30px;
    transform: translateX(-50%);
    border-radius: 4px 4px 0 0;
    border: 1px solid rgba(170, 154, 250, 0.3);
    border-bottom: none;
  }
}

@media (max-width: 640px) {
  .heading {
    font-size: 1.1rem;
  }
  
  .header-logo-accent {
    height: 20px;
  }
  
  .map-container {
    height: 50vh;
  }
}
</style>