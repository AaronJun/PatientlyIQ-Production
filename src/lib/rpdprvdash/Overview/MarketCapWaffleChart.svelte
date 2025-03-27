<!-- MarketCapWaffleChart.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import WaffleChartLegend from './WaffleChartLegend.svelte';
    
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
    export let width = 800;
    export let height = 400;
    export let maxCols = 25;
    export let cellSize = 10;
    export let cellPadding = 4;
    export let borderRadius = 50;
    export let onMarketCapClick = (marketCap: string) => {};
    export let showLegend = true;
    export let legendTitle = "Company Sizes at Time of RPD Designation";
    
    let svg: SVGSVGElement;
    let tooltip: HTMLDivElement;
    let tooltipContent = { marketCap: '', indication: '', count: 0 };
    let tooltipVisible = false;
    let tooltipPosition = { x: 0, y: 0 };
    let isMobile = false;
    let legendData: { id: string; label: string; count: number; color: string }[] = [];
    
    // Base color map for market cap categories
    const baseColorMap: Record<string, string> = {
        'Small': '#4299E1',     // Blue
        'Mid': '#38A169',       // Green
        'Large': '#ED8936',     // Orange
        'Mega': '#9F7AEA',      // Purple
        'Advocacy': '#F56565',  // Red
        'Government': '#667EEA', // Indigo
        'Academic': '#ECC94B',  // Yellow
        'Subsidiary': '#76E4F7' // Cyan
    };
    
    // Process data to count drugs by market cap and indications
    function processData(entries: DataEntry[]) {
        // Count occurrences of each market cap category
        const marketCapData = new Map<string, {
            count: number;
            indications: Map<string, number>;
            entries: DataEntry[];
        }>();
        
        entries.forEach(entry => {
            if (entry.MarketCap) {
                const marketCap = entry.MarketCap;
                const indication = entry.Indication || 'Unknown';
                
                if (!marketCapData.has(marketCap)) {
                    marketCapData.set(marketCap, {
                        count: 0,
                        indications: new Map<string, number>(),
                        entries: []
                    });
                }
                
                const capInfo = marketCapData.get(marketCap)!;
                capInfo.count++;
                capInfo.entries.push(entry);
                
                capInfo.indications.set(
                    indication,
                    (capInfo.indications.get(indication) || 0) + 1
                );
            }
        });
        
        // Convert to array and sort by count (descending)
        const sortedData = Array.from(marketCapData.entries())
            .map(([marketCap, info]) => ({
                marketCap,
                count: info.count,
                indications: Array.from(info.indications.entries())
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count),
                entries: info.entries
            }))
            .sort((a, b) => b.count - a.count);
        
        // Update legend data
        legendData = sortedData.map(item => ({
            id: item.marketCap,
            label: item.marketCap,
            count: item.count,
            color: baseColorMap[item.marketCap] || '#999999'
        }));
        
        return sortedData;
    }
    
    function renderWaffleChart() {
        if (!svg || !data || data.length === 0) return;
        
        // Check for mobile screen
        checkMobileScreen();
        
        // Process the data
        const processedData = processData(data);
        
        // Clear previous content
        d3.select(svg).selectAll('*').remove();
        
        // Calculate total count and number of cells needed
        const totalCount = processedData.reduce((sum, d) => sum + d.count, 0);
        
        // Calculate optimal number of columns based on available width
        const containerWidth = svg.parentElement?.clientWidth || width;
        const minCellSize = isMobile ? 8 : Math.max(12, Math.min(24, Math.floor(containerWidth / 40)));
        const minCellPadding = isMobile ? 2 : Math.max(3, Math.min(6, Math.floor(containerWidth / 100)));
        const optimalCols = Math.max(
            Math.floor(containerWidth / (minCellSize + minCellPadding)),
            isMobile ? 4 : 8
        );
        
        // Use the smaller of optimal columns or max columns
        const responsiveMaxCols = Math.min(optimalCols, maxCols);
        const smallScreen = window.innerWidth < 1000;
        const responsiveCellSize = smallScreen ? 16 : (isMobile ? Math.max(10, cellSize - 4) : Math.max(22, cellSize));
        const responsiveCellPadding = isMobile ? Math.max(2, cellPadding - 2) : (smallScreen ? 3 : Math.max(4, cellPadding));
        
        const totalCells = responsiveMaxCols * Math.ceil(totalCount / responsiveMaxCols);
        
        // Calculate grid dimensions
        const rows = Math.ceil(totalCells / responsiveMaxCols);
        const adjustedWidth = Math.min(width, (responsiveCellSize + responsiveCellPadding) * responsiveMaxCols);
        const adjustedHeight = Math.min(height, (responsiveCellSize + responsiveCellPadding) * rows);
        
        // Create SVG
        const svgSelection = d3.select(svg)
            .attr('width', adjustedWidth)
            .attr('height', adjustedHeight)
            .attr('viewBox', `0 0 ${adjustedWidth} ${adjustedHeight}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');
            
        // Track current position in the grid
        let currentRow = 0;
        let currentCol = 0;
        
        // Draw cells for each market cap
        processedData.forEach((capData) => {
            const { marketCap, entries } = capData;
            const baseColor = baseColorMap[marketCap] || '#999999';
            
            // Draw one cell for each entry with the same color for all entries in this category
            entries.forEach(entry => {
                const indication = entry.Indication || 'Unknown';
                
                const x = currentCol * (responsiveCellSize + responsiveCellPadding);
                const y = currentRow * (responsiveCellSize + responsiveCellPadding);
                
                const cell = svgSelection.append('rect')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', responsiveCellSize)
                    .attr('height', responsiveCellSize)
                    .attr('rx', isMobile ? borderRadius / 2 : borderRadius)
                    .attr('ry', isMobile ? borderRadius / 2 : borderRadius)
                    .attr('fill', baseColor)
                    
                    .attr('class', 'waffle-cell')
                    .attr('data-market-cap', marketCap)
                    .attr('data-indication', indication)
                    .attr('data-count', capData.count)
                    .attr('data-company', entry.Company || '');
                    
                // Add mouseover events
                cell.on('mouseover', function(event) {
                    const hoveredCap = d3.select(this).attr('data-market-cap');
                    const hoveredIndication = d3.select(this).attr('data-indication');
                    const hoveredCount = d3.select(this).attr('data-count');
                    const hoveredCompany = d3.select(this).attr('data-company');
                    
                    // Highlight all cells of the same market cap
                    d3.selectAll(`.waffle-cell[data-market-cap="${hoveredCap}"]`)
                        .attr('stroke', '#333')
                        .attr('stroke-width', isMobile ? 1 : 1.5);
                        
                    // Update tooltip
                    tooltipContent = { 
                        marketCap: hoveredCap,
                        indication: hoveredIndication,
                        count: parseInt(hoveredCount) 
                    };
                    tooltipPosition = { x: event.pageX, y: event.pageY };
                    tooltipVisible = true;
                })
                .on('mousemove', function(event) {
                    tooltipPosition = { x: event.pageX, y: event.pageY };
                })
                .on('mouseout', function() {
                    const hoveredCap = d3.select(this).attr('data-market-cap');
                    
                    // Remove highlight from all cells of the same market cap
                    d3.selectAll(`.waffle-cell[data-market-cap="${hoveredCap}"]`)
                        .attr('stroke', 'white')
                        .attr('stroke-width', isMobile ? 0.3 : 0.5);
                        
                    tooltipVisible = false;
                })
                .on('click', function() {
                    const clickedCap = d3.select(this).attr('data-market-cap');
                    onMarketCapClick(clickedCap);
                });
                
                // Update position
                currentCol++;
                if (currentCol >= responsiveMaxCols) {
                    currentCol = 0;
                    currentRow++;
                }
            });
        });
    }
    
    function checkMobileScreen() {
        isMobile = window.innerWidth < 768;
    }
    
    function handleResize() {
        const wasMobile = isMobile;
        checkMobileScreen();
        if (wasMobile !== isMobile || window.innerWidth < 1000) {
            renderWaffleChart();
        }
    }
    
    function handleLegendItemClick(marketCap: string) {
        onMarketCapClick(marketCap);
    }
    
    onMount(() => {
        checkMobileScreen();
        renderWaffleChart();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });
    
    $: if (data && svg) {
        renderWaffleChart();
    }
</script>

<div class="waffle-chart-container flex flex-col w-fit gap-4 lg:gap-8 md:px-8">
    <div class="chart-area w-full">
        <svg bind:this={svg}></svg>
    </div>
    
    {#if showLegend}
        <div class="legend-container md:w-fit">
            <WaffleChartLegend 
                legendItems={legendData} 
                onItemClick={handleLegendItemClick}
                title={legendTitle}
            />
        </div>
    {/if}
    
    {#if tooltipVisible}
        <div 
            bind:this={tooltip} 
            class="tooltip" 
            style="left: {tooltipPosition.x + 10}px; top: {tooltipPosition.y - 10}px; opacity: {tooltipVisible ? 1 : 0};"
        >
            <div class="tooltip-content">
                <div class="tooltip-title">{tooltipContent.marketCap}</div>
                <div class="tooltip-indication">{tooltipContent.indication}</div>
                <div class="tooltip-value">{tooltipContent.count} drug candidates</div>
            </div>
        </div>
    {/if}
</div>

<style>
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
    
    .tooltip-indication {
        font-style: italic;
        color: #444;
        margin-bottom: 3px;
    }
    
    .tooltip-value {
        color: #666;
    }
    
    :global(.waffle-cell) {
        transition: opacity 0.2s, stroke 0.2s;
        cursor: pointer;
    }
    
    :global(.waffle-cell:hover) {
        opacity: 0.9;
    }
    
</style> 