<!-- StageBeeswarmPlot.svelte -->
<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import RPDTooltip from '../RPDTooltip.svelte';
    
    export let data = [];
    export let width = 1100;
    export let height = 600;
    export let onEntrySelect = () => {};
    
    let svg;
    let tooltipVisible = false;
    let tooltipContent = {
      sponsor: '',
      drugName: '',
      therapeuticArea: '',
      id: ''
    };
    let tooltipBorderColor = '';
    let tooltipX = 0;
    let tooltipY = 0;
    
    // Use color definitions from colorDefinitions.ts
    const therapeuticAreaColors = {
      'Neurology': { fill: '#ff1515', stroke: '#FEB2B2' },
      'Neuromuscular': { fill: '#2F855A', stroke: '#C6F6D5' },
      'Oncology': { fill: '#B2F5EA', stroke: '#5CC988' },
      'Metabolic': { fill: '#4C51BF', stroke: '#B2F5EA' },
      'Ophthalmology': { fill: '#FFF', stroke: '#38A169' },
      'Cardiovascular': { fill: '#FEEBC8', stroke: '#C05621' },
      'Cardiology': { fill: '#fff', stroke: '#DD6B20' },
      'Pulmonology': { fill: '#E9D8FD', stroke: '#6B46C1' },
      'Hematology': { fill: '#FEB299', stroke: '#ff1515' },
      'Endocrinology': { fill: '#FEFCBF', stroke: '#B7791F' },
      'Genetic': { fill: '#BEE3F8', stroke: '#2B6CB0' },
      'Immunology': { fill: '#FED7D7', stroke: '#9B2C2C' },
      'Gastroenterology': { fill: '#FAF089', stroke: '#975A16' },
      'Hepatology': { fill: '#C6F6D5', stroke: '#2F855A' },
      'Nephrology': { fill: '#90CDF4', stroke: '#2C5282' },
      'Orthopedics': { fill: '#E9D8FD', stroke: '#805AD5' },
      'Dermatology': { fill: '#FEB2B2', stroke: '#E53E3E' },
      'Neonatology': { fill: '#BEE3F8', stroke: '#3182CE' },
      'Urology': { fill: '#D6BCFA', stroke: '#6B46C1' },
      'Rheumatology': { fill: '#FEEBC8', stroke: '#9C4221' }
    };
    
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
      'Filed': { fill: '#FEB2B2', stroke: '#7B341E' },
      'Approved': { fill: '#9AE6B4', stroke: '#2F855A' }
    };
    
    // Define development stages and their order
    const developmentStages = [
      'Preclinical', 'Phase 1', 'Phase 1/2', 'Phase 2', 
      'Phase 2a', 'Phase 2b', 'Phase 3', 'Filed', 
      'FDA Approved', 'PRV Awarded'
    ];
    
    function createVisualization() {
      if (!svg || !data || data.length === 0) return;
      
      const margin = { top: 40, right: 40, bottom: 60, left: 40 };
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
      
      // Filter out entries with missing or unknown development stages
      const validData = data.filter(d => d["Current Development Stage"] && 
                                  developmentStages.includes(d["Current Development Stage"]));
      
      // Create x scale for development stages
      const x = d3.scaleBand()
        .domain(developmentStages)
        .range([0, innerWidth])
        .padding(0.1);
      
      // Add X axis
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .style("font-size", "12px");
      
      // Add X axis label
      g.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + margin.bottom - 5)
        .text("Development Stage")
        .attr("fill", "#666")
        .style("font-size", "14px");
      
      // Group data by development stage
      const nestedData = d3.group(validData, d => d["Current Development Stage"]);
      
      // Create force simulation for each development stage
      nestedData.forEach((stageEntries, stage) => {
        const stageX = x(stage) + x.bandwidth() / 2;
        
        // Set up force simulation
        const simulation = d3.forceSimulation(stageEntries)
          .force("x", d3.forceX(stageX).strength(0.2))
          .force("y", d3.forceY(innerHeight / 2).strength(0.1))
          .force("collide", d3.forceCollide(8))
          .stop();
        
        // Run the simulation
        for (let i = 0; i < 120; ++i) simulation.tick();
        
        // Keep circles within bounds
        stageEntries.forEach(d => {
          d.x = Math.max(stageX - x.bandwidth() / 2 + 10, Math.min(stageX + x.bandwidth() / 2 - 10, d.x));
          d.y = Math.max(10, Math.min(innerHeight - 10, d.y));
        });
      });
      
      // Has PRV indication
      const hasPRV = d => d["PRV Year"] ? true : false;
      
      // Combine all entries for rendering
      const allSimulatedData = Array.from(nestedData.values()).flat();
      
      // Create circles for each entry
      const circles = g.selectAll("circle")
        .data(allSimulatedData)
        .join("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 5) // Reduced circle size
        .attr("fill", d => therapeuticAreaColors[d.TherapeuticArea1]?.fill || '#CBD5E0')
        .attr("stroke", d => hasPRV(d) ? "#FFC107" : (therapeuticAreaColors[d.TherapeuticArea1]?.stroke || '#4A5568'))
        .attr("stroke-width", d => hasPRV(d) ? 2 : 1)
        .attr("opacity", 0.9)
        .attr("cursor", "pointer")
        .on("mouseover", (event, d) => {
          // Show tooltip with RPDTooltip component format
          tooltipContent = {
            sponsor: d.Company || 'Unknown',
            drugName: d.Candidate || '',
            therapeuticArea: d.TherapeuticArea1 || '',
            id: d["Current Development Stage"] || 'Unknown Stage'
          };
          
          tooltipBorderColor = therapeuticAreaColors[d.TherapeuticArea1]?.stroke || '#4A5568';
          tooltipX = event.pageX;
          tooltipY = event.pageY - 40;
          
          tooltipVisible = true;
        })
        .on("mousemove", (event) => {
          // Update tooltip position when mouse moves
          tooltipX = event.pageX;
          tooltipY = event.pageY - 40;
        })
        .on("mouseout", () => {
          tooltipVisible = false;
        })
        .on("click", (event, d) => {
          onEntrySelect(d);
        });
      
      // Add legend for therapeutic areas
      const legendData = Array.from(new Set(validData.map(d => d.TherapeuticArea1)))
        .filter(d => d) // Filter out undefined/null
        .sort();
      
      const legendItemHeight = 20;
      const legendItemsPerColumn = 10;
      const legendWidth = 200;
      
      const legend = svgEl.append("g")
        .attr("transform", `translate(${width - margin.right - legendWidth}, ${margin.top})`);
      
      legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", Math.ceil(legendData.length / legendItemsPerColumn) * legendItemHeight + 30)
        .attr("fill", "#f8f9fa")
        .attr("stroke", "#dee2e6")
        .attr("rx", 4);
      
      legend.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .text("Therapeutic Areas")
        .style("font-weight", "bold")
        .style("font-size", "12px");
      
      const legendItems = legend.selectAll(".legend-item")
        .data(legendData)
        .join("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => {
          const column = Math.floor(i / legendItemsPerColumn);
          const row = i % legendItemsPerColumn;
          return `translate(${column * 100 + 10}, ${row * legendItemHeight + 40})`;
        });
      
      legendItems.append("circle")
        .attr("r", 5)
        .attr("fill", d => therapeuticAreaColors[d]?.fill || '#CBD5E0')
        .attr("stroke", d => therapeuticAreaColors[d]?.stroke || '#4A5568')
        .attr("stroke-width", 1)
        .attr("opacity", 0.9);
      
      legendItems.append("text")
        .attr("x", 12)
        .attr("y", 4)
        .text(d => d.length > 14 ? d.substring(0, 12) + "..." : d)
        .style("font-size", "10px");
      
      // Add PRV indicator in legend
      const prvLegend = svgEl.append("g")
        .attr("transform", `translate(${width - margin.right - legendWidth}, ${margin.top + Math.ceil(legendData.length / legendItemsPerColumn) * legendItemHeight + 50})`);
      
      prvLegend.append("rect")
        .attr("width", legendWidth)
        .attr("height", 40)
        .attr("fill", "#f8f9fa")
        .attr("stroke", "#dee2e6")
        .attr("rx", 4);
      
      prvLegend.append("circle")
        .attr("cx", 16)
        .attr("cy", 20)
        .attr("r", 5)
        .attr("fill", stageColors['PRV Awarded'].fill)
        .attr("stroke", "#FFC107")
        .attr("stroke-width", 2);
      
      prvLegend.append("text")
        .attr("x", 28)
        .attr("y", 24)
        .text("PRV Awarded")
        .style("font-size", "10px");
      
      // Add title
      svgEl.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Drug Candidates by Development Stage");
      
      // Add counter for each stage
      g.append("g")
        .selectAll("text")
        .data(developmentStages)
        .join("text")
        .attr("class", "stage-count")
        .attr("x", d => x(d) + x.bandwidth() / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(d => {
          const count = nestedData.get(d)?.length || 0;
          return `n=${count}`;
        });
    }
    
    onMount(() => {
      createVisualization();
    });
    
    $: if (data && svg) {
      createVisualization();
    }
  </script>
  
  <div class="beeswarm-container relative">
    <svg bind:this={svg} {width} {height}></svg>
    
    <!-- RPDTooltip Component -->
    <RPDTooltip
      visible={tooltipVisible}
      content={tooltipContent}
      borderColor={tooltipBorderColor}
      x={tooltipX}
      y={tooltipY}
    />
  </div>
  
  <style>
    .beeswarm-container {
      width: 100%;
      overflow: visible;
    }
  </style>