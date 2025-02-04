<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { writable } from 'svelte/store';
	import { page } from '$app/stores';
	import Timeline from '$lib/PatientCardComponents/Timeline.svelte';
	import BubbleMapper from '$lib/AtlasComponents/BubbleMapper.svelte';
	import DropdownFilters from '../components/DropdownFilters.svelte';
	import { interpolateRgb } from 'd3-interpolate';
	import countryDataJson from '$lib/AtlasComponents/compScore.json';
	import HeaderFilter from '$lib/AtlasComponents/HeaderFilter.svelte';
	import CardView from '$lib/PatientCardComponents/CardView.svelte';	
	import ExportFeature from '$lib/LayoutComponents/ExportFeature.svelte';
	import CountryMetricsDotPlot from '$lib/AtlasComponents/CountryMetricsDotPlot.svelte';

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

	// New code for dynamic header
	$: pageName = $page.url.pathname.split('/').pop() || 'Home';
    $: pageTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1);



	// Create a store for the selected metric
	const selectedMetricStore = writable('compositeScore');
	let selectedMetric: string;

	const metrics = [
		{ value: 'compositeScore', label: 'Composite Scores', higherIsBetter: true },
		{ value: 'studyStartUpDays', label: 'Study Start-Up Days', higherIsBetter: false },
		{ value: 'studiesWithCountryExperience', label: 'Studies with Country Experience', higherIsBetter: false },
		{ value: 'competingStudies', label: 'Competing Studies', higherIsBetter: false },
		{ value: 'experiencedSites', label: 'Experienced Sites', higherIsBetter: true },
		{ value: 'totalIPFCases', label: 'Total IPF Cases', higherIsBetter: true },
		{ value: 'worldwideIPFExperience', label: 'Worldwide IPF Experience', higherIsBetter: true },
		{ value: 'medidataAggregateRecruitmentRate', label: 'Medidata Aggregate Recruitment Rate', higherIsBetter: true }
	];

	const startColor = '#FA4D56'; // Red (for worse values)
	const endColor = '#005D5D';   // Green (for better values)

	$: colorGradient = generateColorGradient(allData.length);
	$: rankedData = getRankedData(allData, $selectedMetricStore);
	$: selectedMetricInfo = metrics.find(m => m.value === $selectedMetricStore);

	function generateColorGradient(count: number): string[] {
		return Array.from({ length: count }, (_, i) => {
			const t = i / (count - 1);
			return interpolateRgb(startColor, endColor)(t);
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


<header class="dynamic-header">
    <span> <h1 class="pagehead">{pageTitle}</h1> </span>
</header>

<div class="container">
	<CardView />
</div>


<style>
	.pagehead {
		font-size: 2.25rem;
		font-weight: 400;
		margin: 0;
	}

	.container {
		display: flex;
		flex-direction: column;
		width: 85vw;
		height: 100vh;
	}

	.filters-container {
		padding: 10px;
	}
	.export-container {
		display: flex;
		justify-content: space-evenly;
		align-items: center;
	}
	.map-container {
		position: relative;
		flex-grow: 1;
		width: 100%;
	}
	
	.dynamic-header {
		display: flex;
		justify-content: left;
		align-items: left;
		border-bottom: 2px solid #f15515;
		padding: 0rem 0 1.25rem 0;
		margin-bottom: 4rem;
		color: #ce4f1c;
	}

	.sidebar-container {
		position: fixed;
		align-items: center;
		top: 30vh;
		left: 2.5vw;
		width: 350px;
		max-height: calc(100vh - 40px);
		background-color: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border-radius: 10px;
		padding: 0px;
		overflow-y: auto;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}
</style>