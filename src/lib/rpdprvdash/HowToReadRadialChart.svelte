<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
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
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center {isOpen ? 'block' : 'hidden'}" on:click={onClose}>
  <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" on:click|stopPropagation>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-slate-800">How to Read the Radial Charts</h2>
        <button class="text-slate-500 hover:text-slate-700" on:click={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="prose max-w-none">
        <p class="text-slate-600 mb-6">
          The radial charts in this application visualize relationships between companies, therapeutic areas, and drugs across different development stages. This guide explains how to interpret these visualizations.
        </p>
        
        <h3 class="text-xl font-semibold text-slate-800 mt-8 mb-4">Basic Structure</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <p class="text-slate-600 mb-2">
              The charts are organized in concentric circles, with each circle representing a different development stage:
            </p>
            <ul class="list-disc pl-5 text-slate-600">
              <li><span class="font-medium">Outer circle:</span> Preclinical (PRE)</li>
              <li><span class="font-medium">Middle circles:</span> Clinical Phases (P1, P2, P3)</li>
              <li><span class="font-medium">Inner circles:</span> Filed (FILED) and PRV Awarded (PRV)</li>
            </ul>
          </div>
          <div>
            <p class="text-slate-600 mb-2">
              The position of elements indicates relationships:
            </p>
            <ul class="list-disc pl-5 text-slate-600">
              <li>Companies/therapeutic areas are positioned around the outer edge</li>
              <li>Drugs are positioned on the stage circles based on their development phase</li>
              <li>Lines connect related elements to show relationships</li>
            </ul>
          </div>
        </div>
        
        <h3 class="text-xl font-semibold text-slate-800 mt-8 mb-4">By Sponsor View</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <p class="text-slate-600 mb-4">
              In the "By Sponsor" view, companies are arranged around the outer edge of the chart, with their drugs positioned on the appropriate stage circles.
            </p>
            <ul class="list-disc pl-5 text-slate-600">
              <li><span class="font-medium">Square nodes:</span> Companies (color indicates public/private status)</li>
              <li><span class="font-medium">Circle nodes:</span> Drugs (color indicates therapeutic area)</li>
              <li><span class="font-medium">Lines:</span> Connect companies to their drugs</li>
            </ul>
          </div>
          <div class="flex justify-center">
            <svg bind:this={svgSponsor} width={width} height={height} viewBox="0 0 {width} {height}" class="w-full h-auto"></svg>
          </div>
        </div>
        
        <h3 class="text-xl font-semibold text-slate-800 mt-8 mb-4">By Therapeutic Area View</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <p class="text-slate-600 mb-4">
              In the "By Therapeutic Area" view, therapeutic areas are arranged around the outer edge, with drugs positioned on the appropriate stage circles.
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
        
        <h3 class="text-xl font-semibold text-slate-800 mt-8 mb-4">Special Visual Indicators</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 class="font-medium text-slate-700 mb-2">Drug Status Indicators:</h4>
            <ul class="list-disc pl-5 text-slate-600">
              <li><span class="font-medium">Standard drug:</span> Regular circle with therapeutic area color</li>
              <li><span class="font-medium">PRV Awarded:</span> Circle with yellow glow effect</li>
              <li><span class="font-medium">Voucher Purchased:</span> Circle with green glow effect</li>
              <li><span class="font-medium">Transacted PRV:</span> Circle with gold stroke</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-slate-700 mb-2">Company Status Indicators:</h4>
            <ul class="list-disc pl-5 text-slate-600">
              <li><span class="font-medium">Public company:</span> Blue square</li>
              <li><span class="font-medium">Private company:</span> Green square</li>
              <li><span class="font-medium">NIH/Government:</span> Purple square</li>
            </ul>
          </div>
        </div>
        
        <h3 class="text-xl font-semibold text-slate-800 mt-8 mb-4">Interaction Tips</h3>
        <ul class="list-disc pl-5 text-slate-600 mb-8">
          <li><span class="font-medium">Hover over elements:</span> Shows detailed information in the sidebar</li>
          <li><span class="font-medium">Click on company/area:</span> Highlights all related drugs</li>
          <li><span class="font-medium">Click on drug:</span> Opens detailed information drawer</li>
          <li><span class="font-medium">Zoom and pan:</span> Use mouse wheel and drag to navigate the visualization</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<style>
  .prose h3 {
    color: #334155;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  .prose ul {
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .prose li {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }
</style> 