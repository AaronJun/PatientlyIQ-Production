<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import * as d3 from 'd3';
    import { generateDiseaseData, type SentimentCategory, diseases } from '$lib/data/diseases';
    
    export let selectedDisease: string;
    export let compareWithCategory = false;
    
    const dispatch = createEventDispatcher();
    let svg: SVGElement;
    let container: HTMLDivElement;
    let width: number;
    let height: number;
    
    $: diseaseData = generateDiseaseData(selectedDisease);
    $: categoryData = getCategoryData(selectedDisease);
    $: normalizedDiseaseData = normalizeData(diseaseData);
    $: normalizedCategoryData = normalizeData(categoryData);
    $: if (normalizedDiseaseData && svg && width && height) createChart();

    const diseaseColors: Record<string, string> = {
        positive: '#4CAF50',
        mixed: '#FFC107',
        neutral: '#9E9E9E',
        negative: '#ff5151'
    };

    const categoryColors: Record<string, string> = {
        positive: '#2E7D33', // Darker green
        mixed: '#FF8F00', // Darker amber
        neutral: '#616161', // Darker grey
        negative: '#C62828' // Darker red
    };
    
    // Add reactive statement to watch compareWithCategory changes
    $: if (compareWithCategory !== undefined && svg) {
        // Update category bars opacity when compareWithCategory changes
        d3.selectAll('.category-series rect')
            .transition()
            .duration(750)
            .style('opacity', compareWithCategory ? 1 : 0)
            .style('pointer-events', compareWithCategory ? 'auto' : 'none');
    }

    function getCategoryData(diseaseId: string): SentimentCategory[] {
        const category = diseases.find(cat => 
            cat.items.some(item => item.id === diseaseId)
        )?.category;

        if (!category) return [];

        const categoryDiseases = diseases
            .find(cat => cat.category === category)
            ?.items.map(item => generateDiseaseData(item.id)) || [];

        return diseaseData.map(metricCategory => {
            const aggregatedData = categoryDiseases.reduce((acc, diseaseMetrics) => {
                const metric = diseaseMetrics.find(m => m.category === metricCategory.category);
                if (!metric) return acc;
                
                return {
                    positive: acc.positive + metric.positive,
                    negative: acc.negative + metric.negative,
                    neutral: acc.neutral + metric.neutral,
                    mixed: acc.mixed + metric.mixed,
                    totalMentions: acc.totalMentions + (metric.details?.totalMentions || 0)
                };
            }, { positive: 0, negative: 0, neutral: 0, mixed: 0, totalMentions: 0 });

            const avgData = {
                category: metricCategory.category,
                positive: aggregatedData.positive / categoryDiseases.length,
                negative: aggregatedData.negative / categoryDiseases.length,
                neutral: aggregatedData.neutral / categoryDiseases.length,
                mixed: aggregatedData.mixed / categoryDiseases.length,
                details: {
                    ...metricCategory.details,
                    totalMentions: aggregatedData.totalMentions
                }
            };

            return avgData;
        });
    }

    function normalizeData(data: SentimentCategory[]) {
        return data.map(d => {
            const total = d.positive + d.neutral + d.negative + d.mixed;
            return {
                ...d,
                positive: (d.positive / total) * 100,
                neutral: (d.neutral / total) * 100,
                negative: (d.negative / total) * 100,
                mixed: (d.mixed / total) * 100
            };
        });
    }

    onMount(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                width = entry.contentRect.width;
                height = 500;
            }
        });
        
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    });

    interface ChartDataPoint {
        category: string;
        positive: number;
        neutral: number;
        negative: number;
        mixed: number;
        details?: {
            totalMentions: number;
            topTerms: string[];
            trends: Array<{ date: string; value: number; }>;
        };
    }

    const margin = { top: 20, right: 20, bottom: 100, left: 40 };
    const keys = ["positive", "mixed", "neutral", "negative"] as const;

    function createChart() {
        d3.select(svg).selectAll("*").remove();

        let tooltip = d3.select(container).select(".tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select(container)
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);
        }

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const svgEl = d3.select(svg)
            .attr("width", width)
            .attr("height", height);

        const g = svgEl.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(normalizedDiseaseData.map(d => d.category))
            .range([0, chartWidth])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([chartHeight, 0]);

        function createStackedBars(data: ChartDataPoint[], xOffset: number = 0, isCategory: boolean = false) {
            const stack = d3.stack<ChartDataPoint>()
                .keys(keys)
                .order(d3.stackOrderNone)
                .offset(d3.stackOffsetNone);

            const stackedData = stack(data);
            const barWidth = x.bandwidth() / 2.25;

            const className = isCategory ? "category-series" : "disease-series";
            const colors = isCategory ? categoryColors : diseaseColors;

            const groups = g.selectAll(`.${className}`)
                .data(stackedData)
                .join("g")
                .attr("class", className)
                .style("fill", d => colors[d.key as keyof typeof colors]);

            const bars = groups.selectAll("rect")
                .data(d => d)
                .join("rect")
                .attr("x", d => (x(d.data.category) || 0) + xOffset)
                .attr("y", d => y(d[1]))
                .attr("height", d => y(d[0]) - y(d[1]))
                .attr("width", barWidth)
                .attr("cursor", "pointer")
                .style("opacity", isCategory ? (compareWithCategory ? 0.7 : 0) : 1)
                .style("pointer-events", isCategory ? (compareWithCategory ? "auto" : "none") : "auto");

            bars.on("mouseover", function(event: MouseEvent, d: any) {
                const parentData = d3.select(this.parentNode).datum() as any;
                const sentimentType = parentData.key;
                const percentage = (d[1] - d[0]).toFixed(1);
                const originalData = isCategory ? categoryData.find(item => item.category === d.data.category)
                                             : diseaseData.find(item => item.category === d.data.category);
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                    
                tooltip.html(`
                    <div class="tooltip-content">
                        <div class="tooltip-header">
                            ${d.data.category} ${isCategory ? '(Category Average)' : ''}
                        </div>
                        <div class="tooltip-detail">
                            <span class="sentiment-type">${sentimentType}</span>
                            <span class="percentage">${percentage}%</span>
                        </div>
                        <div class="tooltip-mentions">
                            ${originalData?.details?.totalMentions.toLocaleString()} mentions
                        </div>
                    </div>
                `)
                    .style("left", `${event.pageX - container.getBoundingClientRect().left + 10}px`)
                    .style("top", `${event.pageY - container.getBoundingClientRect().top - 28}px`);

                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", isCategory ? 0.9 : 0.8);
            });

            bars.on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);

                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", isCategory ? (compareWithCategory ? 0.7 : 0) : 1);
            });

            bars.on("click", (event: MouseEvent, d: any) => {
                const originalData = isCategory ? categoryData.find(item => item.category === d.data.category)
                                             : diseaseData.find(item => item.category === d.data.category);
                handleBarClick(originalData);
            });
        }

        // Create both sets of bars
        createStackedBars(normalizedDiseaseData);
        createStackedBars(normalizedCategoryData, x.bandwidth() / 2 + 2, true);

        g.append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)")
            .style("font-size", "0.65rem")
            .style("font-family", "IBM Plex Mono, monospace");

        g.append("g")
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
            .selectAll("text")
            .style("font-size", "0.65rem")
            .style("font-family", "IBM Plex Mono, monospace");

        // Update legend to show both color sets
        const legendData = [...keys.map(k => ({ key: k, isCategory: false })), ...keys.map(k => ({ key: k, isCategory: true }))];
        const legend = svgEl.append("g")
            .attr("font-family", "IBM Plex Mono, monospace")
            .attr("font-size", 10)
            .attr("text-anchor", "start")
            .selectAll("g")
            .data(legendData)
            .join("g")
            .attr("transform", (d, i) => `translate(${margin.left + (i % 4) * 100},${height - margin.bottom/2 + Math.floor(i/4) * 20})`);

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", d => d.isCategory ? categoryColors[d.key] : diseaseColors[d.key]);

        legend.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.32em")
            .text(d => {
                const label = d.key.charAt(0).toUpperCase() + d.key.slice(1);
                return d.isCategory ? `${label} (Cat.)` : label;
            });
    }

    function handleBarClick(d: any) {
        dispatch('barClick', {
            category: d.category,
            positive: d.positive,
            negative: d.negative,
            neutral: d.neutral,
            mixed: d.mixed,
            details: d.details
        });
    }
</script>

<div class="chart-container" bind:this={container}>
    <svg bind:this={svg}></svg>
</div>

<style>
    .chart-container {
        width: 100%;
        height: 500px;
        position: relative;
    }
    
    :global(.tooltip) {
        position: absolute;
        padding: 8px;
        background: rgba(0, 0, 0, 0.8);
        color: #fff;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        font-family: "IBM Plex Mono", monospace;
        z-index: 100;
        max-width: 200px;
    }

    :global(.tooltip-content) {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    :global(.tooltip-header) {
        font-weight: 600;
        color: #fff;
    }

    :global(.tooltip-detail) {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
    }

    :global(.sentiment-type) {
        color: #a0aec0;
        text-transform: capitalize;
    }

    :global(.percentage) {
        font-weight: 600;
    }

    :global(.tooltip-mentions) {
        font-size: 10px;
        color: #a0aec0;
    }
    
    :global(.domain, .tick line) {
        stroke: #e5e7eb;
    }

    @media (max-width: 640px) {
        :global(.tooltip) {
            font-size: 10px;
            max-width: 150px;
        }
    }
</style>