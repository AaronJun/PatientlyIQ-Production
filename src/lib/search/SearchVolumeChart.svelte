<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let selectedDisease: string;
    export let data: any;

    let chartContainer: HTMLDivElement;
    
    $: diseaseData = data.searchTerms[selectedDisease]?.terms || [];
$: totalSearches = data.searchTerms[selectedDisease]?.totalSearches || 0;
$: {
    console.log('Volume Chart Data:', {
        selectedDisease,
        terms: diseaseData,
        total: totalSearches
    });
}


    // Take top 8 terms for visualization
    $: topTerms = diseaseData
        .sort((a: any, b: any) => b.percentage - a.percentage)
        .slice(0, 8);

    onMount(() => {
        createChart();
    });

    function createChart() {
        if (!chartContainer || !topTerms.length) return;

        const margin = { top: 20, right: 120, bottom: 40, left: 200 };
        const width = chartContainer.clientWidth - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        // Clear previous chart
        d3.select(chartContainer).selectAll('*').remove();

        const svg = d3.select(chartContainer)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const y = d3.scaleBand()
            .range([0, height])
            .padding(0.2)
            .domain(topTerms.map(d => d.term));

        const x = d3.scaleLinear()
            .range([0, width])
            .domain([0, Math.max(...topTerms.map(d => d.percentage))]);

        // Add bars
        const bars = svg.selectAll('.bar')
            .data(topTerms)
            .enter()
            .append('g');

        bars.append('rect')
            .attr('class', 'bar')
            .attr('y', d => y(d.term)!)
            .attr('height', y.bandwidth())
            .attr('x', 0)
            .attr('width', 0)
            .attr('fill', '#ff5151')
            .attr('opacity', 0.7)
            .transition()
            .duration(800)
            .attr('width', d => x(d.percentage));

        // Add percentage labels
        bars.append('text')
            .attr('class', 'value')
            .attr('x', d => x(d.percentage) + 5)
            .attr('y', d => y(d.term)! + y.bandwidth() / 2)
            .attr('dy', '.35em')
            .attr('fill', '#666')
            .text(d => `${d.percentage.toFixed(1)}%`);

        // Add term labels
        svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y).tickSize(0))
            .selectAll('text')
            .attr('class', 'text-sm text-gray-600')
            .style('font-size', '12px');

        // Remove y-axis line
        svg.select('.y-axis path').remove();
    }
</script>

<div class="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm">
    <div class="mb-4">
        <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">Top Search Terms</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Based on {totalSearches.toLocaleString()} total searches
        </p>
    </div>
    
    <div bind:this={chartContainer} class="w-full h-[300px]" />
</div>