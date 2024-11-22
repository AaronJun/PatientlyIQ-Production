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

        const weights = [-2, -1, 0, 1, 2];
        const diseaseScore = diseaseDistribution.reduce((acc, val, idx) => acc + val * weights[idx], 0);
        const categoryScore = categoryDistribution.reduce((acc, val, idx) => acc + val * weights[idx], 0);

        const difference = ((diseaseScore - categoryScore) * 100).toFixed(1);
        const direction = diseaseScore > categoryScore ? 'more positive' : 'more negative';
        
        return `The ${disease.name} community skews ${Math.abs(Number(difference))}% ${direction} than the ${disease.category} average.`;
    }

    onMount(() => {
        const colors = ['#ff5151', '#ff7171', '#9E9E9E', '#4CAF50', '#2E7D33'];
        
        const updateDimensions = () => {
            const containerWidth = distributionContainer.clientWidth;
            let margin = { top: 20, right: 20, bottom: 30, left: 20 };
            let height = 100;
            
            if (containerWidth < 400) {
                height = 80;
                margin = { top: 15, right: 15, bottom: 25, left: 15 };
            } else if (containerWidth < 600) {
                height = 90;
                margin = { top: 18, right: 18, bottom: 28, left: 18 };
            }

            const width = containerWidth - margin.left - margin.right;
            height = height - margin.top - margin.bottom;

            return { width, height, margin };
        };

        const createChart = () => {
            const { width, height, margin } = updateDimensions();
            
            d3.select(distributionContainer)
                .selectAll('svg')
                .remove();

            const svg = d3.select(distributionContainer)
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleLinear()
                .domain([0, 1])
                .range([0, width]);

            // Draw disease distribution (filled)
            let xPos = 0;
            diseaseDistribution.forEach((value, i) => {
                svg.append('rect')
                    .attr('x', x(xPos))
                    .attr('y', 0)
                    .attr('width', x(value))
                    .attr('height', height * 0.3)
                    .attr('fill', colors[i]);
                xPos += value;
            });

            // Draw category distribution (outlined)
            xPos = 0;
            categoryDistribution.forEach((value, i) => {
                svg.append('rect')
                    .attr('x', x(xPos))
                    .attr('y', height * 0.5)
                    .attr('width', x(value))
                    .attr('height', height * 0.3)
                    .attr('fill', 'none')
                    .attr('stroke', colors[i])
                    .attr('stroke-width', 1);
                xPos += value;
            });
        };

        const observer = new ResizeObserver(() => {
            createChart();
        });
        
        observer.observe(distributionContainer);
        createChart();
        
        return () => {
            observer.disconnect();
            if (distributionContainer) {
                distributionContainer.innerHTML = '';
            }
        };
    });
</script>

<div class="w-full space-y-2 sm:space-y-4 p-2 sm:p-4 pb-4 sm:pb-8 rounded-sm bg-gray-50 dark:bg-neutral-800">
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
        <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-sm bg-[#ff5151]"></div>
            <span class="text-[.625rem] text-gray-600 dark:text-gray-300">Disease Distribution</span>
        </div>
        <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-sm bg-transparent border border-[#ff5151]"></div>
            <span class="text-[.625rem] text-gray-600 dark:text-gray-300">Category Average</span>
        </div>
    </div>
</div>