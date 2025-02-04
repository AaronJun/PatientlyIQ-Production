<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import BellCurveComponent from '../AtlasComponents/BellCurveComponent.svelte';
	import CategoryDotPlot from '../AtlasComponents/CategoryDotPlot.svelte';
	import CountryMetricsDotPlot from '../AtlasComponents/CountryMetricsDotPlot.svelte';



	
	export let allData: CountryData[];
	export let selectedMetric: string;
	export let rankedData: {[key: string]: number};
	export let colorGradient: string[];
	export let hoveredData: CountryData | null;
	export let getColorForRank: (rank: number) => string;

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
		[key: string]: number | string | undefined;
	}

	$: sortedData = allData
		.sort((a, b) => {
			// Assuming lower values are better for ranking
			return rankedData[a.id] - rankedData[b.id];
		})
		.map((country, index) => ({
			...country,
			rank: index + 1
		}));

	$: totalCountries = sortedData.length;

	let legendContainer: HTMLDivElement;

	onMount(() => {
		createColorLegend();
	});

	function createColorLegend() {
		const width = 325;
		const height = 15;

		const svg = d3.select(legendContainer)
			.append('svg')
			.attr('width', width)
			.attr('height', height);

		const colorScale = d3.scaleLinear<string>()
			.domain([0, colorGradient.length - 1])
			.range([colorGradient[0], colorGradient[colorGradient.length - 1]])
			.interpolate(d3.interpolateRgb);

		const gradient = svg.append('defs')
			.append('linearGradient')
			.attr('id', 'color-gradient')
			.attr('x1', '0%')
			.attr('y1', '0%')
			.attr('x2', '100%')
			.attr('y2', '0%');

		gradient.selectAll('stop')
			.data(d3.range(colorGradient.length))
			.enter().append('stop')
			.attr('offset', (d, i) => `${(i / (colorGradient.length - 1)) * 100}%`)
			.attr('stop-color', d => colorScale(d));

		svg.append('rect')
			.attr('width', width)
			.attr('height', height)
			.style('fill', 'url(#color-gradient)');

		const axis = d3.axisBottom(d3.scaleLinear().domain([0, 100]).range([0, width]))
			.ticks(5)
			.tickFormat(d => `${d}%`);

		svg.append('g')
			.attr('transform', `translate(0, ${height})`)
			.call(axis);
	}

	function getInvertedColorForRank(rank: number): string {
		// Invert the rank to get the correct color
		return getColorForRank(totalCountries - rank + 1);
	}
</script>


<CategoryDotPlot
  {allData}
  {selectedMetric}
  {hoveredData}
/>
<CountryMetricsDotPlot
  {allData}
  selectedCountry={hoveredData}
  metrics={['compositeScore', 'studyStartUpDays', 'studiesWithCountryExperience', 'competingStudies', 'experiencedSites', 'totalIPFCases', 'worldwideIPFExperience', 'medidataAggregateRecruitmentRate']}
/>

<style>
	.data-table {
		max-height: calc(100vh - 300px); /* Adjusted to make room for the legend */
		overflow-y: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 1rem;
	}

	th, td {
		border: 1px solid rgba(221, 221, 221, 0.5);
		padding: 6px;
		text-align: left;
	}

	th {
		background-color: rgba(242, 242, 242, 0.8);
		position: sticky;
		top: 0;
		align-content: center;
		font-weight: 800;
		padding: .5rem 0 .5rem .5rem;
		font-size: .725rem;
	}

	.highlighted {
		background-color: rgba(230, 243, 255, 0.8);
	}

	.color-indicator {
		width: 10px;
		height: 10px;
		border: 0.5px solid rgba(230, 243, 255, 0.8);
	}

	.legend-container {
		margin-top: 1.25rem;
		margin-bottom: .5rem;
		padding: 10px;
	}

	.legend-title {
		font-size: 12px;
		width: 100%;    
		border-top: 1px solid rgba(221, 221, 221);
		margin-bottom: 5px;
		padding-top: 1.25rem;
	}
</style>