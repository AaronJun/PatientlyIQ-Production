<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import * as d3 from 'd3';
    import type { Selection } from 'd3';

    export let constellationData: ConstellationEntry[];
    export let summaryDisplayComponent: any;
    export let overviewSegment: string = "Overview";

    let svg: Selection<SVGSVGElement, unknown, null, undefined>;
    let currentSegment: string = overviewSegment;
    const dispatch = createEventDispatcher();

    let width: number;
    let height: number;
    $: margin = { 
        top: height * 0.25, 
        right: width * 0.0, 
        bottom: height * 0.042, 
        left: width * 0.275 
    };
    $: innerRadius = Math.min(width, height) * 0.029;
    $: outerRadius = Math.min(width, height) / 1.625 - Math.max(margin.top, margin.right, margin.bottom, margin.left);

    const therapeuticAreas = [...new Set(constellationData.map(d => d.name))].sort();
    const allTherapeuticAreas = ['Overview', ...therapeuticAreas];

    $: xScale = d3.scaleBand()
        .range([0, 2 * Math.PI])
        .align(0)
        .domain(allTherapeuticAreas);

    $: yScale = d3.scaleLog()
        .range([innerRadius, outerRadius])
        .domain([1, d3.max(therapeuticAreas, area => constellationData.filter(d => d.name === area).length)]);

    const therapeuticAreaColors = {
        "Gastroenterology": "#39FF14",
        "Neurology": "#4D4DFF",
        "Ophthalmology": "#E79028",
        "Immunology": "#EA38A5",
        "Metabolic": "#133B11",
        "Dermatology": "#559368",
        "Hematology": "#CF3630",
        "Orthopedics": "#441780",
        "Pulmonology": "#CBC09F",
        "Nephrology": "#ACA3DB",
        "Oncology": "#FF84DE",
        "Genetic": "#4D4DFF",
        "Hepatology": "#FF00D4",
    };

    function getColor(name: string): string {
        return therapeuticAreaColors[name] || "#000000";
    }

    onMount(async () => {
        svg = d3.select("#radial-timeline")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        await drawTimeline();
        updateVisibility(overviewSegment);
        dispatch('segmentChange', { segment: overviewSegment });
    });

    async function drawTimeline() {
        svg.selectAll("*").remove();

        // Draw timeline lines
        svg.append("g")
            .selectAll("line")
            .data(therapeuticAreas)
            .enter()
            .append("line")
            .attr("class", d => `area-${d} timeline-line`)
            .attr("stroke", d => getColor(d))
            .attr("stroke-width", 2)
            .attr("x1", d => {
                const angle = xScale(d)! + xScale.bandwidth() / 2;
                return Math.sin(angle) * innerRadius;
            })
            .attr("y1", d => {
                const angle = xScale(d)! + xScale.bandwidth() / 2;
                return -Math.cos(angle) * innerRadius;
            })
            .attr("x2", d => {
                const angle = xScale(d)! + xScale.bandwidth() / 2;
                return Math.sin(angle) * yScale(constellationData.filter(entry => entry.name === d).length);
            })
            .attr("y2", d => {
                const angle = xScale(d)! + xScale.bandwidth() / 2;
                return -Math.cos(angle) * yScale(constellationData.filter(entry => entry.name === d).length);
            });

        // Draw circles at the end of lines
        svg.append("g")
            .selectAll("circle")
            .data(therapeuticAreas)
            .enter()
            .append("circle")
            .attr("class", d => `area-${d}`)
            .attr("cx", d => {
                const angle = xScale(d)! + xScale.bandwidth() / 2;
                return Math.sin(angle) * yScale(constellationData.filter(entry => entry.name === d).length);
            })
            .attr("cy", d => {
                const angle = xScale(d)! + xScale.bandwidth() / 2;
                return -Math.cos(angle) * yScale(constellationData.filter(entry => entry.name === d).length);
            })
            .attr("r", 5)
            .attr("fill", d => getColor(d));

        // Create petal clusters
        for (const area of therapeuticAreas) {
            const entries = constellationData.filter(d => d.name === area);
            if (entries.length > 0) {
                const angle = xScale(area)! + xScale.bandwidth() / 2;
                const radius = yScale(entries.length);
                const x = Math.sin(angle) * radius;
                const y = -Math.cos(angle) * radius;
                
                await createPetalCluster(area, entries, { x, y, angle });
            }
        }

        drawSegmentCircle();
    }

    // Include the createPetalCluster, drawSegmentCircle, and other necessary functions from the original RadialTimeline.svelte

    function updateVisibility(segment: string) {
        allTherapeuticAreas.forEach(s => {
            const isActiveSegment = s === segment;
            const saturation = isActiveSegment ? 1 : 0.125;

            svg.selectAll(`.area-${s}, .cluster-${s}`)
                .transition()
                .duration(400)
                .style("filter", `saturate(${saturation})`)
                .style("opacity", isActiveSegment ? 1 : 0.5);

            // Update segment circle and labels
        });
     
        if (summaryDisplayComponent) {
            summaryDisplayComponent.$set({ currentSegment: segment });
        }
    }

    export function navigate(direction: 'prev' | 'next') {
        const currentIndex = allTherapeuticAreas.indexOf(currentSegment);
        let newIndex;

        if (direction === 'next') {
            newIndex = (currentIndex + 1) % allTherapeuticAreas.length;
        } else { // 'prev'
            newIndex = (currentIndex - 1 + allTherapeuticAreas.length) % allTherapeuticAreas.length;
        }

        currentSegment = allTherapeuticAreas[newIndex];
        updateVisibility(currentSegment);
        dispatch('segmentChange', { segment: currentSegment });
    }
</script>

<div class="timeline-container" bind:clientWidth={width} bind:clientHeight={height}>
    <svg id="radial-timeline"></svg>
</div>

<style>
    .timeline-container {
        width: 100%;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    :global(.timeline-line) {
        transition: all 0.5s ease-in-out;
    }

    :global(.segment-label), :global(.cluster) {
        transition: opacity 0.5s ease-in-out;
    }
</style>