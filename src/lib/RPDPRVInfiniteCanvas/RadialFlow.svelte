<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import * as d3 from 'd3';
    import {
      SvelteFlow,
      Controls,
      Background,
      BackgroundVariant,
      MiniMap
    } from '@xyflow/svelte';
   
    // Import styles for Svelte Flow
    import '@xyflow/svelte/dist/style.css';
    
    // Sample data - replace with your actual data
    export let data = [];
    
    // Visualization properties
    let svg;
    const width = 850;
    const height = 850;
    const radius = Math.min(width, height) / 2 - 60;
    
    // Stage radii (from outer to inner)
    const stageRadii = {
      'PRE': radius * 0.9325,
      'P1': radius * 0.8125,
      'P1/2': radius * 0.725,
      'P2': radius * 0.625,
      'P3': radius * 0.525,
      'FILED': radius * 0.4125,
      'APRV': radius * 0.295,
      'PRV': radius * 0.15
    };
    
    // Maps for stage codes
    const stageCodeMap = {
      'PRE': 'Preclinical',
      'P1': 'Phase 1',
      'P1/2': 'Phase 1/2',
      'P2': 'Phase 2',
      'P3': 'Phase 3',
      'FILED': 'Filed',
      'APRV': 'Approved',
      'PRV': 'PRV Awarded'
    };
    
    // Color schemes
    const therapeuticAreaColors = {
      'Oncology': { fill: '#FFA07A', stroke: '#FF6347' },
      'Neurology': { fill: '#ADD8E6', stroke: '#4682B4' },
      'Infectious Disease': { fill: '#90EE90', stroke: '#2E8B57' },
      'Cardiovascular': { fill: '#FF6B6B', stroke: '#CD5C5C' },
      'Default': { fill: '#D3D3D3', stroke: '#A9A9A9' }
    };
    
    const stageColors = {
      'Preclinical': { fill: '#E2E8F0', stroke: '#94A3B8' },
      'Phase 1': { fill: '#DBEAFE', stroke: '#3B82F6' },
      'Phase 1/2': { fill: '#E0E7FF', stroke: '#4F46E5' },
      'Phase 2': { fill: '#DCFCE7', stroke: '#22C55E' },
      'Phase 3': { fill: '#FEF9C3', stroke: '#EAB308' },
      'Filed': { fill: '#FEE2E2', stroke: '#EF4444' },
      'Approved': { fill: '#FFE4E6', stroke: '#E11D48' },
      'PRV Awarded': { fill: '#FEF3C7', stroke: '#D97706' }
    };
    
    const companyStatusColors = {
      'Public': { fill: '#E0F2FE', stroke: '#0284C7' },
      'Private': { fill: '#F3E8FF', stroke: '#9333EA' },
      'Default': { fill: '#F5F5F5', stroke: '#6B7280' }
    };
    
    // Helper functions
    function getTherapeuticAreaColor(area) {
      return therapeuticAreaColors[area] || therapeuticAreaColors['Default'];
    }
    
    function getStageColor(stage) {
      return stageColors[stage] || stageColors['Preclinical'];
    }
    
    function getCompanyStatusColor(status) {
      return companyStatusColors[status] || companyStatusColors['Default'];
    }
    
    function getStage(entry) {
      if (entry["PRV Year"]) return "PRV";
      
      const stage = entry["Current Development Stage"];
      switch(stage) {
        case "PRV Awarded": return "PRV";
        case "Preclinical": return "PRE";
        case "Phase 1": return "P1";
        case "Phase 1/2": return "P1/2";
        case "Phase 2":
        case "Phase 2a":
        case "Phase 2b": return "P2";
        case "Phase 3": return "P3";
        case "Filed": return "FILED";
        case "Approved": return "APRV";
        default: return "PRE";
      }
    }
    
    function getStageFullName(stageCode) {
      return stageCodeMap[stageCode] || stageCode;
    }
    
    // D3 visualization setup
    function createVisualization() {
      if (!svg) return;
      
      const svgElement = d3.select(svg);
      svgElement.selectAll("*").remove();
      
      // Create drop shadow filter
      const defs = svgElement.append("defs");
      
      const dropShadow = defs.append("filter")
        .attr("id", "dropshadow")
        .attr("width", "200%")
        .attr("height", "200%");
        
      dropShadow.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 2.5)
        .attr("result", "blur");
        
      dropShadow.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 1.25)
        .attr("dy", 1.5)
        .attr("result", "offsetBlur");
        
      const feMerge = dropShadow.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "offsetBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
      
      // Main visualization group (centered)
      const mainGroup = svgElement.append("g")
        .attr("transform", `translate(${width/2},${height/2})`);
        
      // Add circles for each stage
      Object.entries(stageRadii).forEach(([stage, radius]) => {
        const stageFullName = getStageFullName(stage);
        const stageColor = getStageColor(stageFullName);
        
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
          .attr("transform", `translate(${labelX},${labelY})`)
          .attr("class", "stage-label")
          .attr("id", `stage-label-${stage}`)
          .attr("cursor", "pointer");
          
        // Background pill for the label
        labelGroup.append("rect")
          .attr("x", -10)
          .attr("y", -10)
          .attr("width", 40)
          .attr("height", 20)
          .attr("rx", 10)
          .attr("fill", '#F8FAFC')
          .attr("opacity", 1);
          
        labelGroup.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.3em")
          .attr("fill", stageColor.stroke)
          .attr("font-size", "9.25px")
          .attr("font-weight", "400")
          .text(stage);
      });
      
      // Sample companies around the circle (for demonstration)
      // In a real implementation, you would use your data to position companies
      const numCompanies = 10;
      for (let i = 0; i < numCompanies; i++) {
        const angle = (i / numCompanies) * 2 * Math.PI;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        mainGroup.append("rect")
          .attr("x", x - 5)
          .attr("y", y - 5)
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", companyStatusColors.Public.fill)
          .attr("stroke", companyStatusColors.Public.stroke)
          .attr("stroke-width", 0.725)
          .attr("rx", 2);
          
        // Company label
        const labelX = (radius + 40) * Math.cos(angle);
        const labelY = (radius + 40) * Math.sin(angle);
        
        mainGroup.append("path")
          .attr("d", `M${x},${y}L${labelX},${labelY}`)
          .attr("stroke", "#37587e")
          .attr("stroke-width", 0.725)
          .attr("stroke-opacity", 0.825)
          .attr("fill", "none");
          
        const labelGroup = mainGroup.append("g")
          .attr("transform", `translate(${labelX},${labelY})`)
          .attr("cursor", "pointer");
          
        labelGroup.append("text")
          .attr("text-anchor", angle > Math.PI/2 && angle < 3*Math.PI/2 ? "end" : "start")
          .attr("dx", angle > Math.PI/2 && angle < 3*Math.PI/2 ? -15 : 15)
          .attr("dy", "0.35em")
          .attr("fill", "#4A5568")
          .attr("font-size", "9.25px")
          .attr("font-weight", "500")
          .text(`Company ${i+1}`);
      }
    }
    
    // Prepare nodes and edges for Svelte Flow
    // This is where we'd create a hybrid approach - using Svelte Flow for interactions
    // and D3 for the radial visualization
    const nodes = writable([
      {
        id: 'center',
        type: 'default',
        data: { label: 'Central Hub' },
        position: { x: 425, y: 425 },
        draggable: false
      }
    ]);
    
    const edges = writable([]);
    
    // Make nodes non-draggable
    const snapGrid = [25, 25];
    
    onMount(() => {
      // Initialize D3 visualization
      createVisualization();
    });
  </script>
  
  <div class="visualization-container">
    <!-- D3 Radial Visualization -->
    <div class="d3-container">
      <svg
        bind:this={svg}
        {width}
        {height}
        viewBox="0 0 {width} {height}"
        class="w-full h-auto"
      />
    </div>
    
    <!-- Svelte Flow Container (can be used for additional interactive elements) -->
    <div style:height="100vh" style:display="none">
      <SvelteFlow
        {nodes}
        {edges}
        {snapGrid}
        fitView
        nodesDraggable={false}
        on:nodeclick={(event) => console.log('on node click', event.detail.node)}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap />
      </SvelteFlow>
    </div>
  </div>
  
  <style>
    .visualization-container {
      width: 100%;
      position: relative;
    }
    
    .d3-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
    }
  </style>