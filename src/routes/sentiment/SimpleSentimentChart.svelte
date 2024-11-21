<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import * as d3 from 'd3';
    
    const dispatch = createEventDispatcher();
    export let data: Record<string, number>;
    
    let svg: SVGElement;
    let container: HTMLDivElement;
    let width: number;
    const height = 400;
    const margin = { top: 40, right: 120, bottom: 40, left: 60 };
    
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
        
        const svgEl = d3.select(svg)
            .attr("width", width)
            .attr("height", height);
            
        const g = svgEl.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
            
        const total = Object.values(data).reduce((a, b) => a + b, 0);
        const stack = d3.stack()
            .keys(Object.keys(colors))
            .value((_, key) => (data[key] / total) * 100);
            
        const series = stack([data]);
            
        const x = d3.scaleLinear()
            .domain([0, 100])
            .range([0, chartWidth]);
            
        // Add bars with transition
        g.selectAll("g")
            .data(series)
            .join("g")
            .attr("fill", (d) => colors[d.key as keyof typeof colors])
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("y", 20)
            .attr("height", 60)
            .attr("x", d => x(d[0]))
            .attr("width", d => x(d[1]) - x(d[0]))
            .attr("cursor", "pointer")
            .on("click", (event, d) => {
                const key = (d as any).data.key;
                dispatch('barClick', {
                    sentiment: key,
                    value: data[key],
                    percentage: ((data[key] / total) * 100)
                });
            });
            
        // Add percentage labels
        g.selectAll(".label")
            .data(series)
            .join("text")
            .attr("class", "label")
            .attr("y", 100)
            .attr("x", d => x(d[0][0] + (d[0][1] - d[0][0]) / 2))
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .text(d => {
                const value = data[d.key];
                const percentage = (value / total * 100).toFixed(1);
                return `${value} (${percentage}%)`;
            })
            .attr("fill", "#666")
            .style("font-size", "12px")
            .style("font-family", "system-ui");
            
        // Add legend
        const legend = svgEl.append("g")
            .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);
            
        legend.selectAll("g")
            .data(Object.entries(colors))
            .join("g")
            .attr("transform", (d, i) => `translate(0, ${i * 25})`)
            .call(g => {
                g.append("rect")
                    .attr("width", 18)
                    .attr("height", 18)
                    .attr("fill", d => d[1])
                    .attr("rx", 2);
                    
                g.append("text")
                    .attr("x", 24)
                    .attr("y", 9)
                    .attr("dy", "0.35em")
                    .text(d => d[0].replace(/([A-Z])/g, ' $1').trim())
                    .style("font-size", "12px")
                    .style("font-family", "system-ui");
            });
            
        // Add x-axis
        g.append("g")
            .attr("transform", `translate(0,${100})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`));
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