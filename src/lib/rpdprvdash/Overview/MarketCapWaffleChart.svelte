<!-- MarketCapRadialChart.svelte -->
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
        "Public/Private"?: string;
        [key: string]: any;
    }

    export let data: DataEntry[] = [];
    export let width = 420;
    export let height = width; // Made this equal to width for better circular visualization
    export let innerRadius = 220; // Inner radius for the radial chart
    export let outerRadius = width * 0.8 / 2; // Outer radius for the radial chart (40% of width)
    export let stackDepth = 8; // Number of nodes to stack in each column
    export let onCompanySelect = (company: string) => {};
    export let legendPosition: 'right' | 'bottom' = 'right';
    export let nodeStyle: 'circle' | 'square' = 'circle';
    export let maxCols: number = 18; // Default value for maximum columns in the waffle chart
    export let cellSize: number = 18; // Default cell size
    export let cellPadding: number = 2; // Default cell padding
    
    // Arrangement mode toggle
    let arrangementMode: 'year' | 'category' = 'year';
    
    let svg: SVGSVGElement;
    let chart: HTMLDivElement;
    let tooltip: HTMLDivElement;
    let tooltipContent = { category: '', company: '', rpddYear: '', count: 0 };
    let tooltipVisible = false;
    let tooltipPosition = { x: 0, y: 0 };
    let containerWidth = 0;
    let containerHeight = 0;

    // Define commercial stage categories and colors
    const commercialStageCategories = {
        'early': { label: 'Early stage', color: '#2563EB' }, // Blue
        'clinical': { label: 'Clinical stage', color: '#10B981' }, // Emerald
        'pivotal': { label: 'Pivotal stage', color: '#F59E0B' }, // Amber
        'commercial': { label: 'Commercial stage', color: '#DC2626' }, // Red
        'bigpharma': { label: 'Big pharma', color: '#7C3AED' }, // Purple
        'acquired': { label: 'Acquired/Merged', color: '#EC4899' }, // Pink
        'na': { label: 'Unknown', color: '#94A3B8' } // Slate
    };
    
    // Process data to categorize companies by commercial stage
    function processData(entries: DataEntry[]) {
        // Filter out non-profit entries but keep acquired, bankrupt, or merger entries
        const filteredEntries = entries.filter(entry => {
            const publicPrivateValue = entry["Public/Private"]?.toLowerCase() || "";
            // Exclude "Non Profit" but include "acquired", "bankrupt", or "merger"
            return publicPrivateValue !== "non profit";
        });
        
        // Debug: Create a list to track companies with unknown stages
        const unknownStageCompanies: {company: string, stage: string}[] = [];
        
        // Get unique companies
        const companies = new Set<string>();
        filteredEntries.forEach(entry => {
            if (entry.Company) {
                companies.add(entry.Company);
            }
        });
        
        // Count companies by commercial stage category
        const stageData = new Map<string, {
            count: number;
            companies: { name: string; entries: DataEntry[]; rpddYear: string }[];
        }>();
        
        // Initialize categories
        Object.keys(commercialStageCategories).forEach(category => {
            stageData.set(category, { count: 0, companies: [] });
        });
        
        // Group entries by company
        const entriesByCompany = new Map<string, DataEntry[]>();
        companies.forEach(company => {
            entriesByCompany.set(company, filteredEntries.filter(entry => entry.Company === company));
        });
        
        // Process each company
        entriesByCompany.forEach((companyEntries, company) => {
            // Determine the most advanced stage for this company
            let mostAdvancedStage = 'na';
            
            // For debugging: track raw stage values for this company
            const companyStages: string[] = [];
            
            // Check if company has been acquired, merged, or is bankrupt
            let isAcquiredOrMerged = false;
            
            // Get RPDD Year for the company - take the first available
            let rpddYear = "";
            
            // Check all entries for this company to find the most advanced stage and acquisition status
            companyEntries.forEach(entry => {
                const currentStage = entry["Current Development Stage"] || entry.effectiveStage || "";
                companyStages.push(currentStage);
                const normalizedStage = normalizeStage(currentStage);
                
                // Check Public/Private field for acquisition status
                const publicPrivateStatus = (entry["Public/Private"] || "").toLowerCase();
                if (publicPrivateStatus.includes("acquired") || 
                    publicPrivateStatus.includes("merger") || 
                    publicPrivateStatus.includes("bankrupt")) {
                    isAcquiredOrMerged = true;
                }
                
                // Update most advanced stage if this entry has a more advanced stage
                if (getStageRank(normalizedStage) > getStageRank(mostAdvancedStage)) {
                    mostAdvancedStage = normalizedStage;
                }
                
                // Update RPDD Year if available and not set yet
                if (!rpddYear && entry["RPDD Year"]) {
                    rpddYear = entry["RPDD Year"];
                }
            });
            
            // Override stage with 'acquired' if the company has been acquired or merged
            if (isAcquiredOrMerged) {
                mostAdvancedStage = 'acquired';
            }
            
            // If still unknown, add to debug list
            if (mostAdvancedStage === 'na') {
                unknownStageCompanies.push({
                    company,
                    stage: companyStages.join(', ')
                });
            }
            
            // Add company to its category
            const categoryData = stageData.get(mostAdvancedStage)!;
            categoryData.count++;
            categoryData.companies.push({
                name: company,
                entries: companyEntries,
                rpddYear: rpddYear || 'Unknown'
            });
        });
        
        // Output debug info to console
        console.log(`Found ${unknownStageCompanies.length} companies with unknown stages:`);
        unknownStageCompanies.forEach(item => {
            console.log(`Company: ${item.company}, Stage values: ${item.stage || 'EMPTY'}`);
        });
        
        // Sort companies within each category by RPDD Year
        stageData.forEach(category => {
            category.companies.sort((a, b) => {
                // Handle 'Unknown' years
                if (a.rpddYear === 'Unknown' && b.rpddYear !== 'Unknown') return 1;
                if (a.rpddYear !== 'Unknown' && b.rpddYear === 'Unknown') return -1;
                return a.rpddYear.localeCompare(b.rpddYear);
            });
        });
        
        // Format data for visualization
        const result = Array.from(stageData.entries())
            .map(([category, data]) => ({
                category,
                count: data.count,
                companies: data.companies,
                color: commercialStageCategories[category as keyof typeof commercialStageCategories].color
            }))
            .filter(d => d.count > 0) // Remove empty categories
            .sort((a, b) => getStageRank(b.category) - getStageRank(a.category)); // Sort by stage rank
        
        return result;
    }
    
    // Normalize commercial stage values
    function normalizeStage(stage: string): string {
        const lowerStage = (stage || "").toLowerCase();
        
        // For debugging
        if (!stage || stage.trim() === "") {
            console.log("Empty stage value detected");
        }
        
        // Check for big pharma status based on company size or markers
        if (lowerStage.includes('big pharma') || lowerStage.includes('large cap')) {
            return 'bigpharma';
        }
        // Early stage: Discovery and Preclinical
        else if (lowerStage.includes('discovery') || lowerStage.includes('research') || 
                 lowerStage.includes('preclinical') || lowerStage.includes('pre-clinical')) {
            return 'early';
        } 
        // Clinical stage: Phase 1 and Phase 2
        else if (lowerStage.includes('phase 1') || lowerStage.includes('phase i') || 
                 lowerStage.includes('phase 2') || lowerStage.includes('phase ii') ||
                 lowerStage === 'p1' || lowerStage === 'p2') {
            return 'clinical';
        } 
        // Pivotal stage: Phase 3 and Filed
        else if (lowerStage.includes('phase 3') || lowerStage.includes('phase iii') || 
                 lowerStage.includes('filed') || lowerStage.includes('nda') || 
                 lowerStage.includes('bla') || lowerStage.includes('submission') ||
                 lowerStage === 'p3') {
            return 'pivotal';
        } 
        // Commercial stage: Approved and Marketed
        else if (lowerStage.includes('approved') || lowerStage.includes('approval') ||
                 lowerStage.includes('market') || lowerStage.includes('commercial')) {
            return 'commercial';
        } else {
            // For debugging, log unrecognized stage values
            if (stage && stage.trim() !== "") {
                console.log(`Unrecognized stage value: "${stage}"`);
            }
            return 'na';
        }
    }
    
    // Get numeric rank of stage for sorting
    function getStageRank(stage: string): number {
        const ranks: {[key: string]: number} = {
            'bigpharma': 5,
            'commercial': 4,
            'pivotal': 3,
            'clinical': 2,
            'early': 1,
            'acquired': 6,  // Highest rank to appear first in the legend
            'na': 0
        };
        
        return ranks[stage] || 0;
    }
    
    // Function to calculate appropriate dimensions based on container size
    function calculateDimensions() {
        if (!chart) return;
        
        // Get the container dimensions
        const rect = chart.getBoundingClientRect();
        containerWidth = rect.width;
        containerHeight = rect.height || containerWidth;
        
        // Calculate appropriate chart size based on container and device size
        const isMobile = window.innerWidth < 768;
        
        // Set proper chart dimensions
        width = Math.min(containerWidth, isMobile ? 350 : 500);
        height = width; // Keep it circular
        
        // Scale radii based on the new width
        innerRadius = Math.max(30, width * 0.2); // At least 30px, or 20% of width
        outerRadius = Math.min(width * 0.45, 200); // 45% of width, up to 200px max
        
        // Adjust stack depth based on available space
        stackDepth = isMobile ? 6 : 8;
        
        // Update legend position based on available space
        legendPosition = containerWidth > 800 ? 'right' : 'bottom';
    }
    
    function renderRadialChart() {
        if (!svg || !data || data.length === 0) return;
        
        // Recalculate dimensions before rendering
        calculateDimensions();
        
        // Process the data
        const processedData = processData(data);
        
        // Store current nodes for transition if they exist
        const existingNodes = d3.select(svg).selectAll('.radial-node');
        const hasExistingNodes = !existingNodes.empty();
        
        // Store existing node positions for animation
        const nodePositions = new Map();
        if (hasExistingNodes) {
            existingNodes.each(function() {
                const node = d3.select(this);
                const id = node.attr('id');
                if (nodeStyle === 'circle') {
                    nodePositions.set(id, {
                        cx: parseFloat(node.attr('cx')),
                        cy: parseFloat(node.attr('cy'))
                    });
                } else {
                    nodePositions.set(id, {
                        x: parseFloat(node.attr('x')),
                        y: parseFloat(node.attr('y'))
                    });
                }
            });
        }
        
        // Clear previous content
        d3.select(svg).selectAll('*').remove();
        
        const diameter = Math.min(width, height);
        const radius = diameter / 2;
        
        // Create SVG with appropriate dimensions
        const svgSelection = d3.select(svg)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');
            
        // Create a container with proper centering
        const chartContainer = svgSelection
            .append('g')
            .attr('class', 'chart-container')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);
        
        // Flatten all companies into a single array, preserving category info
        let allCompanies: {
            name: string;
            entries: DataEntry[];
            category: string;
            color: string;
            rpddYear: string;
            id?: string; // Add unique ID for animation
        }[] = [];
        
        processedData.forEach(categoryData => {
            categoryData.companies.forEach(company => {
                allCompanies.push({
                    name: company.name,
                    entries: company.entries,
                    category: categoryData.category,
                    color: categoryData.color,
                    rpddYear: company.rpddYear,
                    id: `${company.name.replace(/[^a-zA-Z0-9]/g, '-')}-${company.rpddYear}` // Clean ID
                });
            });
        });
        
        // Group companies by RPDD Year for better organization
        const companiesByYear = allCompanies.reduce((acc, company) => {
            const year = company.rpddYear;
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(company);
            return acc;
        }, {} as {[key: string]: typeof allCompanies});
        
        // Group companies by category for category arrangement
        const companiesByCategory = allCompanies.reduce((acc, company) => {
            const category = company.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(company);
            return acc;
        }, {} as {[key: string]: typeof allCompanies});
        
        // Get sorted years (excluding 'Unknown')
        const sortedYears = Object.keys(companiesByYear)
            .filter(year => year !== 'Unknown')
            .sort();
        
        // Add 'Unknown' at the end if it exists
        if (companiesByYear['Unknown']) {
            sortedYears.push('Unknown');
        }
        
        // Get sorted categories by rank
        const sortedCategories = Object.keys(companiesByCategory)
            .sort((a, b) => getStageRank(b) - getStageRank(a));
        
        // Set node size based on available space
        const nodeSize = Math.min(
            16, // Max node size
            Math.max(6, innerRadius / 16) // Min size 6px, scales with chart
        );
        
        // Draw a boundary circle for reference
        chartContainer.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', innerRadius)
            .attr('fill', 'none')
            .attr('stroke', '#ddd')
            .attr('stroke-width', 0.725)
            .attr('stroke-dasharray', '3,3');
            
        chartContainer.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', outerRadius)
            .attr('fill', 'none')
            .attr('stroke', '#ddd')
            .attr('stroke-width', 0.5)
            .attr('stroke-dasharray', '3,3');
        
        // Current column index
        let currentColumnIndex = 0;
        
        // Main grouping structure based on arrangement mode
        const groupingStructure = arrangementMode === 'year' 
            ? { items: sortedYears, getCompanies: (item: string) => companiesByYear[item] }
            : { items: sortedCategories, getCompanies: (item: string) => companiesByCategory[item] };
        
        // Calculate number of groups and total companies for distribution
        const totalGroups = groupingStructure.items.length;
        const totalCompanies = allCompanies.length;
        
        // Calculate position for each node
        const nodePositionData = new Map();
        let groupStartAngles = new Map();
        let groupEndAngles = new Map();
        
        // First pass - calculate total columns needed and angles
        groupingStructure.items.forEach((groupKey, groupIndex) => {
            const companiesInGroup = groupingStructure.getCompanies(groupKey);
            const columnsForGroup = Math.ceil(companiesInGroup.length / stackDepth);
            
            // Calculate group's angular range
            const totalColumns = Math.ceil(totalCompanies / stackDepth);
            const fractionOfCircle = columnsForGroup / totalColumns;
            const startAngle = (Math.PI * 2) * (currentColumnIndex / totalColumns);
            const endAngle = startAngle + (Math.PI * 2) * fractionOfCircle;
            
            groupStartAngles.set(groupKey, startAngle);
            groupEndAngles.set(groupKey, endAngle);
            
            // Update for next group
            currentColumnIndex += columnsForGroup;
        });
        
        // Reset for second pass
        currentColumnIndex = 0;
        
        // Draw groups and nodes
        groupingStructure.items.forEach((groupKey, groupIndex) => {
            const companiesInGroup = groupingStructure.getCompanies(groupKey);
            const startAngle = groupStartAngles.get(groupKey) || 0;
            const endAngle = groupEndAngles.get(groupKey) || Math.PI * 2;
            const angleRange = endAngle - startAngle;
            
            // Calculate columns for this group
            const columnsForGroup = Math.ceil(companiesInGroup.length / stackDepth);
            
            // Add group label at midpoint angle
            const midAngle = startAngle + angleRange / 2;
            const labelRadius = outerRadius + (width < 400 ? 10 : 20);
            const labelX = Math.cos(midAngle) * labelRadius;
            const labelY = Math.sin(midAngle) * labelRadius;
            
            // Determine font size based on available space
            const fontSize = width < 400 ? '8px' : (width < 600 ? '10px' : '12px');
            
            // For category mode, use the category label instead of year
            const labelText = arrangementMode === 'year' ? groupKey :
                commercialStageCategories[groupKey as keyof typeof commercialStageCategories]?.label || groupKey;
            
            const groupLabel = chartContainer.append('text')
                .attr('x', labelX)
                .attr('y', labelY)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .attr('font-size', fontSize)
                .attr('fill', arrangementMode === 'category' ? 
                    commercialStageCategories[groupKey as keyof typeof commercialStageCategories]?.color || '#333' : '#333')
                .text(labelText);
            
            // Rotate text for better readability depending on position
            if (midAngle > Math.PI / 2 && midAngle < Math.PI * 1.5) {
                groupLabel.attr('transform', `rotate(180, ${labelX}, ${labelY})`);
            }
            
            // Process companies within this group
            companiesInGroup.forEach((company, companyIndex) => {
                // Calculate angle distribution within group
                const columnWithinGroup = Math.floor(companyIndex / stackDepth);
                const angleStep = angleRange / columnsForGroup;
                const angle = startAngle + (columnWithinGroup + 0.5) * angleStep;
                
                // Calculate position in stack
                const positionInColumn = companyIndex % stackDepth;
                
                // Calculate radius based on stack position
                const stackPosition = positionInColumn / (stackDepth - 1);
                const nodeRadius = innerRadius + stackPosition * (outerRadius - innerRadius);
                
                // Calculate x and y position
                const x = Math.cos(angle) * nodeRadius;
                const y = Math.sin(angle) * nodeRadius;
                
                // Create node ID for tracking
                const nodeId = `node-${company.id}`;
                
                // Store position data
                if (nodeStyle === 'circle') {
                    nodePositionData.set(nodeId, {
                        cx: x,
                        cy: y,
                        company
                    });
                } else {
                    nodePositionData.set(nodeId, {
                        x: x - nodeSize/2,
                        y: y - nodeSize/2,
                        company
                    });
                }
            });
        });
        
        // Create all nodes
        nodePositionData.forEach((posData, nodeId) => {
            let node;
            
            if (nodeStyle === 'circle') {
                node = chartContainer.append('circle')
                    .attr('id', nodeId)
                    .attr('class', 'radial-node')
                    .attr('cx', posData.cx)
                    .attr('cy', posData.cy)
                    .attr('r', nodeSize)
                    .attr('fill', posData.company.color)
                    .attr('stroke', 'white')
                    .attr('stroke-width', 1.25)
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
                    .attr('stroke-width', 0.5)
                    .attr('data-category', posData.company.category)
                    .attr('data-company', posData.company.name)
                    .attr('data-rpdd-year', posData.company.rpddYear)
                    .attr('data-count', posData.company.entries.length);
            }
            
            // Add event listeners - type assertion to handle mixed element types
            if (node) {
                (node as unknown as d3.Selection<Element, unknown, null, undefined>)
                    .on('mouseover', function(this: Element, event: MouseEvent) {
                        const hoveredCategory = d3.select(this).attr('data-category');
                        const hoveredCompany = d3.select(this).attr('data-company');
                        const hoveredRpddYear = d3.select(this).attr('data-rpdd-year');
                        const hoveredCount = d3.select(this).attr('data-count');
                        
                        // Highlight all nodes of this company
                        d3.selectAll(`.radial-node[data-company="${hoveredCompany}"]`)
                            .attr('stroke', '#333')
                            .attr('stroke-width', 1.5);
                            
                        // Update tooltip
                        tooltipContent = { 
                            category: commercialStageCategories[hoveredCategory as keyof typeof commercialStageCategories]?.label || hoveredCategory, 
                            company: hoveredCompany || '',
                            rpddYear: hoveredRpddYear || '',
                            count: hoveredCount ? parseInt(hoveredCount) : 0
                        };
                        
                        // Position tooltip - ensure it's visible within viewport
                        const x = Math.min(event.clientX + 10, window.innerWidth - 200);
                        const y = Math.min(event.clientY + 10, window.innerHeight - 100);
                        tooltipPosition = { 
                            x: x + window.scrollX,
                            y: y + window.scrollY
                        };
                        tooltipVisible = true;
                    })
                    .on('mousemove', function(this: Element, event: MouseEvent) {
                        // Position tooltip as mouse moves
                        const x = Math.min(event.clientX + 10, window.innerWidth - 200);
                        const y = Math.min(event.clientY + 10, window.innerHeight - 100);
                        tooltipPosition = { 
                            x: x + window.scrollX,
                            y: y + window.scrollY
                        };
                    })
                    .on('mouseout', function(this: Element) {
                        // Remove highlight
                        const hoveredCompany = d3.select(this).attr('data-company');
                        if (hoveredCompany) {
                            d3.selectAll(`.radial-node[data-company="${hoveredCompany}"]`)
                                .attr('stroke', 'white')
                                .attr('stroke-width', 0.5);
                        }
                        
                        tooltipVisible = false;
                    })
                    .on('click', function(this: Element) {
                        // Handle node click for selection
                        const clickedCompany = d3.select(this).attr('data-company');
                        onCompanySelect(clickedCompany || '');
                    });
            }
        });

        // Add legend based on position
        const legendData = Object.entries(commercialStageCategories)
            .filter(([key]) => processedData.some(d => d.category === key))
            .map(([key, value]) => ({
                category: key,
                label: value.label,
                color: value.color,
                count: processedData.find(d => d.category === key)?.count || 0
            }));
        
        // Determine legend position based on available space
        const useRightLegend = legendPosition === 'right' && width >= 400;
        const legendMargin = width < 400 ? 10 : 10;
        
        // Adjust legend item sizing based on available space
        const legendItemSize = width < 400 ? 6 : 8;
        const legendFontSize = width < 400 ? '8px' : '10px';
        const legendSpacing = width < 400 ? 18 : 22;
        
        if (useRightLegend) {
            // Right-side legend
            const legendX = width / 2 + outerRadius + legendMargin;
            const legendY = (height - legendData.length * legendSpacing) / 2; // Center vertically
            
            const legend = svgSelection.append('g')
                .attr('class', 'legend')
                .attr('transform', `translate(${legendX}, ${legendY})`);
                
            // Legend title - only if enough space
            if (width > 450) {
                legend.append('text')
                    .attr('x', 0)
                    .attr('y', 14)
                    .attr('font-size', legendFontSize)
                    .attr('font-weight', 'bold')
                    .attr('fill', '#333')
                    .text('Commercial Stage');
            }
            
            // Legend items
            legendData.forEach((d, i) => {
                const yPos = (width > 450 ? 30 : 10) + (i * legendSpacing);
                
                const legendItem = legend.append('g')
                    .attr('transform', `translate(0, ${yPos})`)
                    .attr('class', 'legend-item');
                    
                legendItem.append('rect')
                    .attr('width', legendItemSize)
                    .attr('height', legendItemSize)
                    .attr('rx', 50)
                    .attr('ry', 50)
                    .attr('fill', d.color);
                    
                legendItem.append('text')
                    .attr('x', legendItemSize + 6)
                    .attr('y', legendItemSize / 2)
                    .attr('dy', '0.35em')
                    .attr('font-size', legendFontSize)
                    .attr('fill', '#333')
                    .text(`${d.label} (${d.count})`);
            });
        } else {
            // Bottom legend
            // Calculate space needed for each legend item
            const isMobile = width < 400;
            const itemWidth = isMobile ? 80 : 130; // Narrower on mobile
            const availableWidth = width - 20; // Subtract some margin
            const itemsPerRow = Math.max(1, Math.floor(availableWidth / itemWidth));
            const rows = Math.ceil(legendData.length / itemsPerRow);
            
            const legendY = height - (rows * legendSpacing) - 10;
            
            // Create legend items in rows
            legendData.forEach((d, i) => {
                const row = Math.floor(i / itemsPerRow);
                const col = i % itemsPerRow;
                
                // Center items in each row
                const rowWidth = Math.min(legendData.length - row * itemsPerRow, itemsPerRow) * itemWidth;
                const startX = (width - rowWidth) / 2;
                const xPos = startX + (col * itemWidth);
                const yPos = legendY + (row * legendSpacing);
                
                const legendItem = svgSelection.append('g')
                    .attr('transform', `translate(${xPos}, ${yPos})`)
                    .attr('class', 'legend-item');
                    
                legendItem.append('rect')
                    .attr('width', legendItemSize)
                    .attr('height', legendItemSize)
                    .attr('rx', 2)
                    .attr('ry', 2)
                    .attr('fill', d.color);
                    
                legendItem.append('text')
                    .attr('x', legendItemSize + 4)
                    .attr('y', legendItemSize / 2)
                    .attr('dy', '0.35em')
                    .attr('font-size', legendFontSize)
                    .attr('fill', '#333')
                    .text(isMobile ? d.label : `${d.label} (${d.count})`);
            });
        }
    }
    
    $: if (data && svg) {
        renderRadialChart();
    }
    
    // Re-render when arrangement mode changes or any other props change
    $: if (arrangementMode || width || height || innerRadius || outerRadius || nodeStyle || legendPosition || stackDepth) {
        // Re-render when any prop changes
        if (svg) renderRadialChart();
    }
    
    // Function to handle container resize
    function handleResize() {
        if (chart && svg) {
            // Recalculate dimensions and redraw
            calculateDimensions();
            renderRadialChart();
        }
    }
    
    onMount(() => {
        // Calculate initial dimensions
        calculateDimensions();
        renderRadialChart();
        
        // Add resize listener
        window.addEventListener('resize', handleResize);
        
        // Setup resize observer for container changes
        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(() => {
                handleResize();
            });
            
            if (chart) {
                resizeObserver.observe(chart);
            }
            
            // Clean up
            return () => {
                window.removeEventListener('resize', handleResize);
                if (chart) {
                    resizeObserver.unobserve(chart);
                }
                resizeObserver.disconnect();
            };
        } else {
            // Fallback for browsers without ResizeObserver
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    });
</script>

<div class="commercial-stage-radial-chart" bind:this={chart}>
    <div class="chart-controls">
        <button 
            class="toggle-btn"
            class:active={arrangementMode === 'year'} 
            on:click={() => arrangementMode = 'year'}
        >
            By Year
        </button>
        <button 
            class="toggle-btn"
            class:active={arrangementMode === 'category'}
            on:click={() => arrangementMode = 'category'}
        >
            By Category
        </button>
    </div>

    <div class="svg-container">
        <svg bind:this={svg}></svg>
    </div>
    
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
        min-height: 300px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
    }
    
    .svg-container {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        min-height: 350px; /* Minimum height for the chart */
    }
    
    .chart-controls {
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
        gap: 10px;
    }
    
    .toggle-btn {
        padding: 6px 12px;
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
    }
    
    .toggle-btn:hover {
        background-color: #e9e9e9;
    }
    
    .toggle-btn.active {
        background-color: #2563EB;
        color: white;
        border-color: #2563EB;
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
    
    :global(.legend-item:hover) {
        opacity: 0.8;
    }
    
    @media (max-width: 768px) {
        .commercial-stage-radial-chart {
            min-height: 250px;
        }
        
        .tooltip {
            font-size: 10px;
            padding: 6px;
            max-width: 160px;
        }
        
        .toggle-btn {
            padding: 4px 8px;
            font-size: 12px;
        }
    }
</style> 