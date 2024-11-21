<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import * as d3 from 'd3';
    import { generateDiseaseData, type SentimentCategory, diseases } from '$lib/data/diseases';
    import { browser } from '$app/environment';
    
    export let selectedDisease: string;
    export let compareWithCategory = false;
    
    const dispatch = createEventDispatcher();
    let svg: SVGElement;
    let container: HTMLDivElement;
    let width: number;
    let height = 700;
    let isDarkMode = false;
    let activeSegment: any = null;
    let mediaQuery: MediaQueryList;

    const diseaseColors: Record<string, string> = {
        positive: '#4CAF50',
        mixed: '#FFC107',
        neutral: '#9E9E9E',
        negative: '#ff5151'
    };

    const categoryColors: Record<string, string> = {
        positive: '#2E7D33',
        mixed: '#FF8F00',
        neutral: '#616161',
        negative: '#C62828'
    };

    const margin = { top: 60, right: 200, bottom: 40, left: 40 };
    const keys = ["positive", "mixed", "neutral", "negative"] as const;
    
    // Initialize mediaQuery only on the client side
    onMount(() => {
        if (browser) {
            mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            handleColorSchemeChange(mediaQuery);
            mediaQuery.addEventListener('change', handleColorSchemeChange);
            window.addEventListener('keydown', handleKeydown);

            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    width = entry.contentRect.width;
                    if (width && height) createChart();
                }
            });
            
            resizeObserver.observe(container);
            return () => {
                mediaQuery.removeEventListener('change', handleColorSchemeChange);
                window.removeEventListener('keydown', handleKeydown);
                resizeObserver.disconnect();
            };
        }
    });

    // Add reactivity for selectedDisease and compareWithCategory
    $: {
        if (browser && (selectedDisease || compareWithCategory !== undefined)) {
            if (activeSegment) {
                resetZoom();
            }
            if (width && height) {
                createChart();
            }
        }
    }

    $: diseaseData = generateDiseaseData(selectedDisease);
    $: categoryData = getCategoryData(selectedDisease);
    $: normalizedDiseaseData = normalizeData(diseaseData);
    $: normalizedCategoryData = normalizeData(categoryData);
    $: totals = calculateTotals();

    // Watch for category comparison changes
    $: if (browser && compareWithCategory !== undefined && svg) {
        d3.selectAll('.category-series rect')
            .transition()
            .duration(750)
            .style('opacity', compareWithCategory ? 0.7 : 0)
            .style('pointer-events', compareWithCategory ? 'auto' : 'none');
    }

    function handleColorSchemeChange(e: MediaQueryListEvent | MediaQueryList) {
        isDarkMode = e.matches;
        if (width && height) createChart();
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape' && activeSegment) {
            resetZoom();
        }
    }

    function handleBackgroundClick(event: MouseEvent) {
        if (activeSegment && event.target === event.currentTarget) {
            resetZoom();
        }
    }

    function calculateTotals() {
        if (!diseaseData) return {};
        const result: Record<string, number> = {
            positive: 0,
            mixed: 0,
            neutral: 0,
            negative: 0
        };

        diseaseData.forEach(d => {
            result.positive += d.positive || 0;
            result.mixed += d.mixed || 0;
            result.neutral += d.neutral || 0;
            result.negative += d.negative || 0;
        });

        return result;
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
        if (!data) return [];
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

    function zoomToSegment(d: any, element: SVGRectElement) {
        if (!width || !height) return;
        
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        activeSegment = d;
        container.setAttribute('data-zoomed', 'true');
        
        const bbox = element.getBoundingClientRect();
        const svgBox = svg.getBoundingClientRect();
        
        const relativeX = bbox.x - svgBox.x - margin.left;
        const relativeY = bbox.y - svgBox.y - margin.top;
        
        const scale = 2;
        const translateX = chartWidth / 4 - relativeX * scale;
        const translateY = chartHeight / 2 - relativeY * scale;
        
        const chart = d3.select(svg).select("g");
        
        chart.selectAll("rect")
            .transition()
            .duration(750)
            .style("opacity", function(this: SVGRectElement) {
                return this === element ? 1 : 0.2;
            });
        
        chart.transition()
            .duration(750)
            .attr("transform", `translate(${margin.left + translateX},${margin.top + translateY}) scale(${scale})`);
            
        let resetButton = d3.select(container).select(".reset-button");
        if (resetButton.empty()) {
            resetButton = d3.select(container)
                .append("button")
                .attr("class", "reset-button")
                .style("position", "absolute")
                .style("top", "20px")
                .style("left", "20px")
                .style("padding", "8px 16px")
                .style("background-color", "#ff5151")
                .style("color", "white")
                .style("border", "none")
                .style("border-radius", "4px")
                .style("cursor", "pointer")
                .style("font-family", "IBM Plex Mono, monospace")
                .style("font-size", "12px")
                .text("Reset View")
                .on("click", resetZoom);
        }
        
        resetButton.transition()
            .duration(200)
            .style("opacity", 1);
    }
    
    function resetZoom() {
        if (!width || !height) return;
        
        container.removeAttribute('data-zoomed');
        
        const chart = d3.select(svg).select("g");
        
        chart.transition()
            .duration(750)
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        chart.selectAll("rect")
            .transition()
            .duration(750)
            .style("opacity", (d, i, nodes) => {
                const element = nodes[i];
                const parentClass = element.parentNode.classList.contains("category-series");
                return parentClass ? (compareWithCategory ? 0.7 : 0) : 1;
            });
        
        d3.select(container).select(".reset-button")
            .transition()
            .duration(200)
            .style("opacity", 0)
            .remove();
        
        activeSegment = null;
    }

    function createChart() {
        if (!width || !height || !normalizedDiseaseData?.length) return;

        d3.select(svg).selectAll("*").remove();

        const svgEl = d3.select(svg)
            .attr("width", width)
            .attr("height", height);
            
        svgEl.append("rect")
            .attr("class", "background-rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "transparent")
            .style("cursor", "default")
            .on("click", handleBackgroundClick);

        let tooltip = d3.select(container).select(".tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select(container)
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);
        }

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const g = svgEl.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        g.selectAll(".category-label")
            .data(normalizedDiseaseData)
            .join("text")
            .attr("class", "category-label")
            .attr("font-size", "0.625rem")
            .attr("x", (d, i) => (chartWidth / normalizedDiseaseData.length) * (i + 0.5))
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .style("font-family", "IBM Plex Mono, monospace")
            .style("font-size", "0.75rem")
            .style("fill", isDarkMode ? "#D1D5DB" : "#374151")
            .text(d => d.category);

        const x = d3.scaleBand()
            .domain(normalizedDiseaseData.map(d => d.category))
            .range([0, chartWidth])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([chartHeight, 0]);

        g.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSize(-chartWidth)
                .tickFormat(() => ""))
            .style("stroke", isDarkMode ? "rgba(75, 85, 99, 0.3)" : "rgba(229, 231, 235, 0.6)")
            .style("stroke-dasharray", "4,4");

        function createStackedBars(data: any[], xOffset: number = 0, isCategory: boolean = false) {
            const stack = d3.stack()
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

            bars.on("click", function(event: MouseEvent, d: any) {
                event.stopPropagation();
                const originalData = isCategory ? categoryData.find(item => item.category === d.data.category)
                                             : diseaseData.find(item => item.category === d.data.category);
                if (activeSegment !== d) {
                    zoomToSegment(d, this);
                }
                handleBarClick(originalData);
            });
        }

        // Create bars
        createStackedBars(normalizedDiseaseData);
        createStackedBars(normalizedCategoryData, x.bandwidth() / 2 + 2, true);

        // Create legend with dark mode support
        const legend = svgEl.append("g")
            .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);

        legend.selectAll("g")
            .data(keys)
            .join("g")
            .attr("transform", (d, i) => `translate(0, ${i * 25})`)
            .call(g => {
                g.append("rect")
                    .attr("width", 18)
                    .attr("height", 18)
                    .attr("fill", d => diseaseColors[d]);

                g.append("text")
                    .attr("x", 24)
                    .attr("y", 9)
                    .attr("dy", "0.32em")
                    .style("font-family", "IBM Plex Mono, monospace")
                    .style("font-size", "10px")
                    .style("fill", isDarkMode ? "#D1D5DB" : "#374151")
                    .text(d => {
                        const label = d.charAt(0).toUpperCase() + d.slice(1);
                        const total = totals[d]?.toLocaleString() || '0';
                        return `${label} (${total})`;
                    });
            });

        // Add y-axis with dark mode support
        const yAxis = g.append("g")
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));

        yAxis.selectAll("text")
            .style("font-size", "0.65rem")
            .style("font-family", "IBM Plex Mono, monospace")
            .style("fill", isDarkMode ? "#D1D5DB" : "#374151");

        yAxis.selectAll("line")
            .style("stroke", isDarkMode ? "#4B5563" : "#E5E7EB");

        yAxis.select(".domain")
            .style("stroke", isDarkMode ? "#4B5563" : "#E5E7EB");
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
<svelte:window on:keydown={handleKeydown}/>

<div 
    class="chart-container" 
    bind:this={container} 
    on:click={handleBackgroundClick}
    data-zoomed={!!activeSegment}
>
    <svg bind:this={svg}></svg>
</div>

<style>
    .chart-container {
        width: 100%;
        height: 700px;
        position: relative;
    }
    
    .chart-container[data-zoomed="true"] {
        cursor: pointer;
    }

    .chart-container {
        transition: cursor 0.2s ease-in-out;
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

    :global(.reset-button) {
        transition: all 0.2s ease-in-out;
    }

    :global(.reset-button:hover) {
        background-color: #ff3131;
        transform: scale(1.05);
    }

    @media (max-width: 640px) {
        :global(.tooltip) {
            font-size: 10px;
            max-width: 150px;
        }
    }
</style>