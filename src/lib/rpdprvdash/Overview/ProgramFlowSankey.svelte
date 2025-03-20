<!-- ProgramFlowSankey.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
    
    interface DataEntry {
        Company: string;
        Candidate: string;
        TherapeuticArea1: string;
        Indication: string;
        "Current Development Stage": string;
        "PRV Year": string;
        "Purchase Year": string;
        Purchased?: string;
        Purchaser: string;
        "Sale Price (USD Millions)": string;
        MarketCap?: string;
        effectiveStage?: string;
        "RPDD Year"?: string;
        "RPDD Date"?: string;
        "PRV Date"?: string;
        [key: string]: any;
    }
    
    export let data: DataEntry[] = [];
    export let width = 700;
    export let height = 300;
    
    let svg: SVGSVGElement;
    let tooltip: HTMLDivElement;
    let tooltipVisible = false;
    let tooltipContent = { title: '', value: 0 };
    let tooltipPosition = { x: 0, y: 0 };
    
    function hasPRVAward(entry: DataEntry): boolean {
        return !!entry["PRV Year"] || entry["PRV Status"] === "PRV Awarded" || !!entry["PRV Date"];
    }
    
    function isPRVSold(entry: DataEntry): boolean {
        return entry.Purchased === "Y" || !!entry["Purchase Year"] || !!entry.Purchaser;
    }
    
    function processData(entries: DataEntry[]) {
        // Count totals
        const totalDesignations = entries.length;
        const totalPRVsAwarded = entries.filter(hasPRVAward).length;
        const totalPRVsSold = entries.filter(isPRVSold).length;
        const unsolPRVs = totalPRVsAwarded - totalPRVsSold;
        const nonPRVs = totalDesignations - totalPRVsAwarded;
        
        // Create nodes
        const nodes = [
            { id: "RPD Designations", name: "RPD Designations", category: "source" },
            { id: "PRVs Awarded", name: "PRVs Awarded", category: "middle" },
            { id: "Ongoing Development", name: "Ongoing Development", category: "end" },
            { id: "PRVs Sold", name: "PRVs Sold", category: "end" },
            { id: "Unsold PRVs", name: "Unsold PRVs", category: "end" }
        ];
        
        // Create links
        const links = [
            { source: "RPD Designations", target: "PRVs Awarded", value: totalPRVsAwarded },
            { source: "RPD Designations", target: "Ongoing Development", value: nonPRVs },
            { source: "PRVs Awarded", target: "PRVs Sold", value: totalPRVsSold },
            { source: "PRVs Awarded", target: "Unsold PRVs", value: unsolPRVs }
        ];
        
        return { nodes, links };
    }
    
    function renderSankey() {
        if (!svg || !data || data.length === 0) return;
        
        // Process the data
        const { nodes, links } = processData(data);
        
        // Clear previous content
        d3.select(svg).selectAll('*').remove();
        
        // Set up the Sankey generator
        const sankeyGenerator = sankey()
            .nodeWidth(30)
            .nodePadding(20)
            .extent([[20, 10], [width - 20, height - 10]]);
        
        // Format the data for d3-sankey
        const graph = sankeyGenerator({
            nodes: nodes.map(d => Object.assign({}, d)),
            links: links.map(d => Object.assign({}, d))
        });
        
        // Color scale based on node category
        const colorScale = d3.scaleOrdinal<string>()
            .domain(["source", "middle", "end"])
            .range(["#4f46e5", "#0d9488", "#0891b2"]);
        
        // Create the SVG container
        const svgSelection = d3.select(svg)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');
        
        // Add the links (flow paths)
        const link = svgSelection.append('g')
            .selectAll('path')
            .data(graph.links)
            .join('path')
            .attr('d', sankeyLinkHorizontal())
            .attr('fill', 'none')
            .attr('stroke', d => {
                const sourceNode = nodes.find(n => n.id === d.source.id);
                return d3.color(colorScale(sourceNode?.category || "source"))?.brighter(0.5).toString() || '#ccc';
            })
            .attr('stroke-width', d => Math.max(1, d.width))
            .attr('stroke-opacity', 0.5)
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('stroke-opacity', 0.8);
                
                // Update tooltip
                tooltipContent = { 
                    title: `${d.source.name} → ${d.target.name}`,
                    value: d.value
                };
                tooltipPosition = { x: event.pageX, y: event.pageY };
                tooltipVisible = true;
            })
            .on('mousemove', function(event) {
                tooltipPosition = { x: event.pageX, y: event.pageY };
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('stroke-opacity', 0.5);
                
                tooltipVisible = false;
            });
        
        // Add the nodes (rectangles)
        const node = svgSelection.append('g')
            .selectAll('rect')
            .data(graph.nodes)
            .join('rect')
            .attr('x', d => d.x0)
            .attr('y', d => d.y0)
            .attr('height', d => d.y1 - d.y0)
            .attr('width', d => d.x1 - d.x0)
            .attr('fill', d => colorScale(d.category))
            .attr('stroke', d => d3.color(colorScale(d.category))?.darker().toString() || '#000')
            .on('mouseover', function(event, d) {
                // Highlight the node
                d3.select(this)
                    .attr('stroke-width', 2);
                
                // Highlight connected links
                link.filter(l => l.source.id === d.id || l.target.id === d.id)
                    .attr('stroke-opacity', 0.8)
                    .attr('stroke-width', l => Math.max(2, l.width));
                
                // Update tooltip
                tooltipContent = { 
                    title: d.name,
                    value: d.value
                };
                tooltipPosition = { x: event.pageX, y: event.pageY };
                tooltipVisible = true;
            })
            .on('mousemove', function(event) {
                tooltipPosition = { x: event.pageX, y: event.pageY };
            })
            .on('mouseout', function(event, d) {
                // Reset node highlighting
                d3.select(this)
                    .attr('stroke-width', 1);
                
                // Reset link highlighting
                link.filter(l => l.source.id === d.id || l.target.id === d.id)
                    .attr('stroke-opacity', 0.5)
                    .attr('stroke-width', l => Math.max(1, l.width));
                
                tooltipVisible = false;
            });
        
        // Add node labels
        svgSelection.append('g')
            .selectAll('text')
            .data(graph.nodes)
            .join('text')
            .attr('x', d => (d.category === 'source' ? d.x0 - 6 : (d.category === 'end' ? d.x1 + 6 : (d.x0 + d.x1) / 2)))
            .attr('y', d => (d.y1 + d.y0) / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', d => d.category === 'source' ? 'end' : (d.category === 'end' ? 'start' : 'middle'))
            .text(d => `${d.name} (${d.value})`)
            .attr('font-size', '12px')
            .attr('fill', '#333')
            .attr('font-weight', 'bold')
            .each(function(d) {
                // For middle nodes, adjust the position for better readability
                if (d.category === 'middle') {
                    d3.select(this)
                        .attr('y', d.y0 - 10)
                        .attr('text-anchor', 'middle');
                }
            });
    }
    
    onMount(() => {
        renderSankey();
        
        // Add resize event listener for responsiveness
        const handleResize = () => {
            renderSankey();
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });
    
    $: if (data && svg) {
        renderSankey();
    }
</script>

<div class="program-flow-sankey">
    <svg bind:this={svg}></svg>
    
    {#if tooltipVisible}
        <div 
            bind:this={tooltip} 
            class="tooltip" 
            style="left: {tooltipPosition.x + 10}px; top: {tooltipPosition.y - 10}px; opacity: {tooltipVisible ? 1 : 0};"
        >
            <div class="tooltip-title">{tooltipContent.title}</div>
            <div class="tooltip-value">{tooltipContent.value} Drug candidates</div>
        </div>
    {/if}
</div>

<style>
    .program-flow-sankey {
        position: relative;
        width: 100%;
        margin: 0 auto;
    }
    
    .tooltip {
        position: fixed;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 8px;
        font-size: 12px;
        pointer-events: none;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        z-index: 100;
        transition: opacity 0.2s;
    }
    
    .tooltip-title {
        font-weight: bold;
        margin-bottom: 3px;
    }
    
    .tooltip-value {
        color: #666;
    }
</style> 