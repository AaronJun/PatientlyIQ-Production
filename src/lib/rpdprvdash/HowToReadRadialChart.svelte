<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { slide, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { ChevronLeft, ChevronRight, Close } from 'carbon-icons-svelte';
  import { Tabs as TabsPrimitive } from "bits-ui";
  import { cn } from "$lib/utils";
  
  // Import color definitions for the legend
  import { 
    getTherapeuticAreaColor, 
    getStageColor, 
    getCompanyStatusColor 
  } from './utils/colorDefinitions';
  
  // Props
  export let isOpen: boolean = false;
  export let onClose: () => void = () => {};
  
  // SVG dimensions for the diagram
  const width = 500;
  const height = 500;
  const radius = Math.min(width, height) / 2 - 60;
  
  // References to SVG elements
  let svgSponsor: SVGSVGElement;
  let svgTherapeutic: SVGSVGElement;
  let activeTab = 'radial';
  
  // Stage radii for the diagrams
  const stageRadii: Record<string, number> = {
    'PRE': radius * 0.925,
    'P1': radius * 0.8125,
    'P2': radius * 0.7125,
    'P3': radius * 0.5725,
    'FILED': radius * 0.4325,
    'PRV': radius * 0.2725,
  };
  
  // Stage names for the legend
  const stageNames: Record<string, string> = {
    'PRE': 'Preclinical',
    'P1': 'Phase 1',
    'P2': 'Phase 2',
    'P3': 'Phase 3',
    'FILED': 'Filed',
    'PRV': 'PRV Awarded',
  };
  
  // Create the sponsor view diagram
  function createSponsorDiagram() {
    if (!svgSponsor) return;
    
    const svg = d3.select(svgSponsor);
    svg.selectAll("*").remove();
    
    const mainGroup = svg.append("g")
      .attr("transform", `translate(${width/2},${height/2})`);
    
    // Create stage circles
    Object.entries(stageRadii).forEach(([stage, radius]) => {
      const stageColor = getStageColor(stageNames[stage]);
      
      mainGroup.append("circle")
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", stageColor.stroke)
        .attr("stroke-width", 1.425)
        .attr("stroke-dasharray", "1,5")
        .attr("stroke-opacity", 1);
      
      // Add stage label
      const labelAngle = -Math.PI / 15;
      const labelX = radius * Math.cos(labelAngle) - 15;
      const labelY = radius * Math.sin(labelAngle) + 25;
      
      const labelGroup = mainGroup.append("g")
        .attr("transform", `translate(${labelX},${labelY})`);
      
      labelGroup.append("rect")
        .attr("x", -20)
        .attr("y", -10)
        .attr("width", 40)
        .attr("height", 20)
        .attr("rx", 4)
        .attr("fill", '#F8FAFC');
      
      labelGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em")
        .attr("fill", stageColor.stroke)
        .attr("font-size", "11px")
        .attr("font-weight", "400")
        .text(stage);
    });
    
    // Create company nodes and connections
    const companies = [
      { name: "Company A", angle: Math.PI * 0.2, status: "Public" },
      { name: "Company B", angle: Math.PI * 0.7, status: "Private" },
      { name: "Company C", angle: Math.PI * 1.3, status: "Public" }
    ];
    
    const linesGroup = mainGroup.append("g").attr("class", "connecting-lines");
    const companyLabelsGroup = mainGroup.append("g").attr("class", "company-labels");
    
    companies.forEach(company => {
      const nodeAngle = company.angle - Math.PI/2;
      const nodeRadius = radius * 1;
      const nodeX = nodeRadius * Math.cos(nodeAngle);
      const nodeY = nodeRadius * Math.sin(nodeAngle);
      
      // Get company status color
      const statusColor = getCompanyStatusColor(company.status);
      
      // Create company node
      const nodeGroup = companyLabelsGroup.append("g")
        .attr("transform", `translate(${nodeX},${nodeY})`);
      
      nodeGroup.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("transform", "translate(-5, -5)")
        .attr("fill", statusColor.fill)
        .attr("stroke", statusColor.stroke)
        .attr("stroke-width", 0.725)
        .attr("rx", 2);
      
      // Add label
      const isRightSide = Math.cos(nodeAngle) > 0;
      const labelDistance = radius * 1.05;
      const labelX = nodeX + (labelDistance - nodeRadius) * Math.cos(nodeAngle);
      const labelY = nodeY + (labelDistance - nodeRadius) * Math.sin(nodeAngle);
      
      // Connect node to label
      linesGroup.append("path")
        .attr("d", `M${nodeX},${nodeY}L${labelX},${labelY}`)
        .attr("stroke", "#37587e")
        .attr("stroke-width", 0.725)
        .attr("stroke-opacity", 0.825)
        .attr("fill", "none");
      
      const labelGroup = companyLabelsGroup.append("g")
        .attr("transform", `translate(${labelX},${labelY})`);
      
      labelGroup.append("text")
        .attr("text-anchor", isRightSide ? "start" : "end")
        .attr("dx", isRightSide ? 5 : -5)
        .attr("dy", "0.35em")
        .attr("fill", "#4A5568")
        .attr("font-size", "9px")
        .attr("font-weight", "500")
        .text(company.name);
      
      // Add drug nodes for this company
      const stages = ['PRE', 'P1', 'P2'];
      stages.forEach(stage => {
        const stageRadius = stageRadii[stage];
        const drugAngle = company.angle - Math.PI/2 + (Math.random() * 0.2 - 0.1);
        const drugX = stageRadius * Math.cos(drugAngle);
        const drugY = stageRadius * Math.sin(drugAngle);
        
        // Connect company node to drug
        linesGroup.append("path")
          .attr("d", `M${nodeX},${nodeY}L${drugX},${drugY}`)
          .attr("stroke", "#37587e")
          .attr("stroke-width", 0.7625)
          .attr("stroke-opacity", 0.525)
          .attr("fill", "none");
        
        // Create drug node
        const drugGroup = mainGroup.append("g")
          .attr("transform", `translate(${drugX},${drugY})`);
        
        // Get therapeutic area color
        const areaColors = getTherapeuticAreaColor("Oncology");
        
        drugGroup.append("circle")
          .attr("r", 7)
          .attr("fill", areaColors.fill)
          .attr("stroke", areaColors.stroke)
          .attr("stroke-width", 1.5);
      });
    });
    
    // Add annotation for company node
    mainGroup.append("g")
      .attr("transform", `translate(${radius * 0.5}, ${-radius * 0.7})`)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Company Node");
    
    // Add annotation for drug node
    mainGroup.append("g")
      .attr("transform", `translate(${-radius * 0.5}, ${-radius * 0.5})`)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Drug Node");
    
    // Add annotation for stage circle
    mainGroup.append("g")
      .attr("transform", `translate(${-radius * 0.7}, ${radius * 0.2})`)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Stage Circle");
  }
  
  // Create the therapeutic area view diagram
  function createTherapeuticDiagram() {
    if (!svgTherapeutic) return;
    
    const svg = d3.select(svgTherapeutic);
    svg.selectAll("*").remove();
    
    const mainGroup = svg.append("g")
      .attr("transform", `translate(${width/2},${height/2})`);
    
    // Create stage circles
    Object.entries(stageRadii).forEach(([stage, radius]) => {
      const stageColor = getStageColor(stageNames[stage]);
      
      mainGroup.append("circle")
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", stageColor.stroke)
        .attr("stroke-width", 1.425)
        .attr("stroke-dasharray", "1,5")
        .attr("stroke-opacity", 1);
      
      // Add stage label
      const labelAngle = -Math.PI / 15;
      const labelX = radius * Math.cos(labelAngle) - 15;
      const labelY = radius * Math.sin(labelAngle) + 25;
      
      const labelGroup = mainGroup.append("g")
        .attr("transform", `translate(${labelX},${labelY})`);
      
      labelGroup.append("rect")
        .attr("x", -20)
        .attr("y", -10)
        .attr("width", 40)
        .attr("height", 20)
        .attr("rx", 4)
        .attr("fill", '#F8FAFC');
      
      labelGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em")
        .attr("fill", stageColor.stroke)
        .attr("font-size", "11px")
        .attr("font-weight", "400")
        .text(stage);
    });
    
    // Create therapeutic area nodes and connections
    const areas = [
      { name: "Oncology", angle: Math.PI * 0.2 },
      { name: "Neurology", angle: Math.PI * 0.7 },
      { name: "Metabolic", angle: Math.PI * 1.3 }
    ];
    
    const linesGroup = mainGroup.append("g").attr("class", "connecting-lines");
    const areaLabelsGroup = mainGroup.append("g").attr("class", "area-labels");
    
    areas.forEach(area => {
      const nodeAngle = area.angle - Math.PI/2;
      const nodeRadius = radius * 1;
      const nodeX = nodeRadius * Math.cos(nodeAngle);
      const nodeY = nodeRadius * Math.sin(nodeAngle);
      
      // Get area color
      const areaColor = getTherapeuticAreaColor(area.name);
      
      // Create area node
      const nodeGroup = areaLabelsGroup.append("g")
        .attr("transform", `translate(${nodeX},${nodeY})`);
      
      nodeGroup.append("circle")
        .attr("r", 7)
        .attr("fill", areaColor.fill)
        .attr("stroke", areaColor.stroke)
        .attr("stroke-width", 1.5);
      
      // Add label
      const isRightSide = Math.cos(nodeAngle) > 0;
      const labelDistance = radius * 1.05;
      const labelX = nodeX + (labelDistance - nodeRadius) * Math.cos(nodeAngle);
      const labelY = nodeY + (labelDistance - nodeRadius) * Math.sin(nodeAngle);
      
      // Connect node to label
      linesGroup.append("path")
        .attr("d", `M${nodeX},${nodeY}L${labelX},${labelY}`)
        .attr("stroke", "#37587e")
        .attr("stroke-width", 0.725)
        .attr("stroke-opacity", 0.825)
        .attr("fill", "none");
      
      const labelGroup = areaLabelsGroup.append("g")
        .attr("transform", `translate(${labelX},${labelY})`);
      
      labelGroup.append("text")
        .attr("text-anchor", isRightSide ? "start" : "end")
        .attr("dx", isRightSide ? 5 : -5)
        .attr("dy", "0.35em")
        .attr("fill", "#4A5568")
        .attr("font-size", "9px")
        .attr("font-weight", "500")
        .text(area.name);
      
      // Add drug nodes for this area
      const stages = ['PRE', 'P1', 'P2'];
      stages.forEach(stage => {
        const stageRadius = stageRadii[stage];
        const drugAngle = area.angle - Math.PI/2 + (Math.random() * 0.2 - 0.1);
        const drugX = stageRadius * Math.cos(drugAngle);
        const drugY = stageRadius * Math.sin(drugAngle);
        
        // Connect area node to drug
        linesGroup.append("path")
          .attr("d", `M${nodeX},${nodeY}L${drugX},${drugY}`)
          .attr("stroke", "#37587e")
          .attr("stroke-width", 0.7625)
          .attr("stroke-opacity", 0.525)
          .attr("fill", "none");
        
        // Create drug node
        const drugGroup = mainGroup.append("g")
          .attr("transform", `translate(${drugX},${drugY})`);
        
        drugGroup.append("circle")
          .attr("r", 7)
          .attr("fill", areaColor.fill)
          .attr("stroke", areaColor.stroke)
          .attr("stroke-width", 1.5);
      });
    });
    
    // Add annotation for area node
    mainGroup.append("g")
      .attr("transform", `translate(${radius * 0.5}, ${-radius * 0.7})`)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Therapeutic Area Node");
    
    // Add annotation for drug node
    mainGroup.append("g")
      .attr("transform", `translate(${-radius * 0.5}, ${-radius * 0.5})`)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Drug Node");
  }
  
  // Initialize diagrams on mount
  onMount(() => {
    createSponsorDiagram();
    createTherapeuticDiagram();
  });

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

{#if isOpen}
  <div 
    class="fixed inset-0 bg-black/50 z-[1000] flex justify-end"
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    tabindex="0"
    role="button"
    aria-label="Close dialog"
    transition:fade={{duration: 200}}
  >
    <div 
      class="fixed inset-y-0 right-0 w-[92.25vw] md:w-[72.25vw] bg-white shadow-lg z-50 overflow-y-auto"
      transition:slide={{ duration: 300, easing: quintOut, axis: 'x' }}
    >
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">How to Read the Dashboard</h2>
          <button 
            class="p-2 hover:bg-gray-100 rounded-full"
            on:click={onClose}
          >
            <Close size={24} />
          </button>
        </div>

        <TabsPrimitive.Root value={activeTab} onValueChange={(value) => activeTab = value}>
          <TabsPrimitive.List class="flex space-x-4 border-b border-gray-200 mb-6">
            <TabsPrimitive.Trigger 
              value="radial"
              class={cn(
                "px-4 py-2 text-sm font-medium",
                "data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
              )}
            >
              Radial Charts
            </TabsPrimitive.Trigger>
            <TabsPrimitive.Trigger
              value="navigation"
              class={cn(
                "px-4 py-2 text-sm font-medium",
                "data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
              )}
            >
              Navigation
            </TabsPrimitive.Trigger>
            <TabsPrimitive.Trigger
              value="sidebars"
              class={cn(
                "px-4 py-2 text-sm font-medium",
                "data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
              )}
            >
              Sidebars & Cards
            </TabsPrimitive.Trigger>
            <TabsPrimitive.Trigger
              value="filters"
              class={cn(
                "px-4 py-2 text-sm font-medium",
                "data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
              )}
            >
              Filters & Search
            </TabsPrimitive.Trigger>
          </TabsPrimitive.List>

          <TabsPrimitive.Content value="radial">
            <div class="space-y-6">
              <div class="prose max-w-none mt-6">
                <h3 class="text-xl font-semibold text-slate-800 mb-4">Understanding the Radial Charts</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <p class="text-slate-600 mb-4">
                      The radial charts visualize relationships between companies, therapeutic areas, and drugs across different development stages:
                    </p>
                    <ul class="list-disc pl-5 text-slate-600">
                      <li><span class="font-medium">Outer circle:</span> Preclinical (PRE)</li>
                      <li><span class="font-medium">Middle circles:</span> Clinical Phases (P1, P2, P3)</li>
                      <li><span class="font-medium">Inner circles:</span> Filed (FILED) and PRV Awarded (PRV)</li>
                    </ul>
                  </div>
                  <div class="flex justify-center">
                    <svg bind:this={svgSponsor} width={width} height={height} viewBox="0 0 {width} {height}" class="w-full h-auto"></svg>
                  </div>
                </div>

                <h4 class="text-lg font-semibold text-slate-800 mt-8 mb-4">By Sponsor View</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <p class="text-slate-600 mb-4">
                      In the "By Sponsor" view:
                    </p>
                    <ul class="list-disc pl-5 text-slate-600">
                      <li><span class="font-medium">Square nodes:</span> Companies (color indicates public/private status)</li>
                      <li><span class="font-medium">Circle nodes:</span> Drugs (color indicates therapeutic area)</li>
                      <li><span class="font-medium">Lines:</span> Connect companies to their drugs</li>
                    </ul>
                  </div>
                  <div>
                    <h5 class="font-medium text-slate-700 mb-2">Company Status Colors:</h5>
                    <ul class="list-disc pl-5 text-slate-600">
                      <li><span class="font-medium">Blue square:</span> Public company</li>
                      <li><span class="font-medium">Green square:</span> Private company</li>
                      <li><span class="font-medium">Purple square:</span> NIH/Government</li>
                    </ul>
                  </div>
                </div>

                <h4 class="text-lg font-semibold text-slate-800 mt-8 mb-4">By Therapeutic Area View</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p class="text-slate-600 mb-4">
                      In the "By Therapeutic Area" view:
                    </p>
                    <ul class="list-disc pl-5 text-slate-600">
                      <li><span class="font-medium">Circle nodes (outer):</span> Therapeutic areas</li>
                      <li><span class="font-medium">Circle nodes (inner):</span> Drugs (color matches their therapeutic area)</li>
                      <li><span class="font-medium">Lines:</span> Connect therapeutic areas to their drugs</li>
                    </ul>
                  </div>
                  <div class="flex justify-center">
                    <svg bind:this={svgTherapeutic} width={width} height={height} viewBox="0 0 {width} {height}" class="w-full h-auto"></svg>
                  </div>
                </div>
              </div>
            </div>
          </TabsPrimitive.Content>

          <TabsPrimitive.Content value="navigation">
            <div class="space-y-6">
              <div class="prose max-w-none mt-6">
                <h3 class="text-xl font-semibold text-slate-800 mb-4">Navigation Features</h3>
                
                <div class="space-y-6">
                  <div>
                    <h4 class="text-lg font-medium text-slate-800 mb-2">Main Tabs</h4>
                    <ul class="list-disc pl-5 text-slate-600">
                      <li><span class="font-medium">By Sponsor:</span> View drugs organized by company</li>
                      <li><span class="font-medium">By Therapeutic Area:</span> View drugs organized by disease area</li>
                      <li><span class="font-medium">Transactions:</span> View PRV transactions and history</li>
                      <li><span class="font-medium">Timeline:</span> Chronological view of PRV events</li>
                    </ul>
                  </div>

                  <div>
                    <h4 class="text-lg font-medium text-slate-800 mb-2">Interactive Features</h4>
                    <ul class="list-disc pl-5 text-slate-600">
                      <li><span class="font-medium">Hover interactions:</span> Reveal detailed information in tooltips</li>
                      <li><span class="font-medium">Click actions:</span> Open detailed views and highlight related elements</li>
                      <li><span class="font-medium">Zoom & Pan:</span> Navigate large visualizations (use mouse wheel and drag)</li>
                      <li><span class="font-medium">Year selection:</span> Filter data by specific years</li>
                    </ul>
                  </div>

                  <div>
                    <h4 class="text-lg font-medium text-slate-800 mb-2">Keyboard Navigation</h4>
                    <ul class="list-disc pl-5 text-slate-600">
                      <li><span class="font-medium">Tab:</span> Navigate between interactive elements</li>
                      <li><span class="font-medium">Enter/Space:</span> Activate selected elements</li>
                      <li><span class="font-medium">Escape:</span> Close modals and drawers</li>
                      <li><span class="font-medium">Arrow keys:</span> Navigate within components</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsPrimitive.Content>

          <TabsPrimitive.Content value="sidebars">
            <div class="space-y-6">
              <div class="prose max-w-none mt-6">
                <h3 class="text-xl font-semibold text-slate-800 mb-4">Understanding UI Components</h3>
                
                <div class="space-y-6">
                  <div>
                    <h4 class="text-lg font-medium text-slate-800 mb-2">Sidebar Features</h4>
                    <ul class="list-disc pl-5 text-slate-600">
                      <li><span class="font-medium">Overview panel:</span> Shows summary statistics and key metrics</li>
                      <li><span class="font-medium">Filters panel:</span> Customize your view with various filters</li>
                      <li><span class="font-medium">Details panel:</span> View detailed information about selected items</li>
                      <li><span class="font-medium">Collapsible:</span> Toggle sidebar visibility for more space</li>
                    </ul>
                  </div>

                  <div>
                    <h4 class="text-lg font-medium text-slate-800 mb-2">Information Cards</h4>
                    <ul class="list-disc pl-5 text-slate-600">
                      <li><span class="font-medium">Company cards:</span> Display company information and metrics</li>
                      <li><span class="font-medium">Drug cards:</span> Show drug development status and details</li>
                      <li><span class="font-medium">Transaction cards:</span> Present PRV transaction information</li>
                      <li><span class="font-medium">Metric cards:</span> Highlight key statistics and trends</li>
                    </ul>
                  </div>

                  <div>
                    <h4 class="text-lg font-medium text-slate-800 mb-2">Detail Drawers</h4>
                    <ul class="list-disc pl-5 text-slate-600">
                      <li><span class="font-medium">Company details:</span> In-depth company information and portfolio</li>
                      <li><span class="font-medium">Drug details:</span> Comprehensive drug development information</li>
                      <li><span class="font-medium">Transaction details:</span> Complete transaction history and terms</li>
                      <li><span class="font-medium">Navigation:</span> Use arrows to move between related items</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsPrimitive.Content>

          <TabsPrimitive.Content value="filters">
            <div class="space-y-6">
              <div class="prose max-w-none mt-6">
                <h3 class="text-xl font-semibold text-slate-800 mb-4">Search and Filter Tools</h3>
                
                <div class="space-y-6">
                  <div>
                    <h4 class="text-lg font-medium text-slate-800 mb-2">Search Capabilities</h4>
                    <ul class="list-disc pl-5 text-slate-600">
                      <li><span class="font-medium">Global search:</span> Search across all data types</li>
                      <li><span class="font-medium">Company search:</span> Find specific companies</li>
                      <li><span class="font-medium">Drug search:</span> Locate specific drugs or compounds</li>
                      <li><span class="font-medium">Auto-complete:</span> Suggestions as you type</li>
                    </ul>
                  </div>

                  <div>
                    <h4 class="text-lg font-medium text-slate-800 mb-2">Filter Options</h4>
                    <ul class="list-disc pl-5 text-slate-600">
                      <li><span class="font-medium">Year filters:</span> Filter by specific years</li>
                      <li><span class="font-medium">Status filters:</span> Filter by development stage</li>
                      <li><span class="font-medium">Company filters:</span> Filter by company type (public/private)</li>
                      <li><span class="font-medium">Therapeutic area filters:</span> Filter by disease area</li>
                    </ul>
                  </div>

                  <div>
                    <h4 class="text-lg font-medium text-slate-800 mb-2">Advanced Features</h4>
                    <ul class="list-disc pl-5 text-slate-600">
                      <li><span class="font-medium">Combined filters:</span> Apply multiple filters simultaneously</li>
                      <li><span class="font-medium">Save preferences:</span> Remember your filter settings</li>
                      <li><span class="font-medium">Quick reset:</span> Clear all filters instantly</li>
                      <li><span class="font-medium">Export filtered data:</span> Download your filtered results</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsPrimitive.Content>
        </TabsPrimitive.Root>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(.tab-panel) {
    padding: 0 !important;
  }

  :global(.tab-list) {
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 1rem;
  }

  :global(.tab) {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #64748b;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  :global(.tab[aria-selected="true"]) {
    color: #0f172a;
    border-bottom-color: #2563eb;
  }

  .prose h3 {
    color: #334155;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  .prose h4 {
    color: #475569;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
  }
  
  .prose ul {
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .prose li {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }

  .prose li span.font-medium {
    color: #334155;
  }
</style> 