<!-- TherapeuticAreaWaffleChart.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
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
    export let maxCols = 20;
    export let cellSize = 12;
    export let cellPadding = 4;
    export let borderRadius = 50;
    export let onAreaClick = (area: string) => {};
    
    let svg: SVGSVGElement;
    let tooltip: HTMLDivElement;
    let tooltipContent = { area: '', indication: '', count: 0 };
    let tooltipVisible = false;
    let tooltipPosition = { x: 0, y: 0 };
    let isMobile = false;
    
    // Base color map for therapeutic areas
    const baseColorMap: Record<string, string> = {
        'Neurology': '#FF6B6B',
        'Neuromuscular': '#E63946',
        'Oncology': '#38B2AC',
        'Metabolic': '#667EEA',
        'Ophthalmology': '#68D391',
        'Cardiovascular': '#F6AD55',
        'Pulmonology': '#B794F4',
        'Hematology': '#48BB78',
        'Endocrinology': '#F59E0B',
        'Genetic': '#0BC5EA',
        'Immunology': '#E53E3E',
        'Gastroenterology': '#ECC94B',
        'Hepatology': '#9AE6B4',
        'Dermatology': '#FC8181',
        'Neonatology': '#76E4F7',
        'Urology': '#9F7AEA'
    };
    
    // Generate color variations for indications within each therapeutic area
    function generateColorVariations(baseColor: string, count: number): string[] {
        const hslColor = d3.hsl(baseColor);
        const variations: string[] = [];
        
        // For a single indication, just return the base color
        if (count <= 1) {
            return [baseColor];
        }
        
        // Create variations by slightly adjusting lightness and saturation
        for (let i = 0; i < count; i++) {
            const saturationAdjust = (i % 3) * 0.1 - 0.1; // -0.1, 0, 0.1
            const lightnessAdjust = Math.floor(i / 3) * 0.1 - 0.1; // -0.1, 0, 0.1, 0.2
            
            const newSaturation = Math.max(0.1, Math.min(1, hslColor.s + saturationAdjust));
            const newLightness = Math.max(0.2, Math.min(0.8, hslColor.l + lightnessAdjust));
            
            const newColor = d3.hsl(
                hslColor.h,
                newSaturation,
                newLightness
            ).toString();
            
            variations.push(newColor);
        }
        
        return variations;
    }
    
    // Process data to count drugs by therapeutic area and indications
    function processData(entries: DataEntry[]) {
        // Count occurrences of each therapeutic area
        const areaData = new Map<string, {
            count: number;
            indications: Map<string, number>;
            entries: DataEntry[];
        }>();
        
        entries.forEach(entry => {
            if (entry.TherapeuticArea1) {
                const area = entry.TherapeuticArea1;
                const indication = entry.Indication || 'Unknown';
                
                if (!areaData.has(area)) {
                    areaData.set(area, {
                        count: 0,
                        indications: new Map<string, number>(),
                        entries: []
                    });
                }
                
                const areaInfo = areaData.get(area)!;
                areaInfo.count++;
                areaInfo.entries.push(entry);
                
                areaInfo.indications.set(
                    indication,
                    (areaInfo.indications.get(indication) || 0) + 1
                );
            }
        });
        
        // Convert to array and sort by count (descending)
        const sortedData = Array.from(areaData.entries())
            .map(([area, info]) => ({
                area,
                count: info.count,
                indications: Array.from(info.indications.entries())
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count),
                entries: info.entries
            }))
            .sort((a, b) => b.count - a.count);
        
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
        
        // Create color maps for each area with variations for indications
        const areaColorMaps = new Map<string, Map<string, string>>();
        
        processedData.forEach(areaData => {
            const area = areaData.area;
            const baseColor = baseColorMap[area] || '#999999';
            const indicationsCount = areaData.indications.length;
            
            const colorVariations = generateColorVariations(baseColor, indicationsCount);
            const indicationColorMap = new Map<string, string>();
            
            areaData.indications.forEach((indication, index) => {
                indicationColorMap.set(
                    indication.name,
                    colorVariations[Math.min(index, colorVariations.length - 1)]
                );
            });
            
            areaColorMaps.set(area, indicationColorMap);
        });
            
        // Calculate total count and number of cells needed
        const totalCount = processedData.reduce((sum, d) => sum + d.count, 0);
        
        // Adjust maxCols for mobile
        const responsiveMaxCols = isMobile ? Math.min(6, maxCols) : maxCols;
        const smallScreen = window.innerWidth < 1000;
        const responsiveCellSize = smallScreen ? 8 : (isMobile ? Math.max(8, cellSize - 4) : cellSize);
        const responsiveCellPadding = isMobile ? Math.max(2, cellPadding - 2) : (smallScreen ? 3 : cellPadding);
        
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
        
        // Draw cells for each area
        processedData.forEach((areaData) => {
            const { area, entries } = areaData;
            const indicationColorMap = areaColorMaps.get(area) || new Map<string, string>();
            const baseColor = baseColorMap[area] || '#999999';
            
            // Draw one cell for each entry with indication-specific color
            entries.forEach(entry => {
                const indication = entry.Indication || 'Unknown';
                const color = indicationColorMap.get(indication) || baseColor;
                
                const x = currentCol * (responsiveCellSize + responsiveCellPadding);
                const y = currentRow * (responsiveCellSize + responsiveCellPadding);
                
                const cell = svgSelection.append('rect')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', responsiveCellSize)
                    .attr('height', responsiveCellSize)
                    .attr('rx', isMobile ? borderRadius / 2 : borderRadius)
                    .attr('ry', isMobile ? borderRadius / 2 : borderRadius)
                    .attr('fill', color)
                    .attr('stroke', 'white')
                    .attr('stroke-width', isMobile ? 0.3 : 0.5)
                    .attr('class', 'waffle-cell')
                    .attr('data-area', area)
                    .attr('data-indication', indication)
                    .attr('data-count', areaData.count);
                    
                // Add mouseover events
                cell.on('mouseover', function(event) {
                    const hoveredArea = d3.select(this).attr('data-area');
                    const hoveredIndication = d3.select(this).attr('data-indication');
                    const hoveredCount = d3.select(this).attr('data-count');
                    
                    // Highlight all cells of the same area and indication
                    d3.selectAll(`.waffle-cell[data-area="${hoveredArea}"][data-indication="${hoveredIndication}"]`)
                        .attr('stroke', '#333')
                        .attr('stroke-width', isMobile ? 1 : 1.5);
                        
                    // Update tooltip
                    tooltipContent = { 
                        area: hoveredArea, 
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
                    const hoveredArea = d3.select(this).attr('data-area');
                    const hoveredIndication = d3.select(this).attr('data-indication');
                    
                    // Remove highlight
                    d3.selectAll(`.waffle-cell[data-area="${hoveredArea}"][data-indication="${hoveredIndication}"]`)
                        .attr('stroke', 'white')
                        .attr('stroke-width', isMobile ? 0.3 : 0.5);
                        
                    tooltipVisible = false;
                })
                .on('click', function() {
                    const clickedArea = d3.select(this).attr('data-area');
                    onAreaClick(clickedArea);
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

<div class="waffle-chart-container">
    <div class="chart-area">
        <svg bind:this={svg}></svg>
    </div>
    
    <div class="legend-sidebar">
        {#each processData(data) as area}
            <div 
                class="legend-item" 
                on:click={() => onAreaClick(area.area)}
            >
                <div 
                    class="legend-color" 
                    style="background-color: {baseColorMap[area.area] || '#999999'};"
                ></div>
                <span class="legend-text">{area.area} ({area.count})</span>
            </div>
        {/each}
    </div>
    
    {#if tooltipVisible}
        <div 
            bind:this={tooltip} 
            class="tooltip" 
            style="left: {tooltipPosition.x + 10}px; top: {tooltipPosition.y - 10}px; opacity: {tooltipVisible ? 1 : 0};"
        >
            <div class="tooltip-content">
                <div class="tooltip-title">{tooltipContent.area}</div>
                <div class="tooltip-indication">{tooltipContent.indication}</div>
                <div class="tooltip-value">{tooltipContent.count} drug candidates</div>
            </div>
        </div>
    {/if}
</div>

<style>
    .waffle-chart-container {
        position: relative;
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 100%;
        gap: 8px;
    }
    
    .chart-area {
        flex: 1;
        min-width: 0; /* Prevents flex items from overflowing */
    }
    
    .legend-sidebar {
        width: 200px;
        border-left: 1px solid #eee;
        max-height: 100%;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        padding: 0.5rem;
        gap: 0.5rem;
    }
    
    .legend-item {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
    }
    
    .legend-item:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }
    
    .legend-color {
        width: 8px;
        height: 8px;
        border-radius: 10px;
        margin-right: 2px;
        flex-shrink: 0;
    }
    
    .legend-text {
        font-size: 9.25px;
        color: #333;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
    
    @media (max-width: 767px) {
        .waffle-chart-container {
            flex-direction: column;
            gap: 10px;
        }
        
        .legend-sidebar {
            width: 100%;
            border-left: none;
            border-top: 1px solid #eee;
            grid-template-columns: repeat(3, 1fr);
        }
        
        .legend-item {
            padding: 3px;
        }
        
        .legend-text {
            font-size: 8px;
        }
        
        .tooltip {
            padding: 6px;
            font-size: 10px;
        }
    }
    
    @media (max-width: 480px) {
        .legend-sidebar {
            grid-template-columns: repeat(2, 1fr);
        }
    }
</style> 