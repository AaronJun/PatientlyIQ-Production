<!-- PRVPurchaseTimeline.svelte - Timeline focused on transaction values by year -->
<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import * as d3 from 'd3';
    import { getTherapeuticAreaColor } from '../utils/colorDefinitions';
    import { ChevronDown } from 'carbon-icons-svelte';
    
    export let data: any[] = [];
    export let onYearSelect: (year: string) => void;
    export let selectedYear: string = "All";
    export let transactionYearSelected: (year: string) => void = () => {};
    
    let svg: SVGElement | null = null;
    let container: HTMLDivElement;
    let isDropdownOpen = false;
    let dropdownRef: HTMLDivElement | null = null;
    let isMobile = false;
    let isTablet = false;
    
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
        
        if (isMobile) {
            margin = { top: 6, right: 12, bottom: 30, left: 12 };
        } else {
            margin = { top: 8, right: 8, bottom: 10, left: 10 };
        }
        
        // Only create visualization if we're in desktop mode or if data is available for mobile dropdown
        if (data.length > 0) {
            if (!isMobile && svg) {
                createVisualization();
            } else if ((isMobile || isTablet) && yearData.length === 0) {
                yearData = calculateYearData(data);
                yearGradients = calculateYearGradients(yearData);
            }
        }
    }
    
    // Process data to filter for purchases with transaction values
    $: purchaseData = data.filter(entry => entry.Purchased === "Y" && entry["Purchase Year"]);
    
    // Process data to group by purchase year
    function calculateYearData(inputData: any[]) {
        return Object.entries(
            inputData.reduce((acc, entry) => {
                const year = entry["Purchase Year"];
                if (!year) return acc;
                
                // Parse sale price
                let salePrice = 0;
                if (entry["Sale Price (USD Millions)"] && entry["Sale Price (USD Millions)"] !== "Undisclosed") {
                    salePrice = parseFloat(entry["Sale Price (USD Millions)"]);
                }
                
                if (!acc[year]) {
                    acc[year] = {
                        count: 0,
                        totalValue: 0,
                        areas: {}
                    };
                }
                acc[year].count += 1;
                acc[year].totalValue += salePrice;
                
                const area = entry.TherapeuticArea1;
                if (area) {
                    if (!acc[year].areas[area]) {
                        acc[year].areas[area] = {
                            count: 0,
                            value: 0
                        };
                    }
                    acc[year].areas[area].count += 1;
                    acc[year].areas[area].value += salePrice;
                }
                return acc;
            }, {} as Record<string, { 
                count: number; 
                totalValue: number;
                areas: Record<string, { count: number; value: number }> 
            }>)
        )
        .map(([year, data]) => {
            const yearInfo = data as { 
                count: number; 
                totalValue: number; 
                areas: Record<string, { count: number; value: number }> 
            };
            
            const areaEntries = Object.entries(yearInfo.areas)
                .map(([area, areaData]) => {
                    const stats = areaData as { count: number; value: number };
                    return {
                        area,
                        count: stats.count,
                        value: stats.value,
                        percentage: yearInfo.totalValue > 0 ? stats.value / yearInfo.totalValue : stats.count / yearInfo.count
                    };
                })
                .sort((a, b) => b.value - a.value);
                
            return {
                year,
                count: yearInfo.count,
                totalValue: yearInfo.totalValue,
                areas: areaEntries
            };
        })
        .sort((a, b) => a.year.localeCompare(b.year));
    }
    
    // Add type for area
    interface Area {
        area: string;
        count: number;
        value: number;
        percentage: number;
    }

    // Update the calculateYearGradients function with proper typing
    function calculateYearGradients(yearDataInput: Array<{year: string; areas: Area[]}>): Record<string, string> {
        return yearDataInput.reduce((acc: Record<string, string>, yearEntry) => {
            const gradientColors = yearEntry.areas
                .map((area: Area) => getTherapeuticAreaColor(area.area).fill)
                .join(', ');
            acc[yearEntry.year] = `linear-gradient(135deg, ${gradientColors})`;
            return acc;
        }, {} as Record<string, string>);
    }
    
    // Use the extracted functions for reactive declarations
    $: yearData = calculateYearData(purchaseData);
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
        if ((isMobile) && data.length > 0 && yearData.length === 0) {
            yearData = calculateYearData(purchaseData);
            yearGradients = calculateYearGradients(yearData);
        }
        
        return () => {
            window.removeEventListener('resize', updateDimensions);
            document.removeEventListener('click', handleClickOutside);
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    });
    
    function toggleDropdown(event: Event) {
        event.stopPropagation();
        isDropdownOpen = !isDropdownOpen;
        
        setTimeout(() => {
            if (isDropdownOpen && dropdownRef) {
                dropdownRef.style.display = 'block';
                dropdownRef.style.visibility = 'visible';
                dropdownRef.style.opacity = '1';
            }
        }, 0);
    }
    
    function handleYearSelect(year: string) {
        selectedYear = year;
        onYearSelect(year);
        transactionYearSelected(year);
        dispatch('yearSelect', { year });
        isDropdownOpen = false;
    }
    
    function handleClickOutside(event: MouseEvent) {
        if (dropdownRef && !dropdownRef.contains(event.target as Node) && isDropdownOpen) {
            isDropdownOpen = false;
        }
    }
    
    function createGradientId(year: string): string {
        return `purchase-gradient-${year}`;
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
            .domain([0, d3.max(yearData, d => d.totalValue) || 0])
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
            .attr("id", "purchase-gradient-all-years")
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
            .attr("id", "purchase-glow")
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
            .attr("r", d => radiusScale(d.totalValue) + 4)
            .attr("fill", "none")
            .attr("stroke", "#55D88E")
            .attr("stroke-width", 5)
            .attr("opacity", 0);

        // Add main circles
        yearGroups.append("circle")
            .attr("class", "year-circle")
            .attr("r", d => radiusScale(d.totalValue))
            .attr("fill", d => `url(#${createGradientId(d.year)})`)
            .attr("stroke", "#565656")
            .attr("stroke-width", 1.5)
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                handleYearSelect(d.year);
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
                        .style("filter", "url(#purchase-glow)");

                    if (parentElement) {
                        d3.select(parentElement)
                            .select(".year-label")
                            .transition()
                            .duration(200)
                            .attr("font-weight", "600")
                            .attr("fill", "#FF1515");
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
                            .attr("fill", "#718096");
                    }
                }
            });

        // Add year labels - now below circles
        yearGroups.append("text")
            .attr("class", "year-label")
            .attr("x", 0)
            .attr("y", radiusScale(d3.max(yearData, d => d.totalValue) || 0) + 10)
            .attr("text-anchor", "middle")
            .attr("fill", "#718096")
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
            .attr("stroke", "#55D88E")
            .attr("stroke-width", 5)
            .attr("opacity", selectedYear === "All" ? 0.5 : 0);
            
        // Create main circle for "All Years"
        allYearsGroup.append("circle")
            .attr("class", "year-circle")
            .attr("r", 22)
            .attr("fill", "url(#purchase-gradient-all-years)")
            .attr("stroke", "#565656")
            .attr("stroke-width", selectedYear === "All" ? 4 : 2.5)
            .style("filter", selectedYear === "All" ? "url(#purchase-glow)" : "none")
            .style("cursor", "pointer")
            .on("click", () => {
                handleYearSelect("All");
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
                        .style("filter", "url(#purchase-glow)");
                        
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
                .style("filter", selectedYear === "All" ? "url(#purchase-glow)" : "none");
                
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

                group.select(".highlight-circle")
                    .transition()
                    .duration(300)
                    .attr("opacity", isSelected ? 0.5 : 0);

                group.select(".year-circle")
                    .transition()
                    .duration(300)
                    .attr("stroke-width", isSelected ? 3 : 1.5)
                    .style("filter", isSelected ? "url(#purchase-glow)" : "none");

                group.select(".year-label")
                    .transition()
                    .duration(300)
                    .attr("font-weight", isSelected ? "600" : "400")
                    .attr("fill", isSelected ? "#FF1515" : "#718096");
            });
    }

    // Update the radiusScale function to handle mobile responsiveness
    function radiusScale(value: number): number {
        const minRadius = isMobile ? 2 : 8;
        const maxRadius = isMobile ? 12 : 22;
        const maxValue = Math.max(...yearData.map(d => d.totalValue));
        return minRadius + (maxRadius - minRadius) * (value / maxValue);
    }

    // Add hover handlers
    function handleYearHover(yearEntry: any) {
        if (yearEntry.year !== selectedYear) {
            // Hover effects are handled by CSS
        }
    }

    function handleYearLeave(yearEntry: any) {
        if (yearEntry.year !== selectedYear) {
            // Leave effects are handled by CSS
        }
    }

    $: if (data.length > 0 && svg) {
        createVisualization();
    }
</script>

{#if isMobile || isTablet}
    <!-- Timeline for mobile/tablet - using same circle layout as desktop but with adjusted sizes -->
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
                        class:selected={yearEntry.year === selectedYear}
                        on:click={() => handleYearSelect(yearEntry.year)}
                        on:mouseenter={() => handleYearHover(yearEntry)}
                        on:mouseleave={() => handleYearLeave(yearEntry)}
                        on:keydown={(e) => e.key === 'Enter' && handleYearSelect(yearEntry.year)}
                        aria-label={`Select year ${yearEntry.year}`}
                        type="button"
                    >
                        <!-- Highlight circle -->
                        <div 
                            class="highlight-circle"
                            style="
                                width: {(radiusScale(yearEntry.totalValue) + 4) * 2}px;
                                height: {(radiusScale(yearEntry.totalValue) + 4) * 2}px;
                                opacity: {yearEntry.year === selectedYear ? 0.5 : 0};
                            "
                        ></div>
                        <!-- Main circle with SVG gradient -->
                        <svg 
                            class="main-circle-svg"
                            width={radiusScale(yearEntry.totalValue) * 2}
                            height={radiusScale(yearEntry.totalValue) * 2}
                            style="filter: {yearEntry.year === selectedYear ? 'url(#glow)' : 'none'};"
                        >
                            <circle 
                                cx={radiusScale(yearEntry.totalValue)}
                                cy={radiusScale(yearEntry.totalValue)}
                                r={radiusScale(yearEntry.totalValue) - 1.5}
                                fill="url(#gradient-{yearEntry.year})"
                                stroke="#565656"
                                stroke-width="1.5"
                            />
                        </svg>
                    </button>
                    <div 
                        class="year-label"
                        class:selected={yearEntry.year === selectedYear}
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
                    on:click={() => handleYearSelect("All")}
                    on:mouseenter={() => handleYearHover({ year: "All" })}
                    on:mouseleave={() => handleYearLeave({ year: "All" })}
                    on:keydown={(e) => e.key === 'Enter' && handleYearSelect("All")}
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
{:else}
    <!-- Timeline for desktop -->
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
                        class:selected={yearEntry.year === selectedYear}
                        on:click={() => handleYearSelect(yearEntry.year)}
                        on:mouseenter={() => handleYearHover(yearEntry)}
                        on:mouseleave={() => handleYearLeave(yearEntry)}
                        on:keydown={(e) => e.key === 'Enter' && handleYearSelect(yearEntry.year)}
                        aria-label={`Select year ${yearEntry.year}`}
                        type="button"
                    >
                        <!-- Highlight circle -->
                        <div 
                            class="highlight-circle"
                            style="
                                width: {(radiusScale(yearEntry.totalValue) + 4) * 2}px;
                                height: {(radiusScale(yearEntry.totalValue) + 4) * 2}px;
                                opacity: {yearEntry.year === selectedYear ? 0.5 : 0};
                            "
                        ></div>
                        <!-- Main circle with SVG gradient -->
                        <svg 
                            class="main-circle-svg"
                            width={radiusScale(yearEntry.totalValue) * 2}
                            height={radiusScale(yearEntry.totalValue) * 2}
                            style="filter: {yearEntry.year === selectedYear ? 'url(#glow)' : 'none'};"
                        >
                            <circle 
                                cx={radiusScale(yearEntry.totalValue)}
                                cy={radiusScale(yearEntry.totalValue)}
                                r={radiusScale(yearEntry.totalValue) - 1.5}
                                fill="url(#gradient-{yearEntry.year})"
                                stroke="#565656"
                                stroke-width="1.5"
                            />
                        </svg>
                    </button>
                    <div 
                        class="year-label"
                        class:selected={yearEntry.year === selectedYear}
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
                    on:click={() => handleYearSelect("All")}
                    on:mouseenter={() => handleYearHover({ year: "All" })}
                    on:mouseleave={() => handleYearLeave({ year: "All" })}
                    on:keydown={(e) => e.key === 'Enter' && handleYearSelect("All")}
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

<style>
    .timeline-container {
        position: relative;
        overflow: hidden;
        border-bottom: 1px solid #e2e8f0;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
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
        opacity: 0.5; /* Start with opacity 0 */
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

    .dropdown-container {
        z-index: 9999;
    }

    .dropdown-toggle {
        transition: all 0.2s ease;
    }

    .dropdown-toggle:hover {
        background-color: #f3f4f6;
    }

    .dropdown-menu {
        transform-origin: top;
        transition: all 0.2s ease;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        border-radius: 0.375rem;
    }

    /* Safari-specific fixes */
    @supports (-webkit-touch-callout: none) {
        .scrollbar-thin {
            overflow-y: auto !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
        }
        
        .absolute {
            position: absolute;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
        }
    }
</style>