<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let selectedDisease: string;
    export let data: {
        diseases: Array<{
            id: string;
            name: string;
            category: string;
            sentiments: {
                entirelyPositive: number;
                somewhatPositive: number;
                neutral: number;
                somewhatNegative: number;
                entirelyNegative: number;
            };
        }>;
    };

    let distributionContainer: HTMLDivElement;
    
    $: disease = data.diseases.find(d => d.id === selectedDisease);
    $: categoryData = data.diseases.filter(d => d.category === disease?.category);
    
    $: diseaseDistribution = disease ? calculateDistribution(disease.sentiments) : [];
    $: categoryDistribution = disease ? calculateCategoryAverage(categoryData) : [];
    $: comparisonText = disease ? generateComparisonText(diseaseDistribution, categoryDistribution) : '';

    function calculateDistribution(sentiments: any) {
        const total = Object.values(sentiments).reduce((a: any, b: any) => a + b, 0);
        return [
            sentiments.entirelyNegative / total,
            sentiments.somewhatNegative / total,
            sentiments.neutral / total,
            sentiments.somewhatPositive / total,
            sentiments.entirelyPositive / total
        ];
    }

    function calculateCategoryAverage(diseases: any[]) {
        const categoryTotals = diseases.reduce((acc, disease) => {
            Object.entries(disease.sentiments).forEach(([key, value]) => {
                acc[key] = (acc[key] || 0) + value;
            });
            return acc;
        }, {});

        return calculateDistribution(categoryTotals);
    }

    function generateComparisonText(diseaseDistribution: number[], categoryDistribution: number[]) {
        if (!disease) return '';

        // Calculate weighted average for comparison (more weight to extreme sentiments)
        const weights = [-2, -1, 0, 1, 2];
        const diseaseScore = diseaseDistribution.reduce((acc, val, idx) => acc + val * weights[idx], 0);
        const categoryScore = categoryDistribution.reduce((acc, val, idx) => acc + val * weights[idx], 0);

        const difference = ((diseaseScore - categoryScore) * 100).toFixed(1);
        const direction = diseaseScore > categoryScore ? 'more positive' : 'more negative';
        
        return `The ${disease.name} community skews ${Math.abs(Number(difference))}% ${direction} than the ${disease.category} average.`;
    }

    onMount(() => {
        const margin = { top: 20, right: 20, bottom: 30, left: 20 };
        const width = distributionContainer.clientWidth - margin.left - margin.right;
        const height = 100 - margin.top - margin.bottom;

        const svg = d3.select(distributionContainer)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        function updateChart() {
            svg.selectAll('*').remove();

            const x = d3.scaleLinear()
                .domain([0, diseaseDistribution.length - 1])
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, Math.max(
                    ...diseaseDistribution,
                    ...categoryDistribution
                )])
                .range([height, 0]);

            // Create area generators
            const area = d3.area()
                .x((d, i) => x(i))
                .y0(height)
                .y1(d => y(d))
                .curve(d3.curveBasis);

            // Add category distribution area
            svg.append('path')
                .datum(categoryDistribution)
                .attr('fill', 'rgba(102, 100, 187, 0.3)')
                .attr('stroke', 'rgba(100, 100, 100, 0.9)')
                .attr('stroke-width', 1)
                .attr('d', area);

            // Add disease distribution area
            svg.append('path')
                .datum(diseaseDistribution)
                .attr('fill', 'rgba(255, 81, 81, 0.2)')
                .attr('stroke', '#ff5151')
                .attr('stroke-width', 1)
                .attr('d', area);

            // Add labels
            const labels = ['Very Negative', '', 'Neutral', '', 'Very Positive'];
            svg.selectAll('.label')
                .data(labels.filter(l => l !== ''))
                .enter()
                .append('text')
                .attr('class', 'label')
                .attr('x', (d, i) => x(i * 2))
                .attr('y', height + 20)
                .attr('text-anchor', (d, i) => i === 0 ? 'start' : i === 2 ? 'end' : 'middle')
                .style('font-size', '10px')
                .style('fill', '#666')
                .text(d => d);
        }

        updateChart();

        // Update when selectedDisease changes
        return () => {
            if (distributionContainer) {
                distributionContainer.innerHTML = '';
            }
        };
    });
</script>

<div class="w-full space-y-4 p-4 pb-8 rounded-sm bg-gray-50 dark:bg-neutral-800">
    <div class="flex items-center justify-between">
        <div class="space-y-1">
            {#if disease}
                <div class="text-sm font-base">{disease.name} Sentiment Distribution</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Compared to {disease.category}</div>
            {/if}
        </div>
    </div>
    
    <div bind:this={distributionContainer} class="w-full h-[100px]"></div>
    
    {#if comparisonText}
        <p class="text-xs text-gray-600 dark:text-gray-300">{comparisonText}</p>
    {/if}

    <div class="flex items-center gap-4 text-xs">
        <div class="flex items-center gap-2 mt-6">
            
            <div class="w-2 h-2 rounded-sm bg-[#ff5151]/20 border border-[#ff5151]"></div>
            <span class="text-[.625rem] text-gray-600 dark:text-gray-300">Disease Distribution</span>
        </div>
        <div class="flex items-center gap-2 mt-6">
            <div class="w-2 h-2 rounded-sm bg-gray-400/10 border border-blue-400/50"></div>
            <span class="text-[.625rem] text-gray-600 dark:text-gray-300">Category Average</span>
        </div>
    </div>
</div>

<style>
    .mt-6 {
        margin-top: 1.5rem;
    }
</style>