<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import * as d3 from 'd3';
    
    const dispatch = createEventDispatcher();
    export let data: Record<string, number>;
    
    let svg: SVGElement;
    let container: HTMLDivElement;
    let width: number;
    const height = 500;
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    
    const colors = {
        entirelyPositive: '#2E7D33',
        somewhatPositive: '#4CAF50',
        neutral: '#9E9E9E',
        somewhatNegative: '#ff7171',
        entirelyNegative: '#ff5151'
    };
    
    onMount(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                width = entry.contentRect.width;
                if (width && height) createChart();
            }
        });
        
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    });
    
    $: {
        if (data && width && height) {
            createChart();
        }
    }
    
    function createChart() {
        if (!data) return;
        
        d3.select(svg).selectAll("*").remove();
        
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        const radius = Math.min(chartWidth, chartHeight) / 2;
        
        const svgEl = d3.select(svg)
            .attr("width", width)
            .attr("height", height);
            
        const g = svgEl.append("g")
            .attr("transform", `translate(${width/2},${height/2})`);
            
        const total = Object.values(data).reduce((a, b) => a + b, 0);
        
        // Create pie layout
        const pie = d3.pie()
            .value(d => d[1])
            .sort(null);
            
        // Create arc generators
        const arc = d3.arc()
            .innerRadius(radius * 0.6)
            .outerRadius(radius);
            
        // Create outer arc for label positioning
        const outerArc = d3.arc()
            .innerRadius(radius * 1.2)
            .outerRadius(radius * 1.2);
            
        // Create data array
        const pieData = pie(Object.entries(data));
        
        // Add arcs
        const paths = g.selectAll("path")
            .data(pieData)
            .join("path")
            .attr("fill", d => colors[d.data[0] as keyof typeof colors])
            .attr("cursor", "pointer")
            .attr("d", arc as any)
            .on("click", (event, d) => {
                dispatch('barClick', {
                    sentiment: d.data[0],
                    value: d.data[1],
                    percentage: (d.data[1] / total * 100)
                });
            });
            
        // Add labels and lines
        const labelGroups = g.selectAll(".label-group")
            .data(pieData)
            .join("g")
            .attr("class", "label-group");
            
        // Add lines
        labelGroups.append("polyline")
            .attr("stroke", "#666")
            .attr("fill", "none")
            .attr("stroke-width", ".625px")
            .attr("points", d => {
                const posA = (arc as any).centroid(d);
                const posB = (outerArc as any).centroid(d);
                const posC = (outerArc as any).centroid(d);
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                posC[0] = radius * 1.3 * (midangle < Math.PI ? 1 : -1);
                return [posA, posB, posC].map(p => p.join(",")).join(" ");
            });
            
        // Add labels
        labelGroups.append("text")
            .attr("transform", d => {
                const pos = (outerArc as any).centroid(d);
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                pos[0] = radius * 1.4 * (midangle < Math.PI ? 1 : -1);
                return `translate(${pos})`;
            })
            .attr("text-anchor", d => {
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                return midangle < Math.PI ? "start" : "end";
            })
            .attr("dy", "0.35em")
            .attr("fill", " rgb(107 114 128")
            .style("font-size", "9.25px")
            .style("text-transform", "capitalize")
            .style("font-family", "IBM Plex Mono")
            .each(function(d) {
                const percentage = (d.data[1] / total * 100).toFixed(1);
                const categoryName = d.data[0].replace(/([A-Z])/g, ' $1').trim();
                const text = d3.select(this);
                text.append("tspan")
                    .text(categoryName)
                    .style("font-weight", "bold");
                text.append("tspan")
                    .attr("x", "0")
                    .attr("fill", "#ff1515")
                    .attr("dy", "1.725em")
                    .text(`${d.data[1]} (${percentage}%)`);
            });
            
        // Add center text showing total
        g.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .text(`Total: ${total}`)
            .style("font-size", "14px")
            .style("font-family", "IBM Plex Mono");
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
</style>