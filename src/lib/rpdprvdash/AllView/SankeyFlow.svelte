<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import RPDRadialLegend from '$lib/rpdprvdash/RPDRadialLegend.svelte';
    import RPDTooltip from '$lib/rpdprvdash/RPDTooltip.svelte';
    import { getTherapeuticAreaColor, therapeuticAreaColors } from '$lib/rpdprvdash/utils/colorDefinitions';
    import { ArrowUpRight } from "carbon-icons-svelte";
    
    export let data = [];
    export let width = 1200;
    export let height = 600;
    export let onEntrySelect = (entry) => {};
    
    let svg;
    
    // Tooltip state
    let tooltipVisible = false;
    let tooltipData = {};
    let tooltipX = 0;
    let tooltipY = 0;
    let tooltipBorderColor = '#4a5568';
    
    // Highlighted circle
    let hoveredCircleId = null;
    
    // Highlighted stage
    let hoveredStage = null;
    
    const stageColors = {
      'Preclinical': { fill: '#E2E8F0', stroke: '#4A5568' },
      'Phase 1': { fill: '#B2F5EA', stroke: '#2C7A7B' },
      'Phase 1/2': { fill: '#BEE3F8', stroke: '#2B6CB0' },
      'Phase 2': { fill: '#90CDF4', stroke: '#2C5282' },
      'Phase 2a': { fill: '#90CDF4', stroke: '#2C5282' },
      'Phase 2b': { fill: '#90CDF4', stroke: '#2C5282' },
      'Phase 3': { fill: '#63B3ED', stroke: '#1A365D' },
      'FDA Approved': { fill: '#2F855A', stroke: '#9AE6B4' },
      'PRV Awarded': { fill: '#68D391', stroke: '#276749' },
      'PRV Transacted': { fill: '#F6AD55', stroke: '#C05621' },
      'Filed': { fill: '#FEB2B2', stroke: '#7B341E' },
      'Approved': { fill: '#9AE6B4', stroke: '#2F855A' }
    };
    
    // Define development stages and their order
    const developmentStages = [
      'Preclinical', 'Phase 1', 'Phase 1/2', 'Phase 2', 
      'Phase 2a', 'Phase 2b', 'Phase 3', 'Filed', 
      'FDA Approved', 'PRV Awarded', 'PRV Transacted'
    ];
  
    // Prepare data for the legend
    let legendItems = [];
    
    function updateLegendItems() {
      if (!data || data.length === 0) return;
      
      // Count occurrences of each therapeutic area
      const areaCounts = {};
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
    
    // Function to determine the proper development stage
    function getDevelopmentStage(entry) {
      // Check if it has a Purchase Year and is not NA
      if (entry["Purchase Year"] && entry["Purchase Year"] !== "NA" && entry["Purchase Year"] !== "") {
        return "PRV Transacted";
      }
      return entry["Current Development Stage"];
    }
    
    function createVisualization() {
      if (!svg || !data || data.length === 0) return;
      
      updateLegendItems();
      
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
      
      // Process and filter data
      const processedData = data.map(d => {
        // Create a copy of the original data
        const entry = {...d};
        // Set the effective development stage
        entry.effectiveStage = getDevelopmentStage(entry);
        return entry;
      });
      
      // Filter out entries with missing or unknown development stages
      const validData = processedData.filter(d => d.effectiveStage && 
                                  developmentStages.includes(d.effectiveStage));
      
      // Create x scale for development stages
      const x = d3.scaleBand()
        .domain(developmentStages)
        .range([0, innerWidth])
        .padding(0.1);
      
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
      
      // Create force simulation for each development stage
      nestedData.forEach((stageEntries, stage) => {
        const stageX = x(stage) + x.bandwidth() / 2;
        
        // Set up force simulation - MODIFIED FOR BOTTOM ALIGNMENT
        const simulation = d3.forceSimulation(stageEntries)
          .force("x", d3.forceX(stageX).strength(0.5))
          .force("y", d3.forceY(innerHeight - 85).strength(0.15)) // Position near bottom
          .force("collide", d3.forceCollide(8.25))
          .stop();
        
        // Run the simulation
        for (let i = 0; i < 120; ++i) simulation.tick();
        
        // Keep circles within bounds - MODIFIED FOR BOTTOM ALIGNMENT
        stageEntries.forEach(d => {
          d.x = Math.max(stageX - x.bandwidth() / 2 + 10, Math.min(stageX + x.bandwidth() / 2 - 10, d.x));
          // Allow circles to stack upward from the bottom, but not past the top
          // The minimum y value (highest position) is now relative to column density
          const columnHeight = Math.min(innerHeight - 30, stageEntries.length * 12);
          d.y = Math.max(innerHeight - columnHeight, Math.min(innerHeight - 10, d.y));
        });
      });
      
      // Has PRV indication
      const hasPRV = d => d["PRV Year"] ? true : false;
      
      // Combine all entries for rendering
      const allSimulatedData = Array.from(nestedData.values()).flat();
      
      // Create a container for circles
      const circlesContainer = g.append("g")
        .attr("class", "circles-container");
        
      // Create circles for each entry
      const circles = circlesContainer.selectAll(".drug-circle")
        .data(allSimulatedData)
        .join("g")
        .attr("class", d => `drug-circle interactive-element stage-${d.effectiveStage.replace(/\s+/g, '-').replace(/\//g, '-')}`)
        .attr("transform", d => `translate(${d.x}, ${d.y})`)
        .attr("cursor", "pointer")
        .attr("data-id", (d, i) => `circle-${i}`)
        .attr("data-stage", d => d.effectiveStage)
        .style("opacity", 1) // Default opacity
        .on("mouseover", (event, d) => {
          // Set hovered circle ID to expand it
          hoveredCircleId = event.currentTarget.getAttribute("data-id");
          d3.select(event.currentTarget).select("circle")
            .transition()
            .duration(100)
            .attr("r", 8);
          
          // Show tooltip with transaction information if available
          tooltipData = {
            sponsor: d.Company || "Unknown",
            drugName: d.Candidate,
            therapeuticArea: d.TherapeuticArea1,
            id: d.Indication || "Not specified"
          };
          
          // Add transaction details to tooltip if available
          if (d["Purchase Year"] && d["Purchase Year"] !== "NA" && d["Purchase Year"] !== "") {
            tooltipData.transaction = {
              purchaser: d.Purchaser || "Undisclosed",
              price: d["Sale Price (USD Millions)"] || "Undisclosed",
              year: d["Purchase Year"]
            };
          }
          
          // Position tooltip next to the cursor
          const mouseX = event.clientX;
          const mouseY = event.clientY;
          tooltipX = mouseX + 5;
          tooltipY = mouseY - 5;
          
          tooltipBorderColor = getTherapeuticAreaColor(d.TherapeuticArea1).stroke;
          tooltipVisible = true;
        })
        .on("mouseout", (event) => {
          // Reset circle size
          d3.select(event.currentTarget).select("circle")
            .transition()
            .duration(100)
            .attr("r", 5);
          
          hoveredCircleId = null;
          tooltipVisible = false;
        })
        .on("click", (event, d) => {
          // Trigger the onEntrySelect function with the clicked entry data
          onEntrySelect(d);
        });
        
      // Add the circle with split fill similar to the legend
      circles.append("circle")
        .attr("r", 5)
        .attr("stroke", "#161616")
        .attr("stroke-width", d => 
          (hasPRV(d) || d.effectiveStage === "PRV Transacted") ? 2 : 1);
        
      // Add left half of the circle (fill color)
      circles.append("path")
        .attr("d", d3.arc()
          .innerRadius(0)
          .outerRadius(5)
          .startAngle(-Math.PI / 2)
          .endAngle(Math.PI / 2))
        .attr("fill", d => getTherapeuticAreaColor(d.TherapeuticArea1).fill);
        
      // Add right half of the circle (stroke color)
      circles.append("path")
        .attr("d", d3.arc()
          .innerRadius(0)
          .outerRadius(5)
          .startAngle(Math.PI / 2)
          .endAngle(3 * Math.PI / 2))
        .attr("fill", d => getTherapeuticAreaColor(d.TherapeuticArea1).stroke);
    
      
      // Add counter for each stage
      const stageCounts = g.append("g")
        .selectAll("text")
        .data(developmentStages)
        .join("text")
        .attr("class", d => `stage-count count-${d.replace(/\s+/g, '-').replace(/\//g, '-')}`)
        .attr("x", d => x(d) + x.bandwidth() / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("opacity", 0) // Initially hidden
        .text(d => {
          const count = nestedData.get(d)?.length || 0;
          return `${count}`;
        });
      
      // Add invisible rectangles for mouseover effects
      const stageRects = g.append("g")
        .selectAll("rect")
        .data(developmentStages)
        .join("rect")
        .attr("class", "stage-rect")
        .attr("x", d => x(d))
        .attr("y", 0)
        .attr("width", x.bandwidth())
        .attr("height", innerHeight)
        .attr("fill", "transparent")
        .attr("cursor", "pointer")
        .on("mouseover", (event, stage) => {
          hoveredStage = stage;
          
          // Highlight this stage
          d3.select(`.count-${stage.replace(/\s+/g, '-').replace(/\//g, '-')}`)
            .transition()
            .duration(200)
            .style("opacity", 1);
            
          // Highlight the circles for this stage
          circlesContainer.selectAll(".drug-circle")
            .transition()
            .duration(200)
            .style("opacity", d => d.effectiveStage === stage ? 1 : 0.2);
            
          // Highlight the axis label
          xAxis.selectAll("text")
            .transition()
            .duration(200)
            .style("font-weight", function() {
              const tickValue = d3.select(this).text();
              return tickValue === stage ? "bold" : "normal";
            })
            .style("font-size", function() {
              const tickValue = d3.select(this).text();
              return tickValue === stage ? "11px" : "9.725px";
            });
        })
        .on("mouseout", () => {
          hoveredStage = null;
          
          // Reset all stage counts
          g.selectAll(".stage-count")
            .transition()
            .duration(200)
            .style("opacity", 0);
            
          // Reset all circles
          circlesContainer.selectAll(".drug-circle")
            .transition()
            .duration(200)
            .style("opacity", 1);
            
          // Reset axis labels
          xAxis.selectAll("text")
            .transition()
            .duration(200)
            .style("font-weight", "normal")
            .style("font-size", "9.725px");
        });
    }
    
    onMount(() => {
      createVisualization();
    });
    
    $: if (data && svg) {
      createVisualization();
    }
</script>
  
<div class="flex flex-row w-full">
    <div class="relative w-4/5 beeswarm-container">
      <svg bind:this={svg} {width} {height}></svg>
      
      <!-- External tooltip component -->
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
    
    <!-- External legend component -->
    <div class="mt-4 w-1/5 w-full">
      <RPDRadialLegend 
        items={legendItems} 
        showOnlyWithCounts={true}
        colorScale={(area) => getTherapeuticAreaColor(area).fill}
      />
    </div>
</div>