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
    export let isTransactionView: boolean = false;
    
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
            margin = { top: 2, right: 2, bottom: 4, left: 2 };
        } else {
            margin = { top: 8, right: 8, bottom: 10, left: 10 };
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
            .padding(0.2);

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
            .attr("r", d => isTransactionView 
                ? radiusScale(d.totalValue || 0) + 4
                : radiusScale(d.count) + 4)
            .attr("fill", "none")
            .attr("stroke", isTransactionView ? "#55D88E" : "#4fd1c5") // Different colors for transaction vs regular
            .attr("stroke-width", 5)
            .attr("opacity", 0);

        // Add main circles
        yearGroups.append("circle")
            .attr("class", "year-circle")
            .attr("fill", d => `url(#${createGradientId(d.year)})`)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .style("cursor", "pointer")
            .style("opacity", d => isYearRestricted(d.year) ? 0.35 : 1)
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
                        .attr("stroke-width", 3)
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
            .attr("y", radiusScale(d3.max(yearData, d => d.count) || 0))
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
            .attr("r", 20)
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
                    .attr("r", 1)
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

    // Helper function to calculate circle radius with responsive sizing for mobile
    function radiusScale(count: number): number {
        const minRadius = isMobile ? 2 : 8;
        const maxRadius = isMobile ? 12 : 22;
        const maxCount = Math.max(...yearData.map(d => d.count));
        return minRadius + (maxRadius - minRadius) * (count / maxCount);
    }
</script>

    <!-- Timeline for desktop - now using CSS Grid -->
    <div class="backdrop-blur-sm" bind:this={container}>
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
                            width: {isMobile ? '40px' : '50px'};
                            height: {isMobile ? '40px' : '50px'};
                            opacity: {"All" === selectedYear ? 0.5 : 0};
                        "
                    ></div>
                    <!-- Main circle with SVG gradient -->
                    <svg 
                        class="main-circle-svg"
                        width={isMobile ? "36" : "44"}
                        height={isMobile ? "36" : "44"}
                        style="filter: {"All" === selectedYear ? 'url(#glow)' : 'none'};"
                    >
                        <circle 
                            cx={isMobile ? "18" : "22"}
                            cy={isMobile ? "18" : "22"}
                            r={isMobile ? "16.5" : "20.5"}
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
    .timeline-container {
        position: relative;
        overflow: hidden;
    }

    .timeline-container:hover {
        height: 100px; /* Expanded height on hover */
    }

    .timeline-grid {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
        align-items: center;
        position: relative;
        transition: all 0.3s ease;
    }

    .year-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        z-index: 1;
        transform-origin: center center;
        transition: transform 0.3s ease;
    }

    .timeline-container:hover .year-item {
        transform: scale(1.1);
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
        transform: scale(0.825); /* Default smaller scale */
    }

    .timeline-container:hover .circle-container {
        transform: scale(1); /* Return to normal scale on hover */
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
        opacity: 0.875; /* Start with opacity 0 */
        pointer-events: none; /* Prevent labels from interfering with interactions */
    }

    .timeline-container:hover .year-label {
        opacity: 1; /* Show labels on container hover */
        transform: translateY(-4px) scale(1);
    }

    .year-label.selected {
        color: #FF1515;
        font-weight: 600;
        opacity: 1; /* Always full opacity for selected */
    }

    .restricted .main-circle-svg circle {
        opacity: 0.25;
        cursor: not-allowed;
    }

    .restricted .year-label {
        color: #fff;
        opacity: 0.15;
    }

    .all-years {
        margin-left: 1.25rem;
    }

    @media (max-width: 768px) {
        .timeline-grid {
            gap: 0.25rem;
        }

        .year-label {
            font-size: 7.25px;
            opacity: .725; /* Always show labels on mobile */
        }

        .year-label.selected {
            font-size: 10.25px;
            opacity: 1;
        }
        
        .timeline-container {
            padding: 0.5rem 0.75rem;
            height: auto; /* Don't compress on mobile */
        }

        .timeline-container:hover {
            height: auto; /* Don't expand on mobile */
        }

        .circle-container {
            transform: scale(0.825); /* Slightly smaller scale on mobile, but not as small as desktop default */
        }

        .timeline-container:hover .year-item {
            transform: none; /* No hover scaling on mobile */
        }
        
        .all-years {
            margin-left: 0.5rem; /* Reduced margin on mobile */
        }
        
        .highlight-circle {
            border-width: 3px; /* Thinner border on mobile */
        }
        
        .main-circle-svg circle {
            stroke-width: 1px; /* Thinner stroke on mobile */
        }
    }
</style>