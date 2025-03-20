<!-- MarketCapWaffleChart.svelte -->
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
    export let width = 600;
    export let height = 300;
    export let maxCols = 20;
    export let cellSize = 20;
    export let cellPadding = 3;
    export let onCompanySelect = (company: string) => {};
    export let legendPosition: 'right' | 'bottom' = 'right';
    
    let svg: SVGSVGElement;
    let tooltip: HTMLDivElement;
    let tooltipContent = { category: '', company: '', count: 0 };
    let tooltipVisible = false;
    let tooltipPosition = { x: 0, y: 0 };

    // Define market cap categories and colors (removed 'unknown')
    const marketCapCategories = {
        'small': { label: 'Small Cap', color: '#4F46E5' }, // Indigo
        'mid': { label: 'Mid Cap', color: '#0D9488' }, // Teal
        'large': { label: 'Large Cap', color: '#0891B2' }, // Cyan
        'mega': { label: 'Mega Cap', color: '#059669' }, // Emerald
        'private': { label: 'Private', color: '#A855F7' }, // Purple
        'na': { label: 'N/A', color: '#94A3B8' } // Slate
    };
    
    // Process data to categorize companies by market cap
    function processData(entries: DataEntry[]) {
        // Get unique companies with their market cap
        const companyMarketCaps = new Map<string, string>();
        
        // Extract companies and their market caps
        entries.forEach(entry => {
            if (entry.Company && !companyMarketCaps.has(entry.Company)) {
                companyMarketCaps.set(entry.Company, entry.MarketCap || "");
            }
        });
        
        // Count companies by market cap category
        const marketCapData = new Map<string, {
            count: number;
            companies: { name: string; entries: DataEntry[] }[];
        }>();
        
        // Initialize categories
        Object.keys(marketCapCategories).forEach(category => {
            marketCapData.set(category, { count: 0, companies: [] });
        });
        
        // Process each company
        companyMarketCaps.forEach((marketCap, company) => {
            // Normalize market cap value
            const cap = marketCap.toLowerCase();
            let category = '';
            
            if (cap === "small" || cap === "smal") {
                category = 'small';
            } else if (cap === "mid") {
                category = 'mid';
            } else if (cap === "large") {
                category = 'large';
            } else if (cap === "mega") {
                category = 'mega';
            } else if (cap === "private" || cap === "pvt") {
                category = 'private';
            } else if (cap === "#n/a" || cap.includes("n/a")) {
                category = 'na';
            } else {
                // Skip companies with unknown market cap
                return;
            }
            
            const categoryData = marketCapData.get(category)!;
            categoryData.count++;
            
            // Get entries for this company
            const companyEntries = entries.filter(entry => entry.Company === company);
            
            categoryData.companies.push({
                name: company,
                entries: companyEntries
            });
        });
        
        // Format data for visualization
        const result = Array.from(marketCapData.entries())
            .map(([category, data]) => ({
                category,
                count: data.count,
                companies: data.companies,
                color: marketCapCategories[category as keyof typeof marketCapCategories].color
            }))
            .filter(d => d.count > 0) // Remove empty categories
            .sort((a, b) => b.count - a.count); // Sort by count descending
        
        return result;
    }
    
    function renderWaffleChart() {
        if (!svg || !data || data.length === 0) return;
        
        // Process the data
        const processedData = processData(data);
        
        // Clear previous content
        d3.select(svg).selectAll('*').remove();
        
        // Calculate total count and number of cells needed
        const totalCount = processedData.reduce((sum, d) => sum + d.count, 0);
        const totalCells = maxCols * Math.ceil(totalCount / maxCols);
        
        // Calculate grid dimensions
        const rows = Math.ceil(totalCells / maxCols);
        
        // Adjust width based on legend position
        const legendWidth = 180; // width reserved for the legend when position is 'right'
        const legendMargin = 20; // margin between chart and legend
        
        // Determine if we're using right legend based on screen width and prop
        const useRightLegend = legendPosition === 'right' && window.innerWidth >= 768; // md breakpoint
        
        // Adjust dimensions based on legend position
        const chartWidth = useRightLegend 
            ? Math.min(width - legendWidth - legendMargin, (cellSize + cellPadding) * maxCols)
            : Math.min(width, (cellSize + cellPadding) * maxCols);
            
        const adjustedHeight = Math.min(height, (cellSize + cellPadding) * rows);
        
        // Create SVG with the adjusted dimensions
        const svgSelection = d3.select(svg)
            .attr('width', useRightLegend ? chartWidth + legendWidth + legendMargin : chartWidth)
            .attr('height', adjustedHeight)
            .attr('viewBox', `0 0 ${useRightLegend ? chartWidth + legendWidth + legendMargin : chartWidth} ${adjustedHeight}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');
        
        // Create a container for the chart
        const chartGroup = svgSelection.append('g')
            .attr('class', 'chart-group');
            
        // Track current position in the grid
        let currentRow = 0;
        let currentCol = 0;
        
        // Draw cells for each category
        processedData.forEach((categoryData) => {
            const { category, companies } = categoryData;
            const baseColor = categoryData.color;
            
            // Draw one cell for each company
            companies.forEach(company => {
                const x = currentCol * (cellSize + cellPadding);
                const y = currentRow * (cellSize + cellPadding);
                
                const cell = chartGroup.append('rect')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', cellSize)
                    .attr('height', cellSize)
                    .attr('rx', 2)
                    .attr('ry', 2)
                    .attr('fill', baseColor) // Using only the base color for all companies in the category
                    .attr('stroke', 'white')
                    .attr('stroke-width', 0.5)
                    .attr('class', 'waffle-cell')
                    .attr('data-category', category)
                    .attr('data-company', company.name)
                    .attr('data-count', company.entries.length);
                    
                // Add mouseover events
                cell.on('mouseover', function(event) {
                    const hoveredCategory = d3.select(this).attr('data-category');
                    const hoveredCompany = d3.select(this).attr('data-company');
                    const hoveredCount = d3.select(this).attr('data-count');
                    
                    // Highlight all cells of the same company
                    d3.selectAll(`.waffle-cell[data-company="${hoveredCompany}"]`)
                        .attr('stroke', '#333')
                        .attr('stroke-width', 1.5);
                        
                    // Update tooltip
                    tooltipContent = { 
                        category: marketCapCategories[hoveredCategory as keyof typeof marketCapCategories]?.label || hoveredCategory, 
                        company: hoveredCompany,
                        count: parseInt(hoveredCount) 
                    };
                    tooltipPosition = { x: event.pageX, y: event.pageY };
                    tooltipVisible = true;
                })
                .on('mousemove', function(event) {
                    tooltipPosition = { x: event.pageX, y: event.pageY };
                })
                .on('mouseout', function() {
                    const hoveredCompany = d3.select(this).attr('data-company');
                    
                    // Remove highlight
                    d3.selectAll(`.waffle-cell[data-company="${hoveredCompany}"]`)
                        .attr('stroke', 'white')
                        .attr('stroke-width', 0.5);
                        
                    tooltipVisible = false;
                })
                .on('click', function() {
                    const clickedCompany = d3.select(this).attr('data-company');
                    onCompanySelect(clickedCompany);
                });
                
                // Update position
                currentCol++;
                if (currentCol >= maxCols) {
                    currentCol = 0;
                    currentRow++;
                }
            });
        });
        
        // Add legend based on position
        if (useRightLegend) {
            // Right-side legend for md and larger screens
            const legendX = chartWidth + legendMargin;
            const legendY = 0;
            const legendItemHeight = 22;
            
            const legend = svgSelection.append('g')
                .attr('class', 'legend')
                .attr('transform', `translate(${legendX}, ${legendY})`);
                
            // Add title to legend
            legend.append('text')
                .attr('x', 0)
                .attr('y', 14)
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .attr('fill', '#333')
                .text('Market Cap Categories');
                
            // Add legend items vertically
            processedData.forEach((d, i) => {
                const yPos = 30 + (i * legendItemHeight);
                
                const legendItem = legend.append('g')
                    .attr('transform', `translate(0, ${yPos})`)
                    .attr('class', 'legend-item');
                    
                legendItem.append('rect')
                    .attr('width', 12)
                    .attr('height', 12)
                    .attr('rx', 2)
                    .attr('ry', 2)
                    .attr('fill', d.color);
                    
                legendItem.append('text')
                    .attr('x', 16)
                    .attr('y', 10)
                    .attr('font-size', '11px')
                    .attr('fill', '#333')
                    .text(`${marketCapCategories[d.category as keyof typeof marketCapCategories]?.label || d.category} (${d.count})`);
            });
        } else {
            // Bottom legend for smaller screens
            const legendX = 0;
            const legendY = adjustedHeight + 20;
            const legendItemHeight = 20;
            const legendItemWidth = 150;
            const legendCols = Math.floor(chartWidth / legendItemWidth);
            
            const legend = svgSelection.append('g')
                .attr('class', 'legend')
                .attr('transform', `translate(${legendX}, ${legendY})`);
                
            processedData.forEach((d, i) => {
                const legendRow = Math.floor(i / legendCols);
                const legendCol = i % legendCols;
                
                const legendItem = legend.append('g')
                    .attr('transform', `translate(${legendCol * legendItemWidth}, ${legendRow * legendItemHeight})`)
                    .attr('class', 'legend-item');
                    
                legendItem.append('rect')
                    .attr('width', 12)
                    .attr('height', 12)
                    .attr('rx', 2)
                    .attr('ry', 2)
                    .attr('fill', d.color);
                    
                legendItem.append('text')
                    .attr('x', 16)
                    .attr('y', 10)
                    .attr('font-size', '10px')
                    .attr('fill', '#333')
                    .text(`${marketCapCategories[d.category as keyof typeof marketCapCategories]?.label || d.category} (${d.count})`);
            });
            
            // Adjust SVG height to include bottom legend
            const legendRows = Math.ceil(processedData.length / legendCols);
            const newHeight = adjustedHeight + 20 + (legendRows * legendItemHeight);
            d3.select(svg).attr('height', newHeight);
        }
    }
    
    // Check and update legend position on window resize
    function handleResize() {
        if (svg) {
            renderWaffleChart();
        }
    }
    
    onMount(() => {
        renderWaffleChart();
        
        // Add resize listener
        window.addEventListener('resize', handleResize);
        
        // Clean up
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });
    
    $: if (data && svg) {
        renderWaffleChart();
    }
</script>

<div class="market-cap-waffle-chart">
    <svg bind:this={svg}></svg>
    
    {#if tooltipVisible}
        <div 
            bind:this={tooltip} 
            class="tooltip" 
            style="left: {tooltipPosition.x + 10}px; top: {tooltipPosition.y - 10}px; opacity: {tooltipVisible ? 1 : 0};"
        >
            <div class="tooltip-content">
                <div class="tooltip-title">{tooltipContent.category}</div>
                <div class="tooltip-company">{tooltipContent.company}</div>
                <div class="tooltip-value">{tooltipContent.count} drug candidates</div>
            </div>
        </div>
    {/if}
</div>

<style>
    .market-cap-waffle-chart {
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
    
    .tooltip-company {
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
    
    :global(.legend-item:hover) {
        opacity: 0.8;
    }
</style> 