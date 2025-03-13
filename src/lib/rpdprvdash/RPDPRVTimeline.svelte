<!-- RPDPRVVerticalTimeline.svelte -->
<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import * as d3 from 'd3';
    import { getTherapeuticAreaColor } from './utils/colorDefinitions';
    import * as Dialog from "$lib/components/ui/dialog";
    import { ChevronDown } from 'carbon-icons-svelte';
    
    export let data: any[] = [];
    export let onYearSelect: (year: string) => void;
    export let selectedYear: string | null = null;
    
    let svg: SVGElement | null = null;
    let container: HTMLDivElement;
    let showRestrictedModal = false;
    let isMobile = false;
    let isTablet = false;
    let isDropdownOpen = false;
    let dropdownRef: HTMLDivElement | null = null;
    
    // Responsive margins with relative values
    let margin = { top: 5, right: 5, bottom: 5, left: 5 };
    
    // Create event dispatcher
    const dispatch = createEventDispatcher<{
        yearSelect: { year: string };
    }>();
    
    // Update dimensions based on screen size
    function updateDimensions() {
        isMobile = window.innerWidth < 768;
        isTablet = window.innerWidth >= 768 && window.innerWidth < 1200;
        
        if (isMobile || isTablet) {
            margin = { top: 6, right: 12, bottom: 30, left: 12 };
        } else {
            margin = { top: 20, right: 20, bottom: 40, left: 20 };
        }
        
        // Only create visualization if we're in desktop mode or if data is available for mobile dropdown
        if (data.length > 0) {
            if (!isMobile && !isTablet && svg) {
                createVisualization();
            } else if ((isMobile || isTablet) && yearData.length === 0) {
                // Force reactive update of yearData for mobile view
                yearData = calculateYearData(data);
                yearGradients = calculateYearGradients(yearData);
            }
        }
    }
    
    // Extract yearData calculation to a separate function for reuse
    function calculateYearData(inputData: any[]): Array<{year: string; count: number; areas: Array<{area: string; count: number; percentage: number}>}> {
        return Object.entries(
            inputData.reduce((acc: Record<string, { count: number; areas: Record<string, number> }>, entry: any) => {
                const year = entry["PRV Issue Year"] || entry["RPDD Year"];
                if (!year) return acc;
                
                if (!acc[year]) {
                    acc[year] = {
                        count: 0,
                        areas: {}
                    };
                }
                acc[year].count += 1;
                const area = entry.TherapeuticArea1;
                if (area) {
                    acc[year].areas[area] = (acc[year].areas[area] || 0) + 1;
                }
                return acc;
            }, {} as Record<string, { count: number; areas: Record<string, number> }>)
        )
        .map(([year, data]) => ({
            year,
            count: (data as any).count,
            areas: Object.entries((data as any).areas)
                .map(([area, count]) => ({
                    area,
                    count: count as number,
                    percentage: (count as number) / (data as any).count
                }))
                .sort((a, b) => b.percentage - a.percentage)
        }))
        .sort((a, b) => a.year.localeCompare(b.year));
    }
    
    // Extract yearGradients calculation to a separate function for reuse
    function calculateYearGradients(yearDataInput: Array<{year: string; count: number; areas: Array<{area: string; count: number; percentage: number}>}>): Record<string, string> {
        return yearDataInput.reduce((acc: Record<string, string>, yearEntry) => {
            const gradientColors = yearEntry.areas
                .map((area: {area: string; count: number; percentage: number}) => getTherapeuticAreaColor(area.area).fill)
                .join(', ');
            acc[yearEntry.year] = `linear-gradient(135deg, ${gradientColors})`;
            return acc;
        }, {} as Record<string, string>);
    }
    
    // Use the extracted functions for reactive declarations
    $: yearData = calculateYearData(data);
    $: yearGradients = calculateYearGradients(yearData);
    
    // Add resize observer
    let resizeObserver: ResizeObserver;
    
    onMount(() => {
        // Initialize ResizeObserver to watch container size changes
        resizeObserver = new ResizeObserver(() => {
            if (svg) {
                createVisualization();
            }
        });
        
        if (container) {
            resizeObserver.observe(container);
        }
        
        window.addEventListener('resize', updateDimensions);
        document.addEventListener('click', handleClickOutside);
        
        // Ensure yearData is initialized for mobile view
        if ((isMobile || isTablet) && data.length > 0 && yearData.length === 0) {
            yearData = calculateYearData(data);
            yearGradients = calculateYearGradients(yearData);
        }
        
        // Log initial state for debugging
        console.log('Component mounted:', {
            isMobile,
            isTablet,
            dataLength: data.length,
            yearDataLength: yearData.length,
            selectedYear
        });
        
        return () => {
            window.removeEventListener('resize', updateDimensions);
            document.removeEventListener('click', handleClickOutside);
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    });
    
    function isYearRestricted(year: string): boolean {
        return parseInt(year) < 2020;
    }
    
    function toggleDropdown(event: Event) {
        event.stopPropagation();
        isDropdownOpen = !isDropdownOpen;
        
        // Force a DOM update to ensure the dropdown is properly rendered
        setTimeout(() => {
            if (isDropdownOpen && dropdownRef) {
                // Ensure the dropdown is visible
                dropdownRef.style.display = 'block';
                dropdownRef.style.visibility = 'visible';
                dropdownRef.style.opacity = '1';
                
                // Log for debugging
                console.log('Dropdown toggled:', isDropdownOpen, dropdownRef);
            }
        }, 0);
    }
    
    function handleYearSelect(year: string) {
        selectedYear = year;
        onYearSelect(year);
        dispatch('yearSelect', { year });
        isDropdownOpen = false;
    }
    
    function handleClickOutside(event: MouseEvent) {
        if (dropdownRef && !dropdownRef.contains(event.target as Node) && isDropdownOpen) {
            isDropdownOpen = false;
        }
    }
    
    function createGradientId(year: string): string {
        return `gradient-${year}`;
    }

    function createVisualization() {
        if (!svg || !yearData.length) return;

        const svgElement = d3.select(svg);
        svgElement.selectAll("*").remove();

        // Get the SVG dimensions from its computed style
        const svgNode = svg as SVGSVGElement;
        const width = svgNode.clientWidth;
        const height = svgNode.clientHeight;
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Update viewBox to match container size
        svgElement
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", "100%")
            .attr("height", "100%");

        // Create scale based on orientation - now horizontal
        const mainScale = d3.scalePoint()
            .domain(yearData.map(d => d.year))
            .range([margin.left, innerWidth - 60]) // Leave space at right for "All Years"
            .padding(0.5);

        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(yearData, d => d.count) || 0])
            .range([4, 16]);

        const g = svgElement.append("g")
            .attr("transform", `translate(0,${margin.top})`);

        // Create gradients
        const defs = svgElement.append("defs");
        yearData.forEach(yearEntry => {
            const gradient = defs.append("linearGradient")
                .attr("id", createGradientId(yearEntry.year))
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "100%");

            let currentPosition = 0;
            yearEntry.areas.forEach(area => {
                const colorCombo = getTherapeuticAreaColor(area.area);
                
                gradient.append("stop")
                    .attr("offset", `${currentPosition * 100}%`)
                    .attr("stop-color", colorCombo.fill);

                currentPosition += area.percentage;

                gradient.append("stop")
                    .attr("offset", `${currentPosition * 100}%`)
                    .attr("stop-color", colorCombo.fill);
            });
        });

        // Create a special gradient for "All Years"
        const allYearsGradient = defs.append("linearGradient")
            .attr("id", "gradient-all-years")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%");

        // Get all unique therapeutic areas
        const allAreas = new Set<string>();
        yearData.forEach(yearEntry => {
            yearEntry.areas.forEach(area => {
                allAreas.add(area.area);
            });
        });

        // Add all therapeutic areas to the gradient
        const uniqueAreas = Array.from(allAreas);
        uniqueAreas.forEach((area, index) => {
            const colorCombo = getTherapeuticAreaColor(area);
            const position = index / uniqueAreas.length;
            
            allYearsGradient.append("stop")
                .attr("offset", `${position * 100}%`)
                .attr("stop-color", colorCombo.fill);
                
            if (index < uniqueAreas.length - 1) {
                allYearsGradient.append("stop")
                    .attr("offset", `${(position + 1/uniqueAreas.length) * 100}%`)
                    .attr("stop-color", colorCombo.fill);
            }
        });

        // Create glow filter
        const filter = defs.append("filter")
            .attr("id", "glow")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "400%")
            .attr("height", "400%");

        filter.append("feGaussianBlur")
            .attr("stdDeviation", "2")
            .attr("result", "coloredBlur");

        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode")
            .attr("in", "coloredBlur");
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");


        // Create year groups - positioned horizontally
        const yearGroups = g.selectAll(".year-group")
            .data(yearData)
            .join("g")
            .attr("class", "year-group")
            .attr("transform", d => `translate(${mainScale(d.year)},${innerHeight / 2})`);

        // Add highlight circles
        yearGroups.append("circle")
            .attr("class", "highlight-circle")
            .attr("r", d => radiusScale(d.count) + 4)
            .attr("fill", "none")
            .attr("stroke", "#4fd1c5")
            .attr("stroke-width", 5)
            .attr("opacity", 0);

        // Add main circles
        yearGroups.append("circle")
            .attr("class", "year-circle")
            .attr("r", d => radiusScale(d.count))
            .attr("fill", d => `url(#${createGradientId(d.year)})`)
            .attr("stroke", "#37587e")
            .attr("stroke-width", 1.5)
            .style("cursor", "pointer")
            .style("opacity", d => isYearRestricted(d.year) ? 0.5 : 1)
            .on("click", (event, d) => {
                handleYearClick(d);
            })
            .on("mouseenter", function(event, d) {
                if (d.year !== selectedYear) {
                    const parentElement = d3.select(this).node()?.parentElement;
                    if (parentElement) {
                        d3.select(parentElement)
                            .select(".highlight-circle")
                            .transition()
                            .duration(200)
                            .attr("opacity", 0.325);
                    }

                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("stroke-width", 2)
                        .style("filter", "url(#glow)");

                    if (parentElement) {
                        d3.select(parentElement)
                            .select(".year-label")
                            .transition()
                            .duration(200)
                            .attr("font-weight", "600")
                            .attr("fill", isYearRestricted(d.year) ? "#9CA3AF" : "#FF1515");
                    }
                }
            })
            .on("mouseleave", function(event, d) {
                if (d.year !== selectedYear) {
                    const parentElement = d3.select(this).node()?.parentElement;
                    if (parentElement) {
                        d3.select(parentElement)
                            .select(".highlight-circle")
                            .transition()
                            .duration(200)
                            .attr("opacity", 0);
                    }

                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("stroke-width", 1.5)
                        .style("filter", "none");

                    if (parentElement) {
                        d3.select(parentElement)
                            .select(".year-label")
                            .transition()
                            .duration(200)
                            .attr("font-weight", "400")
                            .attr("fill", isYearRestricted(d.year) ? "#9CA3AF" : "#718096");
                    }
                }
            });

        // Add year labels - now below circles
        yearGroups.append("text")
            .attr("class", "year-label")
            .attr("x", 0)
            .attr("y", radiusScale(d3.max(yearData, d => d.count) || 0) + 20)
            .attr("text-anchor", "middle")
            .attr("fill", d => isYearRestricted(d.year) ? "#9CA3AF" : "#718096")
            .attr("font-size", "9.75px")
            .style("dominant-baseline", "top")
            .style("font-family", "'IBM Plex Mono', monospace")
            .text(d => d.year);
            
        // Create "All Years" circle at the right
        const allYearsGroup = g.append("g")
            .attr("class", "all-years-group")
            .attr("transform", `translate(${innerWidth - 30}, ${innerHeight / 2})`)
            .attr("cursor", "pointer");
            
        // Create highlight circle for "All Years"
        allYearsGroup.append("circle")
            .attr("class", "highlight-circle")
            .attr("r", 25)
            .attr("fill", "none")
            .attr("stroke", "#4fd1c5")
            .attr("stroke-width", 5)
            .attr("opacity", selectedYear === "All" ? 0.5 : 0);
            
        // Create main circle for "All Years"
        allYearsGroup.append("circle")
            .attr("class", "year-circle")
            .attr("r", 22)
            .attr("fill", "url(#gradient-all-years)")
            .attr("stroke", "#565656")
            .attr("stroke-width", selectedYear === "All" ? 4 : 2.5)
            .style("filter", selectedYear === "All" ? "url(#glow)" : "none")
            .style("cursor", "pointer")
            .on("click", () => {
                handleYearClick({ year: "All" });
            })
            .on("mouseenter", function() {
                if (selectedYear !== "All") {
                    allYearsGroup.select(".highlight-circle")
                        .transition()
                        .duration(200)
                        .attr("opacity", 0.325);
                        
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("stroke-width", 2)
                        .style("filter", "url(#glow)");
                        
                    allYearsGroup.select(".year-label")
                        .transition()
                        .duration(200)
                        .attr("font-weight", "600")
                        .attr("fill", "#FF1515");
                }
            })
            .on("mouseleave", function() {
                if (selectedYear !== "All") {
                    allYearsGroup.select(".highlight-circle")
                        .transition()
                        .duration(200)
                        .attr("opacity", 0);
                        
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("stroke-width", 1.5)
                        .style("filter", "none");
                        
                    allYearsGroup.select(".year-label")
                        .transition()
                        .duration(200)
                        .attr("font-weight", "400")
                        .attr("fill", "#718096");
                }
            });
            
        // Add "All Years" label - now below circle
        allYearsGroup.append("text")
            .attr("class", "year-label")
            .attr("x", 0)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("fill", "#718096")
            .attr("font-size", "9.75px")
            .style("dominant-baseline", "hanging")
            .style("font-family", "'IBM Plex Mono', monospace")
            .text("All");

        updateSelection();
    }

    function updateSelection() {
        if (!svg) return;

        // Update "All Years" circle state
        const allYearsGroup = d3.select(svg).select(".all-years-group");
        if (!allYearsGroup.empty()) {
            allYearsGroup.select(".highlight-circle")
                .transition()
                .duration(300)
                .attr("opacity", selectedYear === "All" ? 0.5 : 0);
                
            allYearsGroup.select(".year-circle")
                .transition()
                .duration(300)
                .attr("stroke-width", selectedYear === "All" ? 3 : 1.5)
                .style("filter", selectedYear === "All" ? "url(#glow)" : "none");
                
            allYearsGroup.select(".year-label")
                .transition()
                .duration(300)
                .attr("font-weight", selectedYear === "All" ? "600" : "400")
                .attr("fill", selectedYear === "All" ? "#FF1515" : "#718096");
        }

        // Update year circles state
        d3.select(svg)
            .selectAll(".year-group")
            .each(function(d: any) {
                const group = d3.select(this);
                const isSelected = d.year === selectedYear;
                const isRestricted = isYearRestricted(d.year);

                group.select(".highlight-circle")
                    .transition()
                    .duration(300)
                    .attr("opacity", isSelected ? 0.5 : 0);

                group.select(".year-circle")
                    .transition()
                    .duration(300)
                    .attr("stroke-width", isSelected ? 3 : 1.5)
                    .style("filter", isSelected ? "url(#glow)" : "none")
                    .style("opacity", isRestricted ? 0.5 : 1);

                group.select(".year-label")
                    .transition()
                    .duration(300)
                    .attr("font-weight", isSelected ? "600" : "400")
                    .attr("fill", isSelected ? "#FF1515" : (isRestricted ? "#9CA3AF" : "#718096"));
            });
    }

    function handleYearClick(d: any) {
        if (isYearRestricted(d.year)) {
            showRestrictedModal = true;
        } else {
            selectedYear = d.year;
            onYearSelect(d.year);
            updateSelection();
        }
    }

    $: if (data.length > 0 && svg) {
        createVisualization();
    }

    // Add these new functions to handle hover states
    function handleYearHover(yearEntry: any) {
        if (yearEntry.year !== selectedYear) {
            // The hover effects are now handled by CSS
        }
    }

    function handleYearLeave(yearEntry: any) {
        if (yearEntry.year !== selectedYear) {
            // The leave effects are now handled by CSS
        }
    }

    // Helper function to calculate circle radius
    function radiusScale(count: number): number {
        const minRadius = 8;
        const maxRadius = 22;
        const maxCount = Math.max(...yearData.map(d => d.count));
        return minRadius + (maxRadius - minRadius) * (count / maxCount);
    }
</script>

{#if isMobile || isTablet}
    <!-- Dropdown menu for mobile and tablet -->
    <div class="dropdown-container z-50 mx-16 bg-white rounded-sm relative h-full w-full" style="min-height: 20px;">
        <button 
            class="dropdown-toggle flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 focus:outline-none"
            on:click={toggleDropdown}
        >
            <div class="flex items-center gap-2">
                {#if selectedYear === "All"}
                    <div class="w-5 h-5 rounded-full" style="background: linear-gradient(135deg, #667EEA, #764BA2, #FF6B6B, #38B2AC, #68D391)"></div>
                    <span>All Years</span>
                {:else if selectedYear && yearData.length > 0}
                    {#each yearData.filter(entry => entry.year === selectedYear) as yearEntry}
                        <div class="w-5 h-5 rounded-full" style="background: {yearGradients[yearEntry.year] || 'gray'}"></div>
                        <span>{yearEntry.year}</span>
                    {/each}
                {:else}
                    <div class="w-5 h-5 rounded-full"></div>
                    <span>Select Year</span>
                {/if}
            </div>
            <ChevronDown 
                size={16} 
                class="transform transition-transform duration-200 {isDropdownOpen ? 'rotate-180' : ''}"
            />
        </button>

        {#if isDropdownOpen}
            <div 
                class="dropdown-menu absolute left-0 right-0 z-50 mt-2 rounded-md shadow-lg bg-white ring-1 ring-slate-200 max-h-[60vh] overflow-y-auto"
                bind:this={dropdownRef}
                style="position: absolute; top: 100%; width: 100%; z-index: 9999;"
            >
                <div class="py-1">
                    <!-- All Years option -->
                    <button 
                        class="flex items-center gap-2 w-full text-left px-4 py-2 text-[9.25px] text-slate-700 hover:bg-slate-100 {selectedYear === 'All' ? 'bg-slate-100 font-medium' : ''}"
                        on:click={() => handleYearSelect('All')}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20">
                            <defs>
                                <linearGradient id="dropdown-all-years" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#667EEA" />
                                    <stop offset="25%" stop-color="#764BA2" />
                                    <stop offset="50%" stop-color="#FF6B6B" />
                                    <stop offset="75%" stop-color="#38B2AC" />
                                    <stop offset="100%" stop-color="#68D391" />
                                </linearGradient>
                            </defs>
                            <circle cx="10" cy="10" r="8" fill="url(#dropdown-all-years)" stroke="#37587e" stroke-width="1" />
                        </svg>
                        All Years
                    </button>
                    
                    <!-- Year options -->
                    {#each yearData as yearEntry}
                        <button 
                            class="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 {selectedYear === yearEntry.year ? 'bg-slate-100 font-medium' : ''}"
                            on:click={() => handleYearSelect(yearEntry.year)}
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20">
                                <defs>
                                    <linearGradient id="dropdown-{yearEntry.year}" x1="0%" y1="0%" x2="100%" y2="100%">
                                        {#each yearEntry.areas as area, i}
                                            {#if i === 0}
                                                <stop offset="0%" stop-color={getTherapeuticAreaColor(area.area).fill} />
                                            {/if}
                                            <stop offset="{i * (100 / yearEntry.areas.length)}%" stop-color={getTherapeuticAreaColor(area.area).fill} />
                                            <stop offset="{(i + 1) * (100 / yearEntry.areas.length)}%" stop-color={getTherapeuticAreaColor(area.area).fill} />
                                        {/each}
                                    </linearGradient>
                                </defs>
                                <circle 
                                    cx="10" 
                                    cy="10" 
                                    r="{Math.max(4, Math.min(8, yearEntry.count / 5))}" 
                                    fill="url(#dropdown-{yearEntry.year})" 
                                    stroke="#37587e" 
                                    stroke-width="1" 
                                />
                            </svg>
                            {yearEntry.year}
                        </button>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
{:else}
    <!-- Timeline for desktop - now using CSS Grid -->
    <div class="timeline-container backdrop-blur-sm shadow-md" bind:this={container}>
        <!-- SVG definitions for gradients -->
        <svg width="0" height="0" aria-hidden="true">
            <defs>
                <!-- Gradients for each year -->
                {#each yearData as yearEntry}
                    <linearGradient id="gradient-{yearEntry.year}" x1="0%" y1="0%" x2="100%" y2="100%">
                        {#each yearEntry.areas as area, i}
                            <stop 
                                offset="{i * (100 / yearEntry.areas.length)}%" 
                                stop-color={getTherapeuticAreaColor(area.area).fill}
                            />
                            <stop 
                                offset="{(i + 1) * (100 / yearEntry.areas.length)}%" 
                                stop-color={getTherapeuticAreaColor(area.area).fill}
                            />
                        {/each}
                    </linearGradient>
                {/each}
                
                <!-- Special gradient for "All Years" -->
                <linearGradient id="gradient-all-years" x1="0%" y1="0%" x2="100%" y2="100%">
                    {#each Array.from(new Set(yearData.flatMap(y => y.areas.map(a => a.area)))) as area, i}
                        <stop 
                            offset="{i * (100 / yearData.length)}%" 
                            stop-color={getTherapeuticAreaColor(area).fill}
                        />
                    {/each}
                </linearGradient>
                
                <!-- Glow filter -->
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
        </svg>

        <div class="timeline-grid">
            {#each yearData as yearEntry}
                <div class="year-item">
                    <button 
                        class="circle-container"
                        class:restricted={isYearRestricted(yearEntry.year)}
                        class:selected={yearEntry.year === selectedYear}
                        on:click={() => handleYearClick(yearEntry)}
                        on:mouseenter={() => handleYearHover(yearEntry)}
                        on:mouseleave={() => handleYearLeave(yearEntry)}
                        on:keydown={(e) => e.key === 'Enter' && handleYearClick(yearEntry)}
                        aria-label={`Select year ${yearEntry.year}`}
                        type="button"
                    >
                        <!-- Highlight circle -->
                        <div 
                            class="highlight-circle"
                            style="
                                width: {(radiusScale(yearEntry.count) + 4) * 2}px;
                                height: {(radiusScale(yearEntry.count) + 4) * 2}px;
                                opacity: {yearEntry.year === selectedYear ? 0.5 : 0};
                            "
                        ></div>
                        <!-- Main circle with SVG gradient -->
                        <svg 
                            class="main-circle-svg"
                            width={radiusScale(yearEntry.count) * 2}
                            height={radiusScale(yearEntry.count) * 2}
                            style="filter: {yearEntry.year === selectedYear ? 'url(#glow)' : 'none'};"
                        >
                            <circle 
                                cx={radiusScale(yearEntry.count)}
                                cy={radiusScale(yearEntry.count)}
                                r={radiusScale(yearEntry.count) - 1.5}
                                fill="url(#gradient-{yearEntry.year})"
                                stroke="#37587e"
                                stroke-width="1.5"
                            />
                        </svg>
                    </button>
                    <div 
                        class="year-label"
                        class:selected={yearEntry.year === selectedYear}
                        class:restricted={isYearRestricted(yearEntry.year)}
                    >
                        {yearEntry.year}
                    </div>
                </div>
            {/each}

            <!-- "All Years" item -->
            <div class="year-item all-years">
                <button 
                    class="circle-container"
                    class:selected={"All" === selectedYear}
                    on:click={() => handleYearClick({ year: "All" })}
                    on:mouseenter={() => handleYearHover({ year: "All" })}
                    on:mouseleave={() => handleYearLeave({ year: "All" })}
                    on:keydown={(e) => e.key === 'Enter' && handleYearClick({ year: "All" })}
                    aria-label="Select all years"
                    type="button"
                >
                    <!-- Highlight circle -->
                    <div 
                        class="highlight-circle"
                        style="
                            width: 50px;
                            height: 50px;
                            opacity: {"All" === selectedYear ? 0.5 : 0};
                        "
                    ></div>
                    <!-- Main circle with SVG gradient -->
                    <svg 
                        class="main-circle-svg"
                        width="44"
                        height="44"
                        style="filter: {"All" === selectedYear ? 'url(#glow)' : 'none'};"
                    >
                        <circle 
                            cx="22"
                            cy="22"
                            r="20.5"
                            fill="url(#gradient-all-years)"
                            stroke="#565656"
                            stroke-width="1.5"
                        />
                    </svg>
                </button>
                <div 
                    class="year-label"
                    class:selected={"All" === selectedYear}
                >
                    All
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Restricted Year Modal -->
<Dialog.Root bind:open={showRestrictedModal}>
    <Dialog.Content class="sm:max-w-md">
        <Dialog.Header>
            <Dialog.Title>Restricted Year</Dialog.Title>
            <Dialog.Description>
                Data for years prior to 2023 is restricted in this preview version.
            </Dialog.Description>
        </Dialog.Header>
        <div class="p-4">
            <p class="text-slate-800 text-sm">
                Please contact us at team@patiently.studio for access to historical data.
            </p>
        </div>
        <Dialog.Footer>
            <Dialog.Close asChild>
                <button class="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-md text-sm font-medium">
                    Close
                </button>
            </Dialog.Close>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<style>
    .dropdown-container {
        z-index: 9999;
    }

    .timeline-container {
        width: 100%;
        position: relative;
        overflow: hidden;
    }

    .timeline-grid {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
        padding: 2rem;
        align-items: center;
        position: relative;
    }

    .timeline-grid::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 2rem;
        right: 2rem;
        height: 1px;
        background: #666666;
        border-top: 1px dashed #666666;
        transform: translateY(-50%);
        z-index: 0;
    }

    .year-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        position: relative;
        z-index: 1;
    }

    .circle-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: transparent;
        border: none;
        padding: 0;
    }

    .highlight-circle {
        position: absolute;
        border-radius: 50%;
        border: 5px solid #4fd1c5;
        transition: all 0.3s ease;
        pointer-events: none;
    }

    .main-circle-svg {
        transition: all 0.3s ease;
        z-index: 2;
    }

    .circle-container:hover .highlight-circle {
        opacity: 0.325 !important;
    }

    .circle-container:hover .main-circle-svg {
        filter: url(#glow) !important;
    }

    .circle-container:hover .main-circle-svg circle {
        stroke-width: 2px;
    }

    .year-label {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 9.75px;
        color: #718096;
        transition: all 0.3s ease;
    }

    .year-label.selected {
        color: #FF1515;
        font-weight: 600;
    }

    .restricted .main-circle-svg circle {
        opacity: 0.5;
    }

    .restricted .year-label {
        color: #9CA3AF;
    }

    .all-years {
        margin-left: auto;
    }

    @media (max-width: 768px) {
        .timeline-grid {
            padding: 1rem;
            gap: 0.5rem;
        }

        .year-label {
            font-size: 8px;
        }
        
        .timeline-container {
            padding: 0.5rem 1rem;
        }
    }
</style>