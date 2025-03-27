<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import ChartLegend from './ChartLegend.svelte';
    
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
        "Public/Private"?: string;
        [key: string]: any;
    }

    export let data: DataEntry[] = [];
    export let width = 720;
    export let height = width;
    export let innerRadius = 100;
    export let outerRadius = width * 1.8 / 2;
    export let stackDepth = 5;
    export let onCompanySelect = (company: string) => {};
    export let legendPosition: 'right' | 'bottom' = 'right';
    export let nodeStyle: 'circle' | 'square' = 'circle';
    export let maxCols: number = 22;
    export let cellSize: number = 8;
    export let cellPadding: number = 10;
    
    // Data organization mode
    type OrganizationMode = 'stage' | 'marketcap';
    let organizationMode: OrganizationMode = 'marketcap';
    let arrangementMode: 'category' = 'category';
    
    // Filter setting
    export let showOnlyPRVAwarded: boolean = true;
    
    let svg: SVGSVGElement;
    let chart: HTMLDivElement;
    let tooltip: HTMLDivElement;
    let tooltipContent = { category: '', company: '', rpddYear: '', count: 0 };
    let tooltipVisible = false;
    let tooltipPosition = { x: 0, y: 0 };
    let containerWidth = 0;
    let containerHeight = 0;
    
    // Store legend data
    let legendData: { category: string; label: string; color: string; count: number }[] = [];
    let legendTitle = 'Market Cap';

    // Chart title based on filters
    let chartTitle = showOnlyPRVAwarded ? 'Companies with PRV Awarded Status' : 'All Companies';

    // Define commercial stage categories and colors
    const commercialStageCategories = {
        'early': { label: 'Early stage', color: '#2563EB' },
        'clinical': { label: 'Clinical stage', color: '#10B981' },
        'pivotal': { label: 'Pivotal stage', color: '#F59E0B' },
        'commercial': { label: 'Commercial stage', color: '#DC2626' },
        'bigpharma': { label: 'Big pharma', color: '#7C3AED' },
        'acquired': { label: 'Acquired/Merged', color: '#EC4899' },
        'na': { label: 'Unknown', color: '#94A3B8' }
    };
    
    // Define market cap categories and colors
    const marketCapCategories = {
        'Large': { label: 'Large Cap', color: '#7C3AED' },
        'Mid': { label: 'Mid Cap', color: '#F59E0B' },
        'Small': { label: 'Small Cap', color: '#10B981' },
        'Micro': { label: 'Micro Cap', color: '#2563EB' },
        'Private': { label: 'Private', color: '#DC2626' },
        'Acquired': { label: 'Acquired', color: '#EC4899' },
        'NA': { label: 'Unknown', color: '#94A3B8' }
    };
    
    // Process data to categorize companies
    function processData(entries: DataEntry[]) {
        // Filter out non-profit entries but keep acquired, bankrupt, or merger entries
        let filteredEntries = entries.filter(entry => {
            const publicPrivateValue = entry["Public/Private"]?.toLowerCase() || "";
            return publicPrivateValue !== "non profit";
        });
        
        // Apply PRV Awarded filter if enabled
        if (showOnlyPRVAwarded) {
            filteredEntries = filteredEntries.filter(entry => {
                return entry["PRV Status"] === "PRV Awarded";
            });
        }
        
        // Get unique companies
        const companies = new Set<string>();
        filteredEntries.forEach(entry => {
            if (entry.Company) {
                companies.add(entry.Company);
            }
        });
        
        // Group entries by company
        const entriesByCompany = new Map<string, DataEntry[]>();
        companies.forEach(company => {
            entriesByCompany.set(company, filteredEntries.filter(entry => entry.Company === company));
        });
        
        // Based on organization mode, process data differently
        if (organizationMode === 'marketcap') {
            return processMarketCapData(entriesByCompany);
        } else {
            return processStageData(entriesByCompany);
        }
    }
    
    // Process data for Commercial Stage organization
    function processStageData(entriesByCompany: Map<string, DataEntry[]>) {
        const stageData = new Map<string, {
            count: number;
            companies: { name: string; entries: DataEntry[]; rpddYear: string }[];
        }>();
        
        // Initialize categories
        Object.keys(commercialStageCategories).forEach(category => {
            stageData.set(category, { count: 0, companies: [] });
        });
        
        // Process each company
        entriesByCompany.forEach((companyEntries, company) => {
            let mostAdvancedStage = 'na';
            let isAcquiredOrMerged = false;
            let rpddYear = "";
            
            companyEntries.forEach(entry => {
                const currentStage = entry["Current Development Stage"] || entry.effectiveStage || "";
                const normalizedStage = normalizeStage(currentStage);
                
                const publicPrivateStatus = (entry["Public/Private"] || "").toLowerCase();
                if (publicPrivateStatus.includes("acquired") || 
                    publicPrivateStatus.includes("merger") || 
                    publicPrivateStatus.includes("bankrupt")) {
                    isAcquiredOrMerged = true;
                }
                
                if (getStageRank(normalizedStage) > getStageRank(mostAdvancedStage)) {
                    mostAdvancedStage = normalizedStage;
                }
                
                if (!rpddYear && entry["RPDD Year"]) {
                    rpddYear = entry["RPDD Year"];
                }
            });
            
            if (isAcquiredOrMerged) {
                mostAdvancedStage = 'acquired';
            }
            
            const categoryData = stageData.get(mostAdvancedStage)!;
            categoryData.count++;
            categoryData.companies.push({
                name: company,
                entries: companyEntries,
                rpddYear: rpddYear || 'Unknown'
            });
        });
        
        // Sort companies within each category by RPDD Year
        stageData.forEach(category => {
            category.companies.sort((a, b) => {
                if (a.rpddYear === 'Unknown' && b.rpddYear !== 'Unknown') return 1;
                if (a.rpddYear !== 'Unknown' && b.rpddYear === 'Unknown') return -1;
                return a.rpddYear.localeCompare(b.rpddYear);
            });
        });
        
        const result = Array.from(stageData.entries())
            .map(([category, data]) => ({
                category,
                count: data.count,
                companies: data.companies,
                color: commercialStageCategories[category as keyof typeof commercialStageCategories].color
            }))
            .filter(d => d.count > 0)
            .sort((a, b) => getStageRank(b.category) - getStageRank(a.category));
        
        legendTitle = 'Commercial Stage';
        return result;
    }
    
    // Process data for Market Cap organization
    function processMarketCapData(entriesByCompany: Map<string, DataEntry[]>) {
        const marketCapData = new Map<string, {
            count: number;
            companies: { name: string; entries: DataEntry[]; rpddYear: string }[];
        }>();
        
        Object.keys(marketCapCategories).forEach(category => {
            marketCapData.set(category, { count: 0, companies: [] });
        });
        
        entriesByCompany.forEach((companyEntries, company) => {
            let marketCapCategory = 'NA';
            let rpddYear = "";
            let isAcquired = false;
            
            companyEntries.forEach(entry => {
                if (entry.MarketCap) {
                    const cap = entry.MarketCap.trim();
                    if (cap && cap in marketCapCategories) {
                        marketCapCategory = cap;
                    }
                }
                
                const publicPrivateValue = (entry["Public/Private"] || "").trim();
                if (publicPrivateValue.toLowerCase() === "private" && marketCapCategory === 'NA') {
                    marketCapCategory = 'Private';
                }
                
                if (publicPrivateValue.toLowerCase().includes("acquired") || 
                    publicPrivateValue.toLowerCase().includes("merger") || 
                    publicPrivateValue.toLowerCase().includes("bankrupt")) {
                    isAcquired = true;
                }
                
                if (!rpddYear && entry["RPDD Year"]) {
                    rpddYear = entry["RPDD Year"];
                }
            });
            
            if (isAcquired) {
                marketCapCategory = 'Acquired';
            }
            
            const categoryData = marketCapData.get(marketCapCategory)!;
            categoryData.count++;
            categoryData.companies.push({
                name: company,
                entries: companyEntries,
                rpddYear: rpddYear || 'Unknown'
            });
        });
        
        marketCapData.forEach(category => {
            category.companies.sort((a, b) => {
                if (a.rpddYear === 'Unknown' && b.rpddYear !== 'Unknown') return 1;
                if (a.rpddYear !== 'Unknown' && b.rpddYear === 'Unknown') return -1;
                return a.rpddYear.localeCompare(b.rpddYear);
            });
        });
        
        const result = Array.from(marketCapData.entries())
            .map(([category, data]) => ({
                category,
                count: data.count,
                companies: data.companies,
                color: marketCapCategories[category as keyof typeof marketCapCategories]?.color || '#94A3B8'
            }))
            .filter(d => d.count > 0)
            .sort((a, b) => getMarketCapRank(b.category) - getMarketCapRank(a.category));
        
        legendTitle = 'Market Cap';
        return result;
    }
    
    function getMarketCapRank(cap: string): number {
        const ranks: {[key: string]: number} = {
            'Large': 5,
            'Mid': 4,
            'Small': 3,
            'Micro': 2,
            'Private': 1,
            'Acquired': 6,
            'NA': 0
        };
        return ranks[cap] || 0;
    }
    
    function normalizeStage(stage: string): string {
        const lowerStage = (stage || "").toLowerCase();
        
        if (lowerStage.includes('big pharma') || lowerStage.includes('large cap')) {
            return 'bigpharma';
        }
        else if (lowerStage.includes('discovery') || lowerStage.includes('research') || 
                 lowerStage.includes('preclinical') || lowerStage.includes('pre-clinical')) {
            return 'early';
        } 
        else if (lowerStage.includes('phase 1') || lowerStage.includes('phase i') || 
                 lowerStage.includes('phase 2') || lowerStage.includes('phase ii') ||
                 lowerStage === 'p1' || lowerStage === 'p2') {
            return 'clinical';
        } 
        else if (lowerStage.includes('phase 3') || lowerStage.includes('phase iii') || 
                 lowerStage.includes('filed') || lowerStage.includes('nda') || 
                 lowerStage.includes('bla') || lowerStage.includes('submission') ||
                 lowerStage === 'p3') {
            return 'pivotal';
        } 
        else if (lowerStage.includes('approved') || lowerStage.includes('approval') ||
                 lowerStage.includes('market') || lowerStage.includes('commercial')) {
            return 'commercial';
        } else {
            return 'na';
        }
    }
    
    function getStageRank(stage: string): number {
        const ranks: {[key: string]: number} = {
            'bigpharma': 5,
            'commercial': 4,
            'pivotal': 3,
            'clinical': 2,
            'early': 1,
            'acquired': 6,
            'na': 0
        };
        return ranks[stage] || 0;
    }
    
    function calculateDimensions() {
        if (!chart) return;
        
        const rect = chart.getBoundingClientRect();
        containerWidth = rect.width;
        containerHeight = rect.height || containerWidth;
        
        const isMobile = window.innerWidth < 768;
        
        width = Math.min(containerWidth, isMobile ? 450 : 800);
        height = width;
        
        // Calculate dynamic radii based on number of nodes
        const processedData = processData(data);
        const totalNodes = processedData.reduce((sum, category) => sum + category.count, 0);
        
        // Adjust inner and outer radius based on total nodes
        innerRadius = Math.max(40, width * 0.25);
        outerRadius = Math.min(width * 0.48, 350);
        
        // Adjust stack depth based on available space
        stackDepth = isMobile ? 8 : 14;
        
        legendPosition = containerWidth > 800 ? 'right' : 'bottom';
    }
    
    function toggleOrganizationMode() {
        organizationMode = organizationMode === 'stage' ? 'marketcap' : 'stage';
        legendTitle = organizationMode === 'stage' ? 'Commercial Stage' : 'Market Cap';
        if (svg) renderRadialChart();
    }
    
    function togglePRVFilter() {
        showOnlyPRVAwarded = !showOnlyPRVAwarded;
        chartTitle = showOnlyPRVAwarded ? 'Companies with PRV Awarded Status' : 'All Companies';
        if (svg) renderRadialChart();
    }
    
    function renderRadialChart() {
        if (!svg || !data || data.length === 0) return;
        
        calculateDimensions();
        
        const processedData = processData(data);
        
        legendData = processedData.map(d => {
            let labelText = d.category;
            
            if (organizationMode === 'stage' && d.category in commercialStageCategories) {
                labelText = commercialStageCategories[d.category as keyof typeof commercialStageCategories].label;
            } else if (organizationMode === 'marketcap' && d.category in marketCapCategories) {
                labelText = marketCapCategories[d.category as keyof typeof marketCapCategories].label;
            }
            
            return {
                category: d.category,
                label: labelText,
                color: d.color,
                count: d.count
            };
        });
        
        d3.select(svg).selectAll('*').remove();
        
        const svgSelection = d3.select(svg)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');
            
        const chartContainer = svgSelection
            .append('g')
            .attr('class', 'chart-container')
            .attr('transform', `translate(${width * 0.1}, ${height * 0.1})`);
        
        let allCompanies: {
            name: string;
            entries: DataEntry[];
            category: string;
            color: string;
            rpddYear: string;
            id?: string;
        }[] = [];
        
        processedData.forEach(categoryData => {
            categoryData.companies.forEach(company => {
                allCompanies.push({
                    name: company.name,
                    entries: company.entries,
                    category: categoryData.category,
                    color: categoryData.color,
                    rpddYear: company.rpddYear,
                    id: `${company.name.replace(/[^a-zA-Z0-9]/g, '-')}-${company.rpddYear}`
                });
            });
        });
        
        const companiesByCategory = allCompanies.reduce((acc, company) => {
            const category = company.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(company);
            return acc;
        }, {} as {[key: string]: typeof allCompanies});
        
        const sortedCategories = Object.keys(companiesByCategory)
            .sort((a, b) => getStageRank(b) - getStageRank(a));
        
        const nodeSize = Math.min(22, Math.max(8, width / 40));
        const padding = nodeSize * 1.5;
        const maxNodesPerRow = Math.floor((width * 0.8) / (nodeSize + padding));
        
        const nodePositionData = new Map();
        
        sortedCategories.forEach((category, categoryIndex) => {
            const companiesInGroup = companiesByCategory[category];
            const rows = Math.ceil(companiesInGroup.length / maxNodesPerRow);
            
            companiesInGroup.forEach((company, companyIndex) => {
                const row = Math.floor(companyIndex / maxNodesPerRow);
                const col = companyIndex % maxNodesPerRow;
                
                const x = col * (nodeSize + padding);
                const y = categoryIndex * (rows * (nodeSize + padding) + padding * 2);
                
                const nodeId = `node-${company.id}`;
                
                if (nodeStyle === 'circle') {
                    nodePositionData.set(nodeId, {
                        cx: x + nodeSize/2,
                        cy: y + nodeSize/2,
                        company
                    });
                } else {
                    nodePositionData.set(nodeId, {
                        x: x,
                        y: y,
                        company
                    });
                }
            });
        });
        
        // Add category labels
        sortedCategories.forEach((category, categoryIndex) => {
            const companiesInGroup = companiesByCategory[category];
            const rows = Math.ceil(companiesInGroup.length / maxNodesPerRow);
            const categoryColor = organizationMode === 'stage' 
                ? commercialStageCategories[category as keyof typeof commercialStageCategories].color
                : marketCapCategories[category as keyof typeof marketCapCategories].color;
            
            const labelY = categoryIndex * (rows * (nodeSize + padding) + padding * 2) - padding/2;
            
            chartContainer.append('text')
                .attr('class', 'category-label')
                .attr('x', 0)
                .attr('y', labelY)
                .attr('fill', categoryColor)
                .attr('font-weight', 'bold')
                .attr('font-size', '14px')
                .text(organizationMode === 'stage' 
                    ? commercialStageCategories[category as keyof typeof commercialStageCategories].label
                    : marketCapCategories[category as keyof typeof marketCapCategories].label);
        });
        
        nodePositionData.forEach((posData, nodeId) => {
            let node;
            
            if (nodeStyle === 'circle') {
                node = chartContainer.append('circle')
                    .attr('id', nodeId)
                    .attr('class', 'radial-node')
                    .attr('cx', posData.cx)
                    .attr('cy', posData.cy)
                    .attr('r', nodeSize/2)
                    .attr('fill', posData.company.color)
                    .attr('stroke', 'white')
                    .attr('stroke-width', 1.5)
                    .attr('data-category', posData.company.category)
                    .attr('data-company', posData.company.name)
                    .attr('data-rpdd-year', posData.company.rpddYear)
                    .attr('data-count', posData.company.entries.length);
            } else {
                node = chartContainer.append('rect')
                    .attr('id', nodeId)
                    .attr('class', 'radial-node')
                    .attr('x', posData.x)
                    .attr('y', posData.y)
                    .attr('width', nodeSize)
                    .attr('height', nodeSize)
                    .attr('fill', posData.company.color)
                    .attr('stroke', 'white')
                    .attr('stroke-width', 1)
                    .attr('data-category', posData.company.category)
                    .attr('data-company', posData.company.name)
                    .attr('data-rpdd-year', posData.company.rpddYear)
                    .attr('data-count', posData.company.entries.length);
            }
            
            if (node) {
                (node as unknown as d3.Selection<Element, unknown, null, undefined>)
                    .on('mouseover', function(this: Element, event: MouseEvent) {
                        const hoveredCategory = d3.select(this).attr('data-category');
                        const hoveredCompany = d3.select(this).attr('data-company');
                        const hoveredRpddYear = d3.select(this).attr('data-rpdd-year');
                        const hoveredCount = d3.select(this).attr('data-count');
                        
                        d3.selectAll(`.radial-node[data-company="${hoveredCompany}"]`)
                            .attr('stroke', '#333')
                            .attr('stroke-width', 2.5);
                            
                        let categoryLabel = hoveredCategory;
                        if (organizationMode === 'stage') {
                            categoryLabel = commercialStageCategories[hoveredCategory as keyof typeof commercialStageCategories]?.label || hoveredCategory;
                        } else {
                            categoryLabel = marketCapCategories[hoveredCategory as keyof typeof marketCapCategories]?.label || hoveredCategory;
                        }
                        
                        tooltipContent = { 
                            category: categoryLabel,
                            company: hoveredCompany || '',
                            rpddYear: hoveredRpddYear || '',
                            count: hoveredCount ? parseInt(hoveredCount) : 0
                        };
                        
                        const x = Math.min(event.clientX + 10, window.innerWidth - 200);
                        const y = Math.min(event.clientY + 10, window.innerHeight - 100);
                        tooltipPosition = { 
                            x: x + window.scrollX,
                            y: y + window.scrollY
                        };
                        tooltipVisible = true;
                    })
                    .on('mousemove', function(this: Element, event: MouseEvent) {
                        const x = Math.min(event.clientX + 10, window.innerWidth - 200);
                        const y = Math.min(event.clientY + 10, window.innerHeight - 100);
                        tooltipPosition = { 
                            x: x + window.scrollX,
                            y: y + window.scrollY
                        };
                    })
                    .on('mouseout', function(this: Element) {
                        const hoveredCompany = d3.select(this).attr('data-company');
                        if (hoveredCompany) {
                            const nodesSelection = d3.selectAll(`.radial-node[data-company="${hoveredCompany}"]`);
                            nodesSelection.each(function() {
                                const node = d3.select(this);
                                if (node.classed('radial-node')) {
                                    if (nodeStyle === 'circle') {
                                        node.attr('stroke', 'white')
                                            .attr('stroke-width', 1.5);
                                    } else {
                                        node.attr('stroke', 'white')
                                            .attr('stroke-width', 1);
                                    }
                                }
                            });
                        }
                        
                        tooltipVisible = false;
                    })
                    .on('click', function(this: Element) {
                        const clickedCompany = d3.select(this).attr('data-company');
                        onCompanySelect(clickedCompany || '');
                    });
            }
        });
    }
    
    $: if (data && svg) {
        renderRadialChart();
    }
    
    $: if (arrangementMode || width || height || innerRadius || outerRadius || nodeStyle || legendPosition || stackDepth) {
        if (svg) renderRadialChart();
    }
    
    function handleResize() {
        if (chart && svg) {
            calculateDimensions();
            renderRadialChart();
        }
    }
    
    onMount(() => {
        calculateDimensions();
        renderRadialChart();
        
        window.addEventListener('resize', handleResize);
        
        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(() => {
                handleResize();
            });
            
            if (chart) {
                resizeObserver.observe(chart);
            }
            
            return () => {
                window.removeEventListener('resize', handleResize);
                if (chart) {
                    resizeObserver.unobserve(chart);
                }
                resizeObserver.disconnect();
            };
        } else {
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    });
</script>

<div class="commercial-stage-radial-chart" bind:this={chart}>
    <div class="chart-header">
        <h2 class="chart-title">{chartTitle}</h2>
        <div class="chart-controls">
            <button class="toggle-button" on:click={toggleOrganizationMode}>
                <span>Group by: </span>
                <span class="current-mode">{organizationMode === 'stage' ? 'Commercial Stage' : 'Market Cap'}</span>
            </button>
            <button class="toggle-button" on:click={togglePRVFilter}>
                <span>Filter: </span>
                <span class="current-mode">{showOnlyPRVAwarded ? 'PRV Awarded' : 'All Companies'}</span>
            </button>
        </div>
    </div>
    
    <div class="svg-container">
        <svg bind:this={svg}></svg>
    </div>
    
    {#if legendData.length > 0}
        <div class="legend-container" class:legend-right={legendPosition === 'right'} class:legend-bottom={legendPosition === 'bottom'}>
            <ChartLegend 
                legendItems={legendData}
                position={legendPosition}
                title={legendTitle}
                showCounts={true}
                width={containerWidth}
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
                <div class="tooltip-title">{tooltipContent.category}</div>
                <div class="tooltip-company">{tooltipContent.company}</div>
                <div class="tooltip-year">RPDD Year: {tooltipContent.rpddYear}</div>
                <div class="tooltip-value">{tooltipContent.count} drug candidates</div>
            </div>
        </div>
    {/if}
</div>

<style>
    .commercial-stage-radial-chart {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 400px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
    }
    
    .chart-header {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 16px;
        margin-bottom: 12px;
    }
    
    .chart-title {
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
        text-align: center;
        margin: 0;
    }
    
    .chart-controls {
        display: flex;
        justify-content: center;
        gap: 12px;
        flex-wrap: wrap;
    }
    
    .toggle-button {
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 5px 12px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .toggle-button:hover {
        background-color: #e9ecef;
    }
    
    .toggle-button .current-mode {
        font-weight: 600;
        color: #4f46e5;
    }
    
    .svg-container {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        min-height: 450px;
    }
    
    .legend-container {
        margin-top: 12px;
    }
    
    .legend-right {
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        max-width: 150px;
    }
    
    .legend-bottom {
        width: 100%;
        display: flex;
        justify-content: center;
        padding: 0 10px;
        margin-top: 20px;
    }
    
    .tooltip {
        position: fixed;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 8px;
        font-size: 12px;
        pointer-events: none;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        z-index: 100;
        transition: opacity 0.2s;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .tooltip-title {
        font-weight: bold;
        margin-bottom: 3px;
        white-space: nowrap;
    }
    
    .tooltip-company {
        font-style: italic;
        color: #444;
        margin-bottom: 3px;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .tooltip-year {
        color: #666;
        margin-bottom: 3px;
    }
    
    .tooltip-value {
        color: #666;
    }
    
    :global(.radial-node) {
        transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1), 
                    opacity 0.3s ease, 
                    stroke 0.2s ease;
        cursor: pointer;
    }
    
    :global(.radial-node:hover) {
        opacity: 0.9;
    }
    
    :global(.category-label) {
        pointer-events: none;
        transition: opacity 0.2s ease;
    }
    
    :global(.category-label:hover) {
        opacity: 0.8;
    }
    
    @media (max-width: 768px) {
        .commercial-stage-radial-chart {
            min-height: 350px;
        }
        
        .chart-title {
            font-size: 14px;
        }
        
        .toggle-button {
            font-size: 10px;
            padding: 4px 8px;
        }
        
        .tooltip {
            font-size: 10px;
            padding: 6px;
            max-width: 160px;
        }
        
        .legend-right {
            max-width: 100px;
        }
    }
</style> 