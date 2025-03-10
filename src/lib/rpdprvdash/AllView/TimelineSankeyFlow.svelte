<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import RPDRadialLegend from '$lib/rpdprvdash/RPDRadialLegend.svelte';
    import RPDTooltip from '$lib/rpdprvdash/RPDTooltip.svelte';
    import { getTherapeuticAreaColor, therapeuticAreaColors } from '$lib/rpdprvdash/utils/colorDefinitions';
    import { ArrowUpRight } from "carbon-icons-svelte";
    
    // Define development stages and their order
    const developmentStages = [
      'Preclinical', 'Phase 1', 'Phase 1/2', 'Phase 2', 
      'Phase 2a', 'Phase 2b', 'Phase 3', 'Filed', 
      'FDA Approved', 'PRV Awarded', 'PRV Transacted'
    ];
    
    // Prepare data for the legend
    let legendItems: LegendItem[] = [];
    
    function updateLegendItems() {
      if (!data || data.length === 0) return;
      
      // Count occurrences of each therapeutic area
      const areaCounts: Record<string, number> = {};
      data.forEach(d => {
        const area = d.TherapeuticArea1;
        if (area) {
          areaCounts[area] = (areaCounts[area] || 0) + 1;
        }
      });
      
      // Create legend items
      legendItems = Object.keys(areaCounts)
        .sort()
        .map(area => ({
          area,
          count: areaCounts[area]
        }));
    }
    
    // Define types for data and other variables
    type DataEntry = {
        Company: string;
        Candidate: string;
        TherapeuticArea1: string;
        Indication: string;
        "Current Development Stage": string;
        "PRV Year": string;
        "Purchase Year": string;
        Purchaser: string;
        "Sale Price (USD Millions)": string;
        effectiveStage?: string;
        x?: number;
        y?: number;
        year?: number;
        entryYear?: number;
    };
    
    type TooltipData = {
        sponsor: string;
        drugName?: string;
        therapeuticArea?: string;
        id: string;
        transaction?: {
            purchaser: string;
            price: string;
            year: string;
        };
    };
    
    type LegendItem = {
        area: string;
        count: number;
    };
    
    type D3Selection = d3.Selection<any, any, any, any>;
    type PathElement = SVGPathElement & { dataset: { stages: string } };
    type SimulationNode = d3.SimulationNodeDatum & DataEntry;
    
    export let data: DataEntry[] = [];
    export let width = 1200;
    export let height = 800;
    export let onEntrySelect = (entry: DataEntry) => {};
    
    let svg: SVGElement;
    
    // Year selection state
    let years: number[];
    let selectedYear: number;
    let yearTimer: number | null = null;
    let isPlaying = false;
    
    // Tooltip state
    let tooltipVisible = false;
    let tooltipData: TooltipData = { sponsor: "", id: "" };
    let tooltipX = 0;
    let tooltipY = 0;
    let tooltipBorderColor = '#4a5568';
    
    // Highlighted circle
    let hoveredCircleId: string | null = null;
    
    // Highlighted stage
    let hoveredStage: string | null = null;
    
    // Initialize years from data
    $: {
        if (data.length > 0) {
            const yearSet = new Set<number>();
            data.forEach(d => {
                // Add years from PRV Year and Purchase Year if they exist and are valid
                if (d["PRV Year"] && !isNaN(+d["PRV Year"])) yearSet.add(+d["PRV Year"]);
                if (d["Purchase Year"] && !isNaN(+d["Purchase Year"])) yearSet.add(+d["Purchase Year"]);
            });
            years = Array.from(yearSet).sort();
            if (!selectedYear && years.length > 0) {
                selectedYear = years[0];
            }
        }
    }
    
    // Function to determine the proper development stage for a given year
    function getDevelopmentStage(entry: DataEntry, year: number): string {
        const prvYear = entry["PRV Year"] ? +entry["PRV Year"] : null;
        const purchaseYear = entry["Purchase Year"] ? +entry["Purchase Year"] : null;
        
        if (purchaseYear && purchaseYear <= year) {
            return "PRV Transacted";
        } else if (prvYear && prvYear <= year) {
            return "PRV Awarded";
        }
        return entry["Current Development Stage"];
    }
    
    function updateVisualization() {
        if (!svg || !data || data.length === 0) return;
        
        const margin = { top: 40, right: 20, bottom: 60, left: 20 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        // Clear any existing elements
        d3.select(svg).selectAll("*").remove();
        
        const svgEl = d3.select(svg)
            .attr("viewBox", [0, 0, width, height])
            .attr("width", width)
            .attr("height", height);
        
        const g = svgEl.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        // Process and filter data for the selected year
        const processedData = data.map(d => {
            // Get the year this entry first appeared
            const rpddYear = d["RPDD Year"] ? +d["RPDD Year"] : null;
            const prvYear = d["PRV Year"] ? +d["PRV Year"] : null;
            const purchaseYear = d["Purchase Year"] ? +d["Purchase Year"] : null;
            
            // Entry year is when it first appeared (RPDD year or PRV year)
            const entryYear = rpddYear || prvYear || null;
            
            return {
                ...d,
                entryYear,
                rpddYear,
                prvYear,
                purchaseYear,
                effectiveStage: getDevelopmentStage(d, selectedYear)
            };
        });
        
        // Filter out entries with missing/unknown development stages and future entries
        const validData = processedData.filter(d => {
            // Must have a valid development stage
            if (!d.effectiveStage || !developmentStages.includes(d.effectiveStage)) {
                return false;
            }

            // Must have a valid entry year
            if (!d.entryYear) {
                return false;
            }

            // Entry must have originated in or before the selected year
            if (d.entryYear > selectedYear) {
                return false;
            }

            // For PRV-related stages, check specific years
            if (d.effectiveStage === "PRV Awarded" && (!d.prvYear || d.prvYear > selectedYear)) {
                return false;
            }
            if (d.effectiveStage === "PRV Transacted" && (!d.purchaseYear || d.purchaseYear > selectedYear)) {
                return false;
            }

            return true;
        });
        
        // Create x scale for development stages
        const x = d3.scaleBand()
            .domain(developmentStages)
            .range([0, innerWidth])
            .padding(.1);
        
        // Add X axis
        const xAxis = g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));
        
        // Customize axis text
        xAxis.selectAll("text")
            .attr("class", "stage-label")
            .attr("transform", "rotate(0)")
            .style("text-anchor", "end")
            .attr("dx", "-.25em")
            .attr("dy", ".725em")
            .style("font-size", "9.725px");
        
        // Group data by development stage
        const nestedData = d3.group(validData, d => d.effectiveStage);
        
        // Create paths between stages
        const pathsGroup = g.append("g")
            .attr("class", "paths-container");
        
        // Create links between adjacent stages
        for (let i = 0; i < developmentStages.length - 1; i++) {
            const startStage = developmentStages[i];
            const endStage = developmentStages[i + 1];
            
            const startX = x(startStage)! + x.bandwidth() / 2;
            const endX = x(endStage)! + x.bandwidth() / 2;
            
            pathsGroup.append("path")
                .attr("class", "stage-path")
                .datum({ stages: `${startStage},${endStage}` })
                .attr("d", `M${startX},${innerHeight - 85} C${startX + (endX - startX) / 3},${innerHeight - 85} ${endX - (endX - startX) / 3},${innerHeight - 85} ${endX},${innerHeight - 85}`)
                .attr("stroke", "#E2E8F0")
                .attr("stroke-width", 20)
                .attr("fill", "none")
                .attr("opacity", 0.5);
        }
        
        // Create a container for markers
        const markersGroup = g.append("g")
            .attr("class", "markers-group");
        
        // Add counter for each stage
        const stageCounts = g.append("g")
            .selectAll("text")
            .data(developmentStages)
            .join("text")
            .attr("class", d => `stage-count count-${d.replace(/\s+/g, '-').replace(/\//g, '-')}`)
            .attr("x", d => x(d)! + x.bandwidth() / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("opacity", 0)
            .text(d => {
                const count = nestedData.get(d)?.length || 0;
                return `${count}`;
            });
        
        // Create force simulations for each stage
        nestedData.forEach((stagePeople, stage) => {
            if (!stage) return;
            
            const stageX = x(stage)! + x.bandwidth() / 2;
            const baseY = innerHeight - 85;
            
            // Create force simulation
            const simulation = d3.forceSimulation<SimulationNode>(stagePeople)
                .force("x", d3.forceX(stageX).strength(0.2))
                .force("y", d3.forceY(baseY).strength(0.1))
                .force("collide", d3.forceCollide().radius(8).strength(0.8))
                .force("bounds", () => {
                    stagePeople.forEach(d => {
                        d.x = Math.max(
                            stageX - x.bandwidth() / 2 + 10,
                            Math.min(stageX + x.bandwidth() / 2 - 10, d.x || 0)
                        );
                        d.y = Math.min(
                            baseY - 5,
                            Math.max(50, d.y || 0)
                        );
                    });
                });
            
            // Run simulation
            for (let i = 0; i < 30; ++i) simulation.tick();
        });
        
        // Create markers for each entry
        const markers = markersGroup.selectAll<SVGGElement, SimulationNode>(".drug-marker")
            .data(validData)
            .join("g")
            .attr("class", d => `drug-marker interactive-element stage-${(d.effectiveStage || '').replace(/\s+/g, '-').replace(/\//g, '-')}`)
            .attr("cursor", "pointer")
            .style("transform", d => `translate(${d.x}px, ${d.y}px)`)
            .on("mouseover", (event, d) => {
                const marker = d3.select(event.currentTarget);
                
                // Update tooltip data
                tooltipData = {
                    sponsor: d.Company || "Unknown",
                    drugName: d.Candidate,
                    therapeuticArea: d.TherapeuticArea1,
                    id: d.Indication || "Not specified"
                };
                
                if (d["Purchase Year"] && d["Purchase Year"] !== "NA") {
                    tooltipData.transaction = {
                        purchaser: d.Purchaser || "Undisclosed",
                        price: d["Sale Price (USD Millions)"] || "Undisclosed",
                        year: d["Purchase Year"]
                    };
                }
                
                tooltipX = event.clientX + 5;
                tooltipY = event.clientY - 5;
                tooltipBorderColor = getTherapeuticAreaColor(d.TherapeuticArea1).stroke;
                tooltipVisible = true;
                
                // Highlight related elements
                markersGroup.selectAll(".drug-marker")
                    .transition()
                    .duration(200)
                    .style("opacity", item => 
                        (item as SimulationNode).Candidate === d.Candidate ? 1 : 0.3
                    );
            })
            .on("mousemove", (event) => {
                tooltipX = event.clientX + 5;
                tooltipY = event.clientY - 5;
            })
            .on("mouseout", () => {
                tooltipVisible = false;
                
                markersGroup.selectAll(".drug-marker")
                    .transition()
                    .duration(200)
                    .style("opacity", 1);
            })
            .on("click", (event, d) => {
                onEntrySelect(d);
            });
        
        // Add circles with split fill
        const arcGenerator = d3.arc<SimulationNode>()
            .innerRadius(0)
            .outerRadius(5)
            .startAngle(-Math.PI / 2)
            .endAngle(Math.PI / 2);
        
        markers.append("path")
            .attr("d", arcGenerator)
            .attr("fill", d => getTherapeuticAreaColor(d.TherapeuticArea1).fill);
        
        const rightArcGenerator = d3.arc<SimulationNode>()
            .innerRadius(0)
            .outerRadius(5)
            .startAngle(Math.PI / 2)
            .endAngle(3 * Math.PI / 2);
        
        markers.append("path")
            .attr("d", rightArcGenerator)
            .attr("fill", d => getTherapeuticAreaColor(d.TherapeuticArea1).stroke);
        
        // Add stage hover effects
        const stageRects = g.append("g")
            .selectAll("rect")
            .data(developmentStages)
            .join("rect")
            .attr("class", "stage-rect")
            .attr("x", d => x(d)!)
            .attr("y", 0)
            .attr("width", x.bandwidth())
            .attr("height", innerHeight)
            .attr("fill", "transparent")
            .attr("cursor", "pointer")
            .on("mouseover", (event, stage) => {
                hoveredStage = stage;
                
                d3.select(`.count-${stage.replace(/\s+/g, '-').replace(/\//g, '-')}`)
                    .transition()
                    .duration(200)
                    .style("opacity", 1);
                
                markersGroup.selectAll<SVGGElement, SimulationNode>(".drug-marker")
                    .transition()
                    .duration(200)
                    .style("opacity", function(d) {
                        return d.effectiveStage === stage ? 1 : 0.2;
                    });
                
                pathsGroup.selectAll<SVGPathElement, { stages: string }>(".stage-path")
                    .transition()
                    .duration(200)
                    .attr("opacity", d => {
                        const pathStages = d.stages.split(",");
                        return pathStages.includes(stage) ? 0.8 : 0.2;
                    });
                
                xAxis.selectAll("text")
                    .transition()
                    .duration(200)
                    .style("font-weight", function() {
                        return d3.select(this).text() === stage ? "bold" : "normal";
                    })
                    .style("font-size", function() {
                        return d3.select(this).text() === stage ? "11px" : "9.725px";
                    });
            })
            .on("mouseout", () => {
                hoveredStage = null;
                
                g.selectAll(".stage-count")
                    .transition()
                    .duration(200)
                    .style("opacity", 0);
                
                markersGroup.selectAll(".drug-marker")
                    .transition()
                    .duration(200)
                    .style("opacity", 1);
                
                pathsGroup.selectAll(".stage-path")
                    .transition()
                    .duration(200)
                    .attr("opacity", 0.5);
                
                xAxis.selectAll("text")
                    .transition()
                    .duration(200)
                    .style("font-weight", "normal")
                    .style("font-size", "9.725px");
            });
        
        // Update legend
        updateLegendItems();
    }
    
    onMount(() => {
        updateVisualization();
        return () => {
            if (yearTimer) {
                clearInterval(yearTimer);
            }
        };
    });
    
    $: if (data && svg && selectedYear) {
        updateVisualization();
    }
</script>

<div class="flex flex-col w-full">
    <div class="year-timeline-container mb-4">
        <div class="flex items-center justify-start space-x-2">
            <button 
                class="px-3 py-1 bg-slate-100 hover:bg-slate-300 rounded-full text-xs"
                on:click={() => {
                    const currentIndex = years.indexOf(selectedYear);
                    if (currentIndex > 0) {
                        selectedYear = years[currentIndex - 1];
                    }
                }}
                disabled={years.indexOf(selectedYear) <= 0}
            >
                Previous
            </button>
            
            <div class="flex items-center space-x-1 overflow-x-auto">
                {#each years as year}
                    <button 
                        class="year-button px-4 py-1 transition-colors duration-200"
                        class:selected={year === selectedYear}
                        on:click={() => selectedYear = year}
                    >
                        {year}
                    </button>
                {/each}
            </div>
            
            <button 
                class="px-3 py-1 bg-slate-100 hover:bg-slate-300 rounded-full text-xs"
                on:click={() => {
                    const currentIndex = years.indexOf(selectedYear);
                    if (currentIndex < years.length - 1) {
                        selectedYear = years[currentIndex + 1];
                    }
                }}
                disabled={years.indexOf(selectedYear) >= years.length - 1}
            >
                Next
            </button>
        </div>
    </div>

<div class="flex flex-row w-full">
    <div class="relative w-5/6 beeswarm-container">
        <svg bind:this={svg} {width} {height}></svg>
        
        {#if tooltipVisible}
            <RPDTooltip 
                visible={true}
                content={tooltipData}
                borderColor={tooltipBorderColor}
                x={tooltipX}
                y={tooltipY}
            />
        {/if}
    </div>
    
    <div class="mt-4 max-w-[300px] w-1/6">
        <RPDRadialLegend 
            items={legendItems} 
            showOnlyWithCounts={true}
            colorScale={(area) => getTherapeuticAreaColor(area).fill}
        />
    </div>
</div>
</div>

<style>
    .drug-marker {
        transition: opacity 0.2s;
    }
    
    .stage-path {
        pointer-events: none;
    }
    
    .year-timeline-container {
        border-bottom: 1px solid #e5e7eb;
    }
    
    .year-button {
        min-width: 3.5rem;
        font-size: 0.875rem;
        color: #4b5563;
        border: 1px solid transparent;
    }
    
    .year-button:hover {
        border-bottom: 1px solid #4f46e5;
    }
    
    .year-button.selected {
        border-bottom: 2px solid #4f46e5;
    }
    
    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style> 