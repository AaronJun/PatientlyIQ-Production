<!-- ProgramFlowSankey.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
    import { hasPRVAward } from '../utils/data-processing-utils';
    
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
    
    // Enhanced types to match d3-sankey requirements
    interface SankeyNode {
        name: string;
        index?: number;
        x0?: number;
        y0?: number;
        x1?: number;
        y1?: number;
        value?: number;
    }
    
    interface SankeyLink {
        source: number | SankeyNode;
        target: number | SankeyNode;
        value: number;
        width?: number;
    }
    
    export let data: DataEntry[] = [];
    export let width = 700;
    export let height = 300;
    
    let svg: SVGSVGElement;
    let tooltip: HTMLDivElement;
    let tooltipVisible = false;
    let tooltipContent = { title: '', value: 0 };
    let tooltipPosition = { x: 0, y: 0 };
    
    function isPRVSold(entry: DataEntry): boolean {
        if (!entry) return false;
        
        // Check if Purchased is explicitly "Y"
        const isPurchased = entry.Purchased === "Y";
        
        // Check if Purchase Year exists and is not empty
        const hasPurchaseYear = typeof entry["Purchase Year"] === "string" && 
                               entry["Purchase Year"].trim() !== "";
        
        // Check if Purchaser exists and is not empty
        const hasPurchaser = typeof entry.Purchaser === "string" && 
                            entry.Purchaser.trim() !== "";
        
        return isPurchased || hasPurchaseYear || hasPurchaser;
    }
    
    function processData() {
        if (!data || data.length === 0) {
            console.log("No data available for Sankey diagram");
            return { nodes: [], links: [] };
        }
        
        // Count totals
        const totalDesignations = data.length;
        const totalPRVsAwarded = data.filter(hasPRVAward).length;
        const totalPRVsSold = data.filter(entry => hasPRVAward(entry) && isPRVSold(entry)).length;
        const unsoldPRVs = totalPRVsAwarded - totalPRVsSold;
        const ongoingDevelopment = totalDesignations - totalPRVsAwarded;
        
        console.log(`Sankey counts: ${totalDesignations} designations, ${totalPRVsAwarded} PRVs, ${totalPRVsSold} sold, ${unsoldPRVs} unsold`);
        
        // Create nodes
        const nodes: SankeyNode[] = [
            { name: "RPD Designations" },
            { name: "PRVs Awarded" },
            { name: "Ongoing Development" },
            { name: "PRVs Sold" },
            { name: "Unsold PRVs" }
        ];
        
        // Create links (using indices for source/target)
        const links: SankeyLink[] = [
            // RPD Designations (0) -> PRVs Awarded (1)
            { source: 0, target: 1, value: Math.max(1, totalPRVsAwarded) },
            // RPD Designations (0) -> Ongoing Development (2)
            { source: 0, target: 2, value: Math.max(1, ongoingDevelopment) },
            // PRVs Awarded (1) -> PRVs Sold (3)
            { source: 1, target: 3, value: Math.max(1, totalPRVsSold) },
            // PRVs Awarded (1) -> Unsold PRVs (4)
            { source: 1, target: 4, value: Math.max(1, unsoldPRVs) }
        ];
        
        return { nodes, links };
    }
    
    function renderSankey() {
        if (!svg) return;
        
        try {
            // Clear existing content
            d3.select(svg).selectAll("*").remove();
            
            // Process data for the Sankey diagram
            const { nodes, links } = processData();
            
            if (nodes.length === 0 || links.length === 0) {
                console.warn("No data available to render Sankey diagram");
                return;
            }
            
            // Set up the Sankey layout generator
            const sankeyLayout = sankey()
                .nodeWidth(30)
                .nodePadding(20)
                .extent([[20, 10], [width - 20, height - 10]]);
            
            // Apply the layout
            const sankeyData = sankeyLayout({
                nodes: nodes.map(d => Object.assign({}, d)),
                links: links.map(d => Object.assign({}, d))
            });
            
            // Create the SVG container
            const svgSelection = d3.select(svg)
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "xMidYMid meet");
            
            // Color scale for nodes - ensuring returns a string
            const colorScale = d3.scaleOrdinal<string>()
                .domain(["source", "middle", "end"])
                .range(["#4f46e5", "#0d9488", "#0891b2"]);
            
            // Node categories
            const nodeCategories = ["source", "middle", "end", "end", "end"];
            
            // Draw the links
            svgSelection.append("g")
                .selectAll("path")
                .data(sankeyData.links)
                .enter()
                .append("path")
                .attr("d", sankeyLinkHorizontal())
                .attr("stroke-width", d => Math.max(1, d.width || 0))
                .attr("stroke", (d) => {
                    const sourceNode = typeof d.source === "object" ? d.source : sankeyData.nodes[+d.source];
                    const sourceIdx = sankeyData.nodes.indexOf(sourceNode);
                    const sourceCategory = nodeCategories[sourceIdx] || "end";
                    const colorValue = colorScale(sourceCategory);
                    return d3.color(colorValue)?.brighter(0.5).toString() || "#ccc";
                })
                .attr("fill", "none")
                .attr("stroke-opacity", 0.5)
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("stroke-opacity", 0.8);
                    
                    const sourceNode = typeof d.source === "object" ? d.source : sankeyData.nodes[+d.source];
                    const targetNode = typeof d.target === "object" ? d.target : sankeyData.nodes[+d.target];
                    
                    tooltipContent = { 
                        title: `${sourceNode.name} → ${targetNode.name}`,
                        value: d.value 
                    };
                    tooltipPosition = { x: event.pageX, y: event.pageY };
                    tooltipVisible = true;
                })
                .on("mousemove", function(event) {
                    tooltipPosition = { x: event.pageX, y: event.pageY };
                })
                .on("mouseout", function() {
                    d3.select(this).attr("stroke-opacity", 0.5);
                    tooltipVisible = false;
                });
            
            // Draw the nodes
            svgSelection.append("g")
                .selectAll("rect")
                .data(sankeyData.nodes)
                .enter()
                .append("rect")
                .attr("x", d => d.x0 || 0)
                .attr("y", d => d.y0 || 0)
                .attr("height", d => (d.y1 || 0) - (d.y0 || 0))
                .attr("width", d => (d.x1 || 0) - (d.x0 || 0))
                .attr("fill", (d, i) => {
                    const category = nodeCategories[i] || "end";
                    return colorScale(category);
                })
                .attr("stroke", (d, i) => {
                    const category = nodeCategories[i] || "end";
                    const colorValue = colorScale(category);
                    return d3.color(colorValue)?.darker().toString() || "#000";
                })
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("stroke-width", 2);
                    
                    tooltipContent = {
                        title: d.name,
                        value: d.value || 0
                    };
                    tooltipPosition = { x: event.pageX, y: event.pageY };
                    tooltipVisible = true;
                })
                .on("mouseout", function() {
                    d3.select(this).attr("stroke-width", 1);
                    tooltipVisible = false;
                });
            
            // Add node labels
            svgSelection.append("g")
                .selectAll("text")
                .data(sankeyData.nodes)
                .enter()
                .append("text")
                .attr("x", d => {
                    const i = sankeyData.nodes.indexOf(d);
                    if (i === 0) return (d.x0 || 0) - 6; // source
                    if (i === 1) return ((d.x0 || 0) + (d.x1 || 0)) / 2; // middle
                    return (d.x1 || 0) + 6; // end nodes
                })
                .attr("y", d => {
                    const i = sankeyData.nodes.indexOf(d);
                    if (i === 1) return (d.y0 || 0) - 10; // middle node (above)
                    return ((d.y0 || 0) + (d.y1 || 0)) / 2; // other nodes (centered)
                })
                .attr("text-anchor", d => {
                    const i = sankeyData.nodes.indexOf(d);
                    if (i === 0) return "end"; // source
                    if (i === 1) return "middle"; // middle
                    return "start"; // end nodes
                })
                .attr("dy", "0.35em")
                .attr("font-size", "12px")
                .attr("fill", "#333")
                .attr("font-weight", "bold")
                .text(d => `${d.name} (${d.value || 0})`);
                
        } catch (error) {
            console.error("Error rendering Sankey diagram:", error);
        }
    }
    
    // Initialize on mount
    onMount(() => {
        if (data) {
            renderSankey();
        }
        
        const handleResize = () => {
            renderSankey();
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });
    
    // Reactively render when data or svg changes
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