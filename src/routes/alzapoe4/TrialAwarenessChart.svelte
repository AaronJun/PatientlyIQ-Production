<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { generateTrialAwarenessData } from '$lib/data/diseaseTrialAwareness';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';

    export let selectedDisease: string;
    
    let svg: SVGElement;
    let container: HTMLDivElement;
    let width: number;
    let height: number;
    let activeView = 'volume';
    
    $: data = generateTrialAwarenessData(selectedDisease);
    $: if (data && svg && width && height) createChart();

    const margin = { top: 40, right: 120, bottom: 60, left: 80 };
    const colors = {
        volume: "#0891b2",
        relative: "#0891b2",
        baseline: "#94a3b8"
    };

    onMount(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                width = entry.contentRect.width;
                height = 400;
            }
        });
        
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    });

    function createChart() {
        d3.select(svg).selectAll("*").remove();
        
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const svgEl = d3.select(svg)
            .attr("width", width)
            .attr("height", height);

        const g = svgEl.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        if (activeView === 'volume') {
            createVolumeChart(g, chartWidth, chartHeight);
        } else {
            createRelativeChart(g, chartWidth, chartHeight);
        }
    }

    function createVolumeChart(g: d3.Selection<SVGGElement, unknown, null, undefined>, chartWidth: number, chartHeight: number) {
        const x = d3.scaleBand()
            .domain(data.searchVolumes.map(d => d.category))
            .range([0, chartWidth])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data.searchVolumes, d => d.volume) * 1.1])
            .range([chartHeight, 0]);

        // Add bars
        g.selectAll(".bar")
            .data(data.searchVolumes)
            .join("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.category))
            .attr("y", d => y(d.volume))
            .attr("width", x.bandwidth())
            .attr("height", d => chartHeight - y(d.volume))
            .attr("fill", colors.volume)
            .attr("rx", 4);

        // Add volume labels
        g.selectAll(".volume-label")
            .data(data.searchVolumes)
            .join("text")
            .attr("class", "volume-label")
            .attr("x", d => (x(d.category) || 0) + x.bandwidth() / 2)
            .attr("y", d => y(d.volume) - 10)
            .attr("text-anchor", "middle")
            .attr("fill", "currentColor")
            .attr("font-family", "IBM Plex Mono, monospace")
            .attr("font-size", "12px")
            .text(d => d.volume.toLocaleString());

        // Add axes
        const xAxis = g.append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(d3.axisBottom(x))
            .call(g => g.selectAll(".domain").attr("stroke", "currentColor"))
            .call(g => g.selectAll(".tick line").attr("stroke", "currentColor"))
            .call(g => g.selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("font-family", "IBM Plex Mono, monospace")
                .attr("font-size", "12px")
                .attr("fill", "currentColor"));

        const yAxis = g.append("g")
            .call(d3.axisLeft(y).ticks(5))
            .call(g => g.selectAll(".domain").attr("stroke", "currentColor"))
            .call(g => g.selectAll(".tick line")
                .attr("stroke", "currentColor")
                .attr("stroke-dasharray", "2,2"))
            .call(g => g.selectAll("text")
                .attr("font-family", "IBM Plex Mono, monospace")
                .attr("font-size", "12px")
                .attr("fill", "currentColor"));
    }

    function createRelativeChart(g: d3.Selection<SVGGElement, unknown, null, undefined>, chartWidth: number, chartHeight: number) {
        const x = d3.scaleBand()
            .domain(data.searchVolumes.map(d => d.category))
            .range([0, chartWidth])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([chartHeight, 0]);

        // Add bars
        g.selectAll(".bar")
            .data(data.searchVolumes)
            .join("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.category))
            .attr("y", d => y(d.percentageOfTotal))
            .attr("width", x.bandwidth())
            .attr("height", d => chartHeight - y(d.percentageOfTotal))
            .attr("fill", colors.relative)
            .attr("rx", 4);

        // Add percentage labels
        g.selectAll(".percentage-label")
            .data(data.searchVolumes)
            .join("text")
            .attr("class", "percentage-label")
            .attr("x", d => (x(d.category) || 0) + x.bandwidth() / 2)
            .attr("y", d => y(d.percentageOfTotal) - 10)
            .attr("text-anchor", "middle")
            .attr("fill", "currentColor")
            .attr("font-family", "IBM Plex Mono, monospace")
            .attr("font-size", "12px")
            .text(d => `${d.percentageOfTotal.toFixed(1)}%`);

        // Add axes
        const xAxis = g.append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(d3.axisBottom(x))
            .call(g => g.selectAll(".domain").attr("stroke", "currentColor"))
            .call(g => g.selectAll(".tick line").attr("stroke", "currentColor"))
            .call(g => g.selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("font-family", "IBM Plex Mono, monospace")
                .attr("font-size", "12px")
                .attr("fill", "currentColor"));

        const yAxis = g.append("g")
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
            .call(g => g.selectAll(".domain").attr("stroke", "currentColor"))
            .call(g => g.selectAll(".tick line")
                .attr("stroke", "currentColor")
                .attr("stroke-dasharray", "2,2"))
            .call(g => g.selectAll("text")
                .attr("font-family", "IBM Plex Mono, monospace")
                .attr("font-size", "12px")
                .attr("fill", "currentColor"));
    }
</script>

<Card class="w-full">
    <CardHeader>
        <CardTitle>Patient Treatment Interest Analysis</CardTitle>
    </CardHeader>
    <CardContent>
        <Tabs value={activeView} class="w-full" onValueChange={(value) => { activeView = value; createChart(); }}>
            <TabsList class="mb-6">
                <TabsTrigger value="volume">Search Volume</TabsTrigger>
                <TabsTrigger value="relative">Relative Interest</TabsTrigger>
            </TabsList>
            
            <TabsContent value="volume" class="mt-0">
                <div class="chart-container" bind:this={container}>
                    <svg bind:this={svg}></svg>
                </div>
            </TabsContent>
            
            <TabsContent value="relative" class="mt-0">
                <div class="chart-container" bind:this={container}>
                    <svg bind:this={svg}></svg>
                </div>
            </TabsContent>
        </Tabs>
    </CardContent>
</Card>

<style>
    .chart-container {
        width: 100%;
        height: 400px;
        position: relative;
    }

    :global(.bar) {
        transition: opacity 0.2s ease-in-out;
    }

    :global(.bar:hover) {
        opacity: 0.8;
    }
</style>