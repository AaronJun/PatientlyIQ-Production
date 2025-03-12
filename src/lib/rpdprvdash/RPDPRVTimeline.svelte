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
    
    let svg: SVGElement;
    let showRestrictedModal = false;
    let isMobile = false;
    let isTablet = false;
    let isDropdownOpen = false;
    let dropdownRef: HTMLDivElement;
    
    // Responsive dimensions
    let margin = { top: 12, right: 20, bottom: 20, left: 40 };
    let width = 125;
    let height = 800;
    
    // Create event dispatcher
    const dispatch = createEventDispatcher<{
        yearSelect: { year: string };
    }>();
    
    // Update dimensions based on screen size
    function updateDimensions() {
        isMobile = window.innerWidth < 768;
        isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        
        if (isMobile) {
            width = Math.min(window.innerWidth - 40, 800);
            height = 75;
            margin = { top: 6, right: 12, bottom: 10, left: 12 };
        } else if (isTablet) {
            width = Math.min(window.innerWidth - 40, 800);
            height = 75;
            margin = { top: 6, right: 12, bottom: 10, left: 12 };
        } else {
            width = 125;
            height = 800;
            margin = { top: 20, right: 20, bottom: 20, left: 40 };
        }
        if (data.length > 0 && svg) {
            createVisualization();
        }
    }
    
    onMount(() => {
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        document.addEventListener('click', handleClickOutside);
        
        return () => {
            window.removeEventListener('resize', updateDimensions);
            document.removeEventListener('click', handleClickOutside);
        };
    });
    
    function isYearRestricted(year: string): boolean {
        return parseInt(year) < 2020;
    }
    
    function toggleDropdown(event: Event) {
        event.stopPropagation();
        isDropdownOpen = !isDropdownOpen;
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
    
    $: yearData = Object.entries(
        data.reduce((acc, entry) => {
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

    // Create gradient strings for each year
    $: yearGradients = yearData.reduce((acc, yearEntry) => {
        const gradientColors = yearEntry.areas
            .map(area => getTherapeuticAreaColor(area.area).fill)
            .join(', ');
        acc[yearEntry.year] = `linear-gradient(135deg, ${gradientColors})`;
        return acc;
    }, {} as Record<string, string>);

    function createGradientId(year: string): string {
        return `gradient-${year}`;
    }

    function createVisualization() {
        if (!svg || !yearData.length) return;

        const svgElement = d3.select(svg);
        svgElement.selectAll("*").remove();

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Create scale based on orientation
        const mainScale = isMobile 
            ? d3.scalePoint()
                .domain(yearData.map(d => d.year))
                .range([margin.left, innerWidth - 60]) // Leave space at right for "All Years"
                .padding(0.5)
            : d3.scalePoint()
                .domain(yearData.map(d => d.year))
                .range([margin.top, innerHeight - 60]) // Leave space at bottom for "All Years"
                .padding(0.5);

        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(yearData, d => d.count) || 0])
            .range([4, 16]);

        const g = svgElement.append("g")
            .attr("transform", isMobile ? `translate(0,${margin.top})` : `translate(${margin.left},0)`);

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

        // Add connecting line
        g.append("line")
            .attr("x1", isMobile ? margin.left : innerWidth / 2)
            .attr("x2", isMobile ? innerWidth - 10 : innerWidth / 2)
            .attr("y1", isMobile ? innerHeight / 2 : margin.top - 10)
            .attr("y2", isMobile ? innerHeight / 2 : innerHeight - 10)
            .attr("stroke", "#666666")
            .attr("stroke-width", 0.5)
            .attr("stroke-dasharray", "3,3");

        // Create year groups
        const yearGroups = g.selectAll(".year-group")
            .data(yearData)
            .join("g")
            .attr("class", "year-group")
            .attr("transform", d => isMobile 
                ? `translate(${mainScale(d.year)},${innerHeight / 2})` 
                : `translate(${innerWidth / 2},${mainScale(d.year)})`);

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
                    // Use d3.select(this).node()?.parentElement instead of this.parentNode
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

                    // Use d3.select(this).node()?.parentElement instead of this.parentNode
                    if (parentElement) {
                        d3.select(parentElement)
                            .select(".year-label")
                            .transition()
                            .duration(200)
                            .attr("font-weight", "600")
                            .attr("fill", isYearRestricted(d.year) ? "#9CA3AF" : "#FF1515");
                        
                        // Check if count-label exists before selecting it
                        if (d3.select(parentElement).select(".count-label").size() > 0) {
                            d3.select(parentElement)
                                .select(".count-label")
                                .transition()
                                .duration(200)
                                .attr("opacity", 1);
                        }
                    }
                }
            })
            .on("mouseleave", function(event, d) {
                if (d.year !== selectedYear) {
                    // Use d3.select(this).node()?.parentElement instead of this.parentNode
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

                    // Use d3.select(this).node()?.parentElement instead of this.parentNode
                    if (parentElement) {
                        d3.select(parentElement)
                            .select(".year-label")
                            .transition()
                            .duration(200)
                            .attr("font-weight", "400")
                            .attr("fill", isYearRestricted(d.year) ? "#9CA3AF" : "#718096");
                        
                        // Check if count-label exists before selecting it
                        if (d3.select(parentElement).select(".count-label").size() > 0) {
                            d3.select(parentElement)
                                .select(".count-label")
                                .transition()
                                .duration(200)
                                .attr("opacity", 0.6);
                        }
                    }
                }
            });

        // Add year labels
        yearGroups.append("text")
            .attr("class", "year-label")
            .attr("x", isMobile ? 0 : -radiusScale(d3.max(yearData, d => d.count) || 0))
            .attr("y", isMobile ? 30 : -40) // Position based on orientation
            .attr("text-anchor", "middle")
            .attr("transform", isMobile ? "rotate(0)" : "rotate(-90)")
            .attr("fill", d => isYearRestricted(d.year) ? "#9CA3AF" : "#718096")
            .attr("font-size", "9.75px")
            .style("dominant-baseline", isMobile ? "hanging" : "end")
            .style("font-family", "'IBM Plex Mono', monospace")
            .text(d => d.year);
            
        // Create "All Years" circle at the bottom/right
        const allYearsGroup = g.append("g")
            .attr("class", "all-years-group")
            .attr("transform", isMobile 
                ? `translate(${innerWidth - 30}, ${innerHeight / 2})` 
                : `translate(${innerWidth / 2}, ${innerHeight + 10})`)
            .attr("cursor", "pointer");
            
        // Create highlight circle for "All Years"
        allYearsGroup.append("circle")
            .attr("class", "highlight-circle")
            .attr("r", 25) // Larger than regular circles
            .attr("fill", "none")
            .attr("stroke", "#4fd1c5")
            .attr("stroke-width", 5)
            .attr("opacity", selectedYear === "All" ? 0.5 : 0);
            
        // Create main circle for "All Years"
        allYearsGroup.append("circle")
            .attr("class", "year-circle")
            .attr("r", 22) // Larger than regular circles
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
            
        // Add "All Years" label
        allYearsGroup.append("text")
            .attr("class", "year-label")
            .attr("y", isMobile ? 30 : -42) // Position based on orientation
            .attr("text-anchor", "middle")
            .attr("transform", isMobile ? "rotate(0)" : "rotate(-90)")
            .attr("fill", "#718096")
            .attr("font-size", "9.75px")
            .style("dominant-baseline", isMobile ? "hanging" : "end")
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
</script>

{#if isMobile || isTablet}
    <!-- Dropdown menu for mobile and tablet -->
    <div class="dropdown-container relative w-full">
        <button 
            class="dropdown-toggle flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-slate-700 bg-white rounded-md shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 focus:outline-none"
            on:click={toggleDropdown}
        >
            <div class="flex items-center gap-2">
                {#if selectedYear === "All"}
                    <div class="w-5 h-5 rounded-full" style="background: linear-gradient(135deg, #667EEA, #764BA2, #FF6B6B, #38B2AC, #68D391)"></div>
                    <span>All Years</span>
                {:else}
                    {#each yearData as yearEntry}
                        {#if yearEntry.year === selectedYear}
                            <div class="w-5 h-5 rounded-full" style="background: {yearGradients[yearEntry.year]}"></div>
                            <span>{yearEntry.year}</span>
                        {/if}
                    {/each}
                {/if}
            </div>
            <ChevronDown 
                size={16} 
                class="transform transition-transform duration-200 {isDropdownOpen ? 'rotate-180' : ''}"
            />
        </button>

        {#if isDropdownOpen}
            <div 
                class="dropdown-menu absolute left-0 z-20 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-slate-200 max-h-[60vh] overflow-y-auto"
                bind:this={dropdownRef}
            >
                <div class="py-1">
                    <!-- All Years option -->
                    <button 
                        class="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 {selectedYear === 'All' ? 'bg-slate-100 font-medium' : ''}"
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
    <!-- Original vertical timeline for desktop -->
    <svg bind:this={svg} width={width} height={height}></svg>
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
        <div class="p-4 bg-amber-50 rounded-md">
            <p class="text-amber-800 text-sm">
                Please contact your administrator for access to historical data.
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
    .timeline-container {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
    }
    
    .timeline-header {
        margin-bottom: 0.5rem;
        text-align: center;
        letter-spacing: 0.05em;
    }

    :global(.year-group) {
        transition: all 0.3s ease;
    }
    
    /* Dropdown styles */
    .dropdown-container {
        position: relative;
        z-index: 30;
    }
    
    .dropdown-menu {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    /* Media query for mobile devices */
    @media (max-width: 768px) {
        .timeline-container {
            flex-direction: column;
        }
    }
</style>