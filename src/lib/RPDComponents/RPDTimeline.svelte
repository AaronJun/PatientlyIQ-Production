<script lang="ts">
    import { onMount, createEventDispatcher, afterUpdate } from 'svelte';
    import * as d3 from 'd3';
    import { Button } from "carbon-components-svelte";
    import SimpleDrawer from './RPDDrawer.svelte';
    import "carbon-components-svelte/css/all.css";
    
    export let width: number;
    export let data: Array<{ Year: string, "RPD PRV ": string }>;
    export let constellationData: Array<any>;
    
    let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    let tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    let currentYear = data[0].Year;
    let container: HTMLElement;
    let scrollPosition = 0;
    
    let isDrawerOpen = false;
    let selectedData: { Year: string, "RPD PRV ": string, TherapeuticArea: string } | null = null;
    
    const dispatch = createEventDispatcher();
    const margin = { top: 50, right: 150, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    let innerHeight: number;
    const yearWidth = 500;
    const circleRadius = 10;
    const circleSpacing = 20;
    const taGroupSpacingLarge = 42;
    const taGroupSpacingSmall = 32;
    const labelLineExtension = 32;
    
    const therapeuticAreas = [
      'Neurology', 'Hematology', 'Immunology', 'Metabolic', 'Oncology',
      'Pulmonology', 'Ophthalmology', 'Dermatology', 'Orthopedics', 'Hepatology', 
      'Nephrology', 'Genetic', 'Endocrinology', 'Gastroenterology'
    ];
    
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(therapeuticAreas);
    
    $: xScale = d3.scaleLinear()
        .domain([d3.min(data, d => +d.Year) || 0, d3.max(data, d => +d.Year) || 0])
        .range([0, (data.length - 1) * yearWidth]);
    
    $: processedData = processConstellationData(constellationData);
    
    function processConstellationData(data: any[]) {
        return data.reduce((acc, entry) => {
            const year = entry.Year;
            if (!acc[year]) {
                acc[year] = {};
            }
            const area = entry.name.trim();
            if (!acc[year][area]) {
                acc[year][area] = [];
            }   
            acc[year][area].push(entry);
            return acc;
        }, {});
    }
    
    onMount(() => {
        svg = d3.select('#horizontal-timeline')
            .attr('width', width)
            .attr('height', innerHeight + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
    
        tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', 'white')
            .style('border', '1px solid #ddd')
            .style('padding', '10px')
            .style('border-radius', '5px')
            .style('pointer-events', 'none');
    
        drawTimeline();
        updateTimeline(true);
    });
    
    afterUpdate(() => {
        if (typeof window !== 'undefined') {
            updateTimeline(false);
            centerCurrentYear();
        }
    });
    
    function drawTimeline() {
        if (!svg) return;
    
        const xAxis = d3.axisBottom(xScale)
            .tickValues(data.map(d => +d.Year))
            .tickFormat(d3.format('d'));
    
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'middle');
    
        svg.append('line')
            .attr('class', 'vertical-line')
            .attr('stroke', '#DE4726')
            .attr('stroke-dasharray', '2,5,2,5')
            .attr('stroke-width', 2);
    
        svg.append('text')
            .attr('class', 'year-text')
            .attr('fill', '#333')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold');
    }
    
    function updateTimeline(isInitialRender: boolean) {
        if (!svg) return;
    
        const t = svg.transition().duration(750);
    
        let totalDelay = 0;
    
        Object.entries(processedData).forEach(([year, areas]) => {
            let yOffset = 0;
            let labelCount = 0;
    
            therapeuticAreas.forEach((area, index) => {
                const areaData = areas[area] || [];
                
                if (areaData.length > 0) {
                    // Draw circles
                    svg.selectAll(`.circle-${year}-${area}`)
                        .data(areaData)
                        .join(
                            enter => enter.append('circle')
                                .attr('class', `circle-${year}-${area}`)
                                .attr('cx', xScale(+year))
                                .attr('cy', (d, i) => innerHeight - yOffset - circleSpacing * (i + 1))
                                .attr('r', 0)
                                .attr('fill', 'none')
                                .attr('stroke', colorScale(area))
                                .attr('stroke-width', 2),
                            update => update,
                            exit => exit.remove()
                        )
                        .transition()
                        .duration(750)
                        .delay((d, i) => isInitialRender ? 0 : (totalDelay + i * 120))
                        .attr('cx', xScale(+year))
                        .attr('cy', (d, i) => innerHeight - yOffset - circleSpacing * (i + 1))
                        .attr('r', circleRadius)
                        .selection()
                        .on('mouseover', handleMouseOver)
                        .on('mouseout', handleMouseOut)
                        .on('click', handleCircleClick);
    
                    // Calculate label position
                    const labelY = innerHeight - yOffset - (areaData.length * circleSpacing) / 2;
                    const lineLength = labelLineExtension + (labelCount * labelLineExtension); 
    
                    // Add or update label
                    svg.selectAll(`.label-${year}-${area}`)
                        .data([area])
                        .join(
                            enter => enter.append('text')
                                .attr('class', `label-${year}-${area}`)
                                .attr('x', xScale(+year) + circleRadius + lineLength)
                                .attr('y', labelY - 10)
                                .attr('text-anchor', 'end')
                                .attr('font-size', '10px')
                                .attr('font-weight', '600')
                                .attr('fill', '#161616')
                                .text(d => d)
                                .style('opacity', 0),
                            update => update,
                            exit => exit.remove()
                        )
                        .transition()
                        .duration(750)
                        .attr('x', xScale(+year) + circleRadius + lineLength)
                        .attr('y', labelY - 10)
                        .style('opacity', +year <= +currentYear ? 1 : 0.1);
    
                    // Add connecting line
                    svg.selectAll(`.line-${year}-${area}`)
                        .data([area])
                        .join(
                            enter => enter.append('line')
                                .attr('class', `line-${year}-${area}`)
                                .attr('stroke', '#C9C9C9')
                                .attr('stroke-width', 1)
                                .style('opacity', 0),
                            update => update,
                            exit => exit.remove()
                        )
                        .transition()
                        .duration(750)
                        .attr('x1', xScale(+year) + circleRadius)
                        .attr('y1', labelY)
                        .attr('x2', xScale(+year) + circleRadius + lineLength)
                        .attr('y2', labelY)
                        .style('opacity', +year <= +currentYear ? 1 : 0.1);
    
                    yOffset += areaData.length * circleSpacing;
                    if (index < therapeuticAreas.length - 1) {
                        yOffset += areaData.length === 1 ? taGroupSpacingSmall : taGroupSpacingLarge;
                    }
                    if (+year === +currentYear) {
                        totalDelay += areaData.length * 120;
                    }
                    labelCount++;
                }
            });
        });
    
        svg.select('.vertical-line')
            .transition(t)
            .attr('x1', xScale(+currentYear))
            .attr('x2', xScale(+currentYear))
            .attr('y1', 0)
            .attr('y2', innerHeight);
    
        svg.select('.year-text')
            .transition(t)
            .attr('x', xScale(+currentYear))
            .attr('y', -10)
            .text(currentYear);
    }
    
    function handleMouseOver(event: MouseEvent, d: any) {
        const target = event.target as SVGCircleElement;
        
        // Dim all other circles
        svg.selectAll('circle')
            .transition()
            .duration(200)
            .style('opacity', 0.5);
        
        // Highlight the hovered circle
        d3.select(target)
            .transition()
            .duration(200)
            .style('opacity', 1);
    
        // Show tooltip
        tooltip.transition()
            .duration(200)
            .style('opacity', .9);
        
        tooltip.html(`
            <strong>${d.Year}, ${d.Month} ${d.Date}</strong><br/>
            ${d.id}<br/>
            ${d.name}<br/>
            ${d.Sponsor}, ${d["Drug Name"]}<br/>
            ${d["Treatment Type"] || "NA"}
        `)
        .style('left', (event.pageX + 40) + 'px')
        .style('top', (event.pageY - 120) + 'px');
    }
    
    function handleMouseOut() {
        // Reset all circles to full opacity
        svg.selectAll('circle')
            .transition()
            .duration(200)
            .style('opacity', 0);
    
        // Hide tooltip
        tooltip.transition()
            .duration(500)
            .style('opacity', 0);
    }
    
    function handleCircleClick(event: MouseEvent, d: any) {
        selectedData = d;
        isDrawerOpen = true;
    }
    
    function navigateYear(direction: 'prev' | 'next') {
        const currentIndex = data.findIndex(d => d.Year === currentYear);
        if (direction === 'prev' && currentIndex > 0) {
            currentYear = data[currentIndex - 1].Year;
        } else if (direction === 'next' && currentIndex < data.length - 1) {
            currentYear = data[currentIndex + 1].Year;
        }
        updateTimeline(false);
        centerCurrentYear();
        dispatch('yearChange', { year: currentYear });
    }
    
    function centerCurrentYear() {
        if (container && typeof window !== 'undefined') {
            const currentYearX = xScale(+currentYear);
            const containerWidth = container.clientWidth;
            scrollPosition = Math.max(0, currentYearX - containerWidth / 2);
            container.scrollLeft = scrollPosition;
        }
    }
    
    function closeDrawer() {
        isDrawerOpen = false;
    }
</script>

<div bind:this={container} id="timeline-container">
    <svg id="horizontal-timeline"></svg>
</div>

<div class="controls">
    <Button on:click={() => navigateYear('prev')} disabled={currentYear === data[0].Year}>Previous Year</Button>
    <Button on:click={() => navigateYear('next')} disabled={currentYear === data[data.length - 1].Year}>Next Year</Button>
</div>

{#if isDrawerOpen && selectedData}
    <SimpleDrawer bind:isOpen={isDrawerOpen} data={selectedData} onClose={closeDrawer} />
{/if}

<style>
    #timeline-container {
        width: 100%;
        overflow-x: auto;
        align-content: bottom;
        position: absolute;
    }

    :global(.tooltip) {
        position: absolute;
        text-align: left;
        padding: 8px;
        font: 12px 'IBM Plex Sans', sans-serif;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        pointer-events: none;
    }

    :global(.x-axis text) {
        text-anchor: middle;
    }

    :global(.x-axis line, .x-axis path) {
        stroke: #ddd;
    }

    .controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>