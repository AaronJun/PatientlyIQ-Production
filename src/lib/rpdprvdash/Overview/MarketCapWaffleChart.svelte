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
    let tooltipContent = { 
        marketCap: '', 
        companyName: '',
        companyCount: 0,
        entryCount: 0
    };
    let tooltipVisible = false;
    let tooltipPosition = { x: 0, y: 0 };
    let isMobile = false;
    let legendData: { id: string; label: string; count: number; color: string }[] = [];
    
    // Base color map for market cap categories with subcategory shades
    const baseColorMap: Record<string, string> = {
        // Small public companies (Blue shades)
        'Small': '#4299E1',    // Base blue
        'Nano': '#2B6CB0',     // Darker blue
        'Micro': '#63B3ED',    // Lighter blue

        // Early stage startups (Green shades)
        'Series A': '#38A169',  // Base green
        'Series B': '#2F855A',  // Darker green
        'Seed': '#48BB78',      // Lighter green
        'Grant-supported': '#68D391', // Lightest green

        // Institutional (Indigo shades)
        'Government': '#667EEA', // Base indigo
        'Academic': '#5A67D8',   // Darker indigo

        // Mega/Large/Mid (Purple shades)
        'Mega': '#9F7AEA',      // Base purple
        'Large': '#805AD5',     // Darker purple
        'Mid': '#B794F4',       // Lighter purple

        // Advocacy (Red)
        'Advocacy': '#F56565'   // Base red
    };
    
    // Process data to count drugs by market cap and indications
    function processData(entries: DataEntry[]) {
        // Count occurrences of each market cap category and track companies
        const marketCapData = new Map<string, {
            count: number;
            companies: Set<string>;
            indications: Map<string, number>;
            entries: DataEntry[];
        }>();
        
        entries.forEach(entry => {
            if (entry.MarketCap) {
                let marketCap = entry.MarketCap.trim();
                
                // Skip bankrupt companies
                if (marketCap.toLowerCase().includes('bankrupt')) {
                    return;
                }
                
                // Keep original category but ensure it's one we support
                if (Object.keys(baseColorMap).includes(marketCap)) {
                    // Use the category as is
                } else {
                    // Skip categories we don't recognize
                    return;
                }
                
                if (!marketCapData.has(marketCap)) {
                    marketCapData.set(marketCap, {
                        count: 0,
                        companies: new Set(),
                        indications: new Map<string, number>(),
                        entries: []
                    });
                }
                
                const capInfo = marketCapData.get(marketCap)!;
                capInfo.count++;
                capInfo.companies.add(entry.Company || 'Unknown');
                capInfo.entries.push(entry);
                
                const indication = entry.Indication || 'Unknown';
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
            .sort((a, b) => {
                // Custom sort order: Mega -> Large -> Mid -> Small -> Micro -> Nano -> Series A/B -> Seed -> Grant -> Government/Academic -> Advocacy
                const order: Record<string, number> = {
                    'Mega': 1,
                    'Large': 2,
                    'Mid': 3,
                    'Small': 4,
                    'Micro': 5,
                    'Nano': 6,
                    'Series A': 7,
                    'Series B': 8,
                    'Seed': 9,
                    'Grant-supported': 10,
                    'Government': 11,
                    'Academic': 12,
                    'Advocacy': 13
                };
                return (order[a.marketCap] || 99) - (order[b.marketCap] || 99);
            });
            
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
        
        // Split data into two groups: large caps and others
        const largeCaps = processedData.filter(d => ['Mega', 'Large', 'Mid'].includes(d.marketCap));
        const otherCaps = processedData.filter(d => !['Mega', 'Large', 'Mid'].includes(d.marketCap));
        
        // Create a map for quick lookup of market cap data
        const marketCapLookup = new Map();
        processedData.forEach(capData => {
            const companiesSet = new Set();
            const entriesByCompany = new Map();
            
            capData.entries.forEach(entry => {
                if (entry.Company) {
                    companiesSet.add(entry.Company);
                    const companyEntries = entriesByCompany.get(entry.Company) || [];
                    companyEntries.push(entry);
                    entriesByCompany.set(entry.Company, companyEntries);
                }
            });
            
            marketCapLookup.set(capData.marketCap, {
                companies: companiesSet,
                entriesByCompany: entriesByCompany
            });
        });

        // Clear previous content
        d3.select(svg).selectAll('*').remove();
        
        // Calculate optimal number of columns based on available width
        const containerWidth = svg.parentElement?.clientWidth || width;
        const smallScreen = window.innerWidth < 1000;
        const isTinyScreen = window.innerWidth < 375;
        
        // Adjust base sizes for different screen sizes
        const baseMinCellSize = isTinyScreen ? 6 : (isMobile ? 8 : Math.max(12, Math.min(24, Math.floor(containerWidth / 40))));
        const baseMinCellPadding = isTinyScreen ? 1 : (isMobile ? 2 : Math.max(3, Math.min(6, Math.floor(containerWidth / 100))));
        
        // Calculate responsive cell size and padding
        const responsiveCellSize = isTinyScreen ? 12 : (smallScreen ? 16 : (isMobile ? Math.max(10, cellSize - 4) : Math.max(22, cellSize)));
        const responsiveCellPadding = isTinyScreen ? 1 : (isMobile ? Math.max(2, cellPadding - 2) : (smallScreen ? 3 : Math.max(4, cellPadding)));
        
        // Calculate max columns based on container width and minimum sizes
        const maxCols = Math.max(
            Math.min(
                Math.floor((containerWidth) / (baseMinCellSize + baseMinCellPadding)),
                isTinyScreen ? 12 : (isMobile ? 6 : 22)
            ),
            isTinyScreen ? 3 : (isMobile ? 18 : 24)
        );
        
        // Count total entries for both sections
        const otherCapCount = otherCaps.reduce((sum, d) => sum + d.entries.length, 0);
        const largeCapCount = largeCaps.reduce((sum, d) => sum + d.entries.length, 0);
        
        // Calculate rows needed for each section
        const otherCapsRows = Math.ceil(otherCapCount / maxCols);
        const largeCapRows = Math.ceil(largeCapCount / maxCols);
        
        // Calculate total dimensions
        const totalRows = otherCapsRows + largeCapRows + 1; // +1 for spacing between sections
        const totalWidth = maxCols * (responsiveCellSize + responsiveCellPadding);
        const totalHeight = totalRows * (responsiveCellSize + responsiveCellPadding);
        
        // Create SVG with adjusted dimensions
        const svgSelection = d3.select(svg)
            .attr('width', totalWidth)
            .attr('height', totalHeight)
            .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');
            
        // Function to render a cell
        const renderCell = (x: number, y: number, marketCap: string, entry: DataEntry) => {
            const baseColor = baseColorMap[marketCap] || '#999999';
            
            const cell = svgSelection.append('rect')
                .attr('x', x)
                .attr('y', y)
                .attr('width', responsiveCellSize)
                .attr('height', responsiveCellSize)
                .attr('rx', isTinyScreen ? borderRadius / 3 : (isMobile ? borderRadius / 2 : borderRadius))
                .attr('ry', isTinyScreen ? borderRadius / 3 : (isMobile ? borderRadius / 2 : borderRadius))
                .attr('fill', baseColor)
                .attr('class', 'waffle-cell')
                .attr('data-market-cap', marketCap)
                .attr('data-company', entry.Company || '');
                
            // Add mouseover events
            cell.on('mouseover', function(event) {
                const hoveredCap = d3.select(this).attr('data-market-cap');
                const hoveredCompany = d3.select(this).attr('data-company');
                
                // Get data from our lookup map
                const marketCapInfo = marketCapLookup.get(hoveredCap);
                const companyCount = marketCapInfo ? marketCapInfo.companies.size : 0;
                const companyEntries = marketCapInfo ? 
                    (marketCapInfo.entriesByCompany.get(hoveredCompany) || []).length : 0;
                
                // Highlight all cells of the same market cap
                d3.selectAll(`.waffle-cell[data-market-cap="${hoveredCap}"]`)
                    .attr('stroke', '#333')
                    .attr('stroke-width', isTinyScreen ? 0.5 : (isMobile ? 1 : 1.5));
                    
                // Update tooltip
                tooltipContent = { 
                    marketCap: hoveredCap,
                    companyName: hoveredCompany,
                    companyCount: companyCount,
                    entryCount: companyEntries
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
                    .attr('stroke-width', isTinyScreen ? 0.2 : (isMobile ? 0.3 : 0.5));
                    
                tooltipVisible = false;
            })
            .on('click', function() {
                const clickedCap = d3.select(this).attr('data-market-cap');
                onMarketCapClick(clickedCap);
            });
        };
        
        // Render other caps (top section)
        let currentRow = 0;
        let currentCol = 0;
        
        otherCaps.forEach(capData => {
            capData.entries.forEach(entry => {
                const x = currentCol * (responsiveCellSize + responsiveCellPadding);
                const y = currentRow * (responsiveCellSize + responsiveCellPadding);
                
                renderCell(x, y, capData.marketCap, entry);
                
                currentCol++;
                if (currentCol >= maxCols) {
                    currentCol = 0;
                    currentRow++;
                }
            });
        });
        
        // Add one row of spacing
        currentRow = otherCapsRows + 1;
        currentCol = 0;
        
        // Render large caps (bottom section)
        largeCaps.forEach(capData => {
            capData.entries.forEach(entry => {
                const x = currentCol * (responsiveCellSize + responsiveCellPadding);
                const y = currentRow * (responsiveCellSize + responsiveCellPadding);
                
                renderCell(x, y, capData.marketCap, entry);
                
                currentCol++;
                if (currentCol >= maxCols) {
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
            <div class="tooltip-content flex flex-row gap-2 mb-1 align-bottom justify-between">
                <div class="tooltip-category">{tooltipContent.marketCap}</div>
                <div class="tooltip-stats">
                    <span class="stat-value">{tooltipContent.companyCount}</span>
                    <span class="stat-label">Total</span>
                </div>
            </div>
            <div class="tooltip-stats">
                <div class="tooltip-company pt-2">{tooltipContent.companyName}</div>
                <span class="stat-label">RPD Designations:</span>
                <span class="stat-value">{tooltipContent.entryCount}</span>
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
        min-width: 200px;
    }
    
    .tooltip-category {
        font-weight: bold;
        margin-bottom: 3px;
        color: #1a202c;
        font-size: 13px;
    }
    
    .tooltip-company {
        font-style: italic;
        color: #2d3748;
        margin-bottom: 6px;
        padding-bottom: 4px;
        border-top: 1px solid #e2e8f0;
    }
    
    .tooltip-stats {
        color: #4a5568;
        font-size: 11px;
    }
    
    .stat-label {
        color: #718096;
        font-weight: 500;
    }

    .stat-value {
        color: #1a202c;
        font-weight: 500;
    }
    
    :global(.waffle-cell) {
        transition: opacity 0.2s, stroke 0.2s;
        cursor: pointer;
    }
    
    :global(.waffle-cell:hover) {
        opacity: 0.9;
    }
    
</style> 