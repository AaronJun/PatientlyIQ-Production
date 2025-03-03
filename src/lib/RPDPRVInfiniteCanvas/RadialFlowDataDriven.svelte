<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  // Sample data - replace with your actual data structure
  export let data = [
    {
      Company: "BioTech A",
      "Public/Private": "Public",
      Candidate: "Drug X-101",
      "Current Development Stage": "Phase 2",
      TherapeuticArea1: "Oncology",
      Indication: "Breast Cancer"
    },
    {
      Company: "BioTech A",
      "Public/Private": "Public",
      Candidate: "Drug X-102",
      "Current Development Stage": "Phase 1",
      TherapeuticArea1: "Oncology",
      Indication: "Lung Cancer"
    },
    {
      Company: "Pharma B",
      "Public/Private": "Public",
      Candidate: "Med-201",
      "Current Development Stage": "Phase 3",
      TherapeuticArea1: "Neurology",
      Indication: "Alzheimer's"
    },
    {
      Company: "Startup C",
      "Public/Private": "Private",
      Candidate: "SC-301",
      "Current Development Stage": "Preclinical",
      TherapeuticArea1: "Infectious Disease",
      Indication: "Viral Infection",
      "PRV Year": "2023"
    }
  ];
  
  // Event handlers (can be passed from parent component)
  export let onCompanyHover = (entries) => {};
  export let onStageHover = (entries) => {};
  export let onShowDrugDetail = (detail) => {};
  export let onLeave = () => {};
  
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
  
  // Process data for visualization
  function processDataForLayout(data) {
    const companiesMap = new Map();
    
    data.forEach((entry) => {
      const companyName = entry.Company;
      if (!companiesMap.has(companyName)) {
        companiesMap.set(companyName, {
          company: companyName,
          status: entry['Public/Private'] || 'Private',
          stages: new Map(),
          totalDrugs: 0,
          entries: [],
          clinicalTrials: 0,
          vouchersAwarded: 0,
          uniqueIndications: new Set(),
          uniqueAreas: new Set()
        });
      }
      
      const companyData = companiesMap.get(companyName);
      const stage = getStage(entry);
      
      if (!companyData.stages.has(stage)) {
        companyData.stages.set(stage, []);
      }
      
      companyData.stages.get(stage).push(entry);
      companyData.entries.push(entry);
      companyData.totalDrugs++;
      
      // Track indications and therapeutic areas
      if (entry.Indication) {
        companyData.uniqueIndications.add(entry.Indication);
      }
      
      if (entry.TherapeuticArea1) {
        companyData.uniqueAreas.add(entry.TherapeuticArea1);
      }
      
      // Count clinical trials (Phase 1-3)
      const clinicalStages = ["P1", "P1/2", "P2", "P3"];
      if (clinicalStages.includes(stage)) {
        companyData.clinicalTrials++;
      }
      
      // Count vouchers awarded
      if (stage === "PRV" || entry["PRV Year"]) {
        companyData.vouchersAwarded++;
      }
    });

    return Array.from(companiesMap.values())
      .sort((a, b) => a.company.localeCompare(b.company));
  }
  
  function calculateCompanyAngles(companies) {
    const totalDrugs = companies.reduce((sum, company) => sum + company.totalDrugs, 0);
    let currentAngle = 0;
    const angles = new Map();
    const ANGLE_BUFFER = Math.PI / 24;

    companies.forEach(company => {
      const proportion = company.totalDrugs / totalDrugs;
      const angle = proportion * (2 * Math.PI - (companies.length * ANGLE_BUFFER));
      angles.set(company.company, {
        start: currentAngle,
        end: currentAngle + angle,
        center: currentAngle + angle/2
      });
      currentAngle += angle + ANGLE_BUFFER;
    });

    return angles;
  }

  // Tooltip state
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

  function showTooltip(event, d, isCompany = false) {
    if (!svg) return;
    
    const containerRect = svg.getBoundingClientRect();
    tooltipX = event.clientX - containerRect.left + 15;
    tooltipY = event.clientY - containerRect.top + 15;
    
    if (isCompany) {
      tooltipContent = {
        sponsor: d.company,
        drugName: '',
        therapeuticArea: '',
        id: `${d.totalDrugs} drugs in pipeline`
      };
      const statusColor = getCompanyStatusColor(d.status);
      tooltipBorderColor = statusColor.stroke;
    } else {
      tooltipContent = {
        sponsor: d.Company || '',
        drugName: d.Candidate || '',
        therapeuticArea: d.TherapeuticArea1 || '',
        id: d["Current Development Stage"] || ''
      };
      const stageCode = getStage(d);
      const stageFullName = getStageFullName(stageCode);
      const stageColor = getStageColor(stageFullName);
      tooltipBorderColor = stageColor.stroke;
    }
    
    tooltipVisible = true;
  }
  
  function hideTooltip() {
    tooltipVisible = false;
  }

  // Active selection tracking
  let activeCompany = null;
  let activeStage = null;

  function setActiveCompany(company, entries) {
    // Set the active company and clear active stage
    activeCompany = company;
    activeStage = null;
    
    // Reset all company nodes and labels to inactive state
    d3.selectAll(".company-node rect")
      .transition()
      .duration(200)
      .attr("width", "7.725")
      .attr("height", "7.725")
      .attr("transform", "translate(-3.8625, -3.8625)");
        
    d3.selectAll(".company-label text")
      .transition()
      .duration(500)
      .attr("fill", "#4A5568")
      .attr("font-size", "9.25px")
      .attr("font-weight", "500");
        
    d3.selectAll(".pipeline-dots circle")
      .transition()
      .duration(200)
      .attr("r", 3)
      .attr("opacity", 0.825);
        
    // Highlight the active company
    if (company) {
      const companyId = company.replace(/\s+/g, '-').toLowerCase();
            
      d3.select(`#company-label-${companyId} text`)
        .transition()
        .duration(500)
        .attr("font-weight", "800");
            
      // Find company data for this company
      const companyData = processDataForLayout(data).find(c => c.company === company);
      if (companyData) {
        // Pass additional metrics to onCompanyHover
        onCompanyHover({
          entries: companyData.entries,
          companyName: companyData.company, 
          totalDrugs: companyData.totalDrugs,
          clinicalTrials: companyData.clinicalTrials,
          vouchersAwarded: companyData.vouchersAwarded,
          uniqueIndications: companyData.uniqueIndications.size,
          uniqueAreas: companyData.uniqueAreas.size
        });
      } else {
        onCompanyHover(entries);
      }
    }
  }
  
  function setActiveStage(stage, entries) {
    // Set the active stage and clear active company
    activeStage = stage;
    activeCompany = null;
    
    // Reset all stage circles to inactive state
    d3.selectAll(".stage-label rect")
      .transition()
      .duration(200)
      .attr("fill", "#F8FAFC");
        
    d3.selectAll(".stage-label text")
      .transition()
      .duration(200)
      .attr("font-weight", "400");
        
    // Highlight the active stage
    if (stage) {
      d3.select(`#stage-label-${stage} rect`)
        .transition()
        .duration(200)
        .attr("fill", "#F1F5F9");
            
      d3.select(`#stage-label-${stage} text`)
        .transition()
        .duration(200)
        .attr("font-weight", "700");
            
      onStageHover(entries);
    }
  }

  // D3 visualization setup
  function createVisualization() {
    if (!svg || !data || data.length === 0) return;
    
    const svgElement = d3.select(svg);
    svgElement.selectAll("*").remove();
    
    // Create drop shadow filter
    const defs = svgElement.append("defs");
    
    const dropShadow = defs.append("filter")
      .attr("id", "dropshadow")
      .attr("width", "200%")
      .attr("height", "200%")
      .attr("x", "-50%")
      .attr("y", "-50%");
      
    dropShadow.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 2.5)
      .attr("result", "blur");
      
    dropShadow.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 1.25)
      .attr("dy", 1.5)
      .attr("result", "offsetBlur");
      
    // Apply color to the shadow
    dropShadow.append("feColorMatrix")
      .attr("in", "offsetBlur")
      .attr("type", "matrix")
      .attr("values", "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0")
      .attr("result", "shadowMatrixOut");
      
    const feMerge = dropShadow.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "shadowMatrixOut");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    
    // Main visualization group (centered)
    const mainGroup = svgElement.append("g")
      .attr("transform", `translate(${width/2},${height/2})`);
      
    const linesGroup = mainGroup.append("g").attr("class", "connecting-lines");
    const stagesGroup = mainGroup.append("g").attr("class", "stage-circles");
    const companyLabelsGroup = mainGroup.append("g").attr("class", "company-labels");
    const drugsGroup = mainGroup.append("g").attr("class", "drugs");
    
    // Add circles for each stage
    Object.entries(stageRadii).forEach(([stage, radius]) => {
      const stageFullName = getStageFullName(stage);
      const stageColor = getStageColor(stageFullName);
      
      stagesGroup.append("circle")
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
      
      const labelGroup = stagesGroup.append("g")
        .attr("transform", `translate(${labelX},${labelY})`)
        .attr("class", "stage-label")
        .attr("id", `stage-label-${stage}`)
        .attr("cursor", "pointer");
        
      // Calculate text width for background pill
      const tempText = labelGroup.append("text")
        .attr("opacity", 0)
        .text(stage);
      const textWidth = tempText.node()?.getBBox().width ?? 0;
      tempText.remove();
        
      // Background pill for the label
      labelGroup.append("rect")
        .attr("x", -textWidth/2 - 10)
        .attr("y", -10)
        .attr("width", textWidth + 20)
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
        
      // Add click handler for each stage
      labelGroup.on("click", (event) => {
        event.stopPropagation();
        
        const stageEntries = data.filter(entry => getStage(entry) === stage);
        setActiveStage(stage, stageEntries);
      });
    });
    
    // Process and display companies
    const companies = processDataForLayout(data);
    const companyAngles = calculateCompanyAngles(companies);
    
    // Calculate label placement
    const labelConfig = {
      minRadius: radius * 0.9825,
      maxRadius: radius * 1.1,
      padding: 8.25,
      minAngleDiff: Math.PI / 32,
      textHeight: 12,
      dotRowHeight: 5,
      maxDotsPerRow: 5
    };
    
    // Simple label placement function
    function calculateLabelPlacements(companies, companyAngles) {
      const labels = [];
      
      companies.forEach(company => {
        const angle = companyAngles.get(company.company);
        if (!angle) return;
        
        const centerAngle = angle.center;
        const isRightSide = Math.cos(centerAngle - Math.PI/2) > 0;
        const labelRadius = labelConfig.minRadius + Math.random() * (labelConfig.maxRadius - labelConfig.minRadius);
        
        labels.push({
          company: company.company,
          x: labelRadius * Math.cos(centerAngle - Math.PI/2),
          y: labelRadius * Math.sin(centerAngle - Math.PI/2),
          angle: centerAngle,
          isRightSide
        });
      });
      
      return labels;
    }
    
    const labelPlacements = calculateLabelPlacements(companies, companyAngles);
    
    companies.forEach(company => {
      const angle = companyAngles.get(company.company);
      if (!angle) return;
      
      // Calculate node position (where lines connect)
      const nodeRadius = radius * 0.9725;
      const nodeAngle = angle.center;
      const nodeX = nodeRadius * Math.cos(nodeAngle - Math.PI/2);
      const nodeY = nodeRadius * Math.sin(nodeAngle - Math.PI/2);
      
      // Get company status color
      const statusColor = getCompanyStatusColor(company.status);
      
      // Create company node
      const companyId = company.company.replace(/\s+/g, '-').toLowerCase();
      
      const nodeGroup = companyLabelsGroup.append("g")
        .attr("transform", `translate(${nodeX},${nodeY})`)
        .attr("cursor", "pointer")
        .attr("class", "company-node")
        .attr("id", `company-node-${companyId}`);
        
      nodeGroup.append("rect")
        .attr("width", 7.725)
        .attr("height", 7.725)
        .attr("transform", "translate(-3.8625, -3.8625)")
        .attr("fill", statusColor.fill)
        .attr("stroke", statusColor.stroke)
        .attr("stroke-width", 0.725)
        .attr("rx", 2);
        
      // Find label placement for this company
      const labelPlacement = labelPlacements.find(l => l.company === company.company);
      if (!labelPlacement) return;
      
      // Add connecting line from node to label
      linesGroup.append("path")
        .attr("d", `M${nodeX},${nodeY}L${labelPlacement.x},${labelPlacement.y}`)
        .attr("stroke", "#37587e")
        .attr("stroke-width", 0.725)
        .attr("stroke-opacity", 0.825)
        .attr("fill", "none");
        
      const labelGroup = companyLabelsGroup.append("g")
        .attr("transform", `translate(${labelPlacement.x},${labelPlacement.y})`)
        .attr("cursor", "pointer")
        .attr("class", "company-label")
        .attr("id", `company-label-${companyId}`);
        
      // Create label text and dots group
      const textAnchor = labelPlacement.isRightSide ? "start" : "end";
      const xOffset = labelPlacement.isRightSide ? 15 : -15;
      
      // Add text element for company name
      labelGroup.append("text")
        .attr("text-anchor", textAnchor)
        .attr("dx", xOffset)
        .attr("dy", "0.35em")
        .attr("fill", "#4A5568")
        .attr("font-size", "9.25px")
        .attr("font-weight", "500")
        .text(company.company);
        
      // Add dots group with improved positioning
      const dotsGroup = labelGroup.append("g")
        .attr("class", "pipeline-dots")
        .attr("transform", `translate(${xOffset}, ${labelConfig.textHeight})`);
      
      const numDots = company.entries.length;
      const dotsPerRow = Math.min(labelConfig.maxDotsPerRow, numDots);
      const numRows = Math.ceil(numDots / dotsPerRow);
      
      for (let i = 0; i < numDots; i++) {
        const row = Math.floor(i / dotsPerRow);
        const col = i % dotsPerRow;
        const x = labelPlacement.isRightSide ? 
          col * 10 : 
          -(col * 10);
        
        dotsGroup.append("circle")
          .attr("r", 3)
          .attr("cx", labelPlacement.isRightSide ? x : x - (dotsPerRow - 1) * 10)
          .attr("cy", row * labelConfig.dotRowHeight)
          .attr("fill", statusColor.fill)
          .attr("stroke", statusColor.stroke)
          .attr("stroke-width", 0.5)
          .attr("opacity", 0.825);
      }
        
      // Add company interaction handlers
      const handleCompanyMouseEnter = (event) => {
        showTooltip(event, {
          company: company.company,
          totalDrugs: company.totalDrugs,
          status: company.status
        }, true);
      };
      
      const handleCompanyClick = (event) => {
        event.stopPropagation();
        hideTooltip();
        setActiveCompany(company.company, company.entries);
      };
      
      nodeGroup
        .on("mouseenter", handleCompanyMouseEnter)
        .on("mousemove", handleCompanyMouseEnter)
        .on("mouseleave", hideTooltip)
        .on("click", handleCompanyClick);
      
      labelGroup
        .on("mouseenter", handleCompanyMouseEnter)
        .on("mousemove", handleCompanyMouseEnter)
        .on("mouseleave", hideTooltip)
        .on("click", handleCompanyClick);
        
      // Display drugs for each company by stage
      company.stages.forEach((drugs, stage) => {
        const stageRadius = stageRadii[stage];
        const drugSpacing = (angle.end - angle.start) / (drugs.length + 1);
        
        drugs.forEach((drug, i) => {
          const drugAngle = angle.start + drugSpacing * (i + 1);
          const drugX = stageRadius * Math.cos(drugAngle - Math.PI/2);
          const drugY = stageRadius * Math.sin(drugAngle - Math.PI/2);
          
          // Add connecting line from company node to drug
          linesGroup.append("path")
            .attr("d", `M${nodeX},${nodeY}L${drugX},${drugY}`)
            .attr("stroke", "#37587e")
            .attr("stroke-width", 0.7625)
            .attr("stroke-opacity", 0.525)
            .attr("fill", "none");
            
          const drugGroup = drugsGroup.append("g")
            .attr("transform", `translate(${drugX},${drugY})`)
            .attr("cursor", "pointer");
            
          // Get therapeutic area color
          const areaColors = getTherapeuticAreaColor(drug.TherapeuticArea1);
          
          // Drug circle
          drugGroup.append("circle")
            .attr("r", 7.725)
            .attr("fill", areaColors.fill)
            .attr("stroke", areaColors.stroke)
            .attr("stroke-width", 1.5)
            .style("filter", "url(#dropshadow)");
            
          // Add PRV indicator if applicable
          if (drug["PRV Year"]) {
            drugGroup.append("circle")
              .attr("r", 11.25)
              .attr("fill", "none")
              .attr("stroke", "#976201")
              .attr("stroke-width", "2")
              .attr("stroke-dasharray", "2,2");
          }
          
          // Add drug interaction events
          drugGroup
            .on("mouseenter", (event) => {
              drugGroup.select("circle")
                .transition()
                .duration(200)
                .attr("r", 10.25)
                .style("filter", "url(#dropshadow)");
              
              if (drug["PRV Year"]) {
                drugGroup.select("circle:last-child")
                  .transition()
                  .duration(200)
                  .attr("r", 14)
                  .attr("stroke-width", 3);
              }
              
              showTooltip(event, drug);
            })
            .on("mousemove", (event) => {
              showTooltip(event, drug);
            })
            .on("mouseleave", () => {
              drugGroup.select("circle")
                .transition()
                .duration(200)
                .attr("r", 7.725)
                .style("filter", "url(#dropshadow)");
                
              if (drug["PRV Year"]) {
                drugGroup.select("circle:last-child")
                  .transition()
                  .duration(200)
                  .attr("r", 11.25)
                  .attr("stroke-width", 2);
              }
              
              hideTooltip();
            })
            .on("click", (event) => {
              event.stopPropagation();
              hideTooltip();
              
              onShowDrugDetail({
                drugName: drug.Candidate,
                year: drug["PRV Year"],
                Company: drug.Company,
                therapeuticArea: drug.TherapeuticArea1,
                indication: drug.Indication || "",
                currentStage: drug["Current Development Stage"],
                color: areaColors.fill,
                strokeColor: areaColors.stroke
              });
            });
        });
      });
    });
    
    // Add click handler to SVG background to clear selections
    svgElement.on("click", (event) => {
      if (event.target === svg) {
        hideTooltip();
        activeCompany = null;
        activeStage = null;
        onLeave();
      }
    });
    
    // Add event listener for mouseleave on SVG
    svgElement.on("mouseleave", hideTooltip);
  }
  
  // Initialize visualization when data or svg changes
  $: if (data.length > 0 && svg) {
    createVisualization();
  }
  
  onMount(() => {
    // Initialize D3 visualization
    createVisualization();
    
    return () => {
      // Cleanup
    };
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
    
    {#if tooltipVisible}
      <div 
        class="tooltip"
        style="left: {tooltipX}px; top: {tooltipY}px; border-color: {tooltipBorderColor};"
      >
        <div class="tooltip-header">
          {tooltipContent.sponsor}
        </div>
        {#if tooltipContent.drugName}
          <div class="tooltip-drug">
            {tooltipContent.drugName}
          </div>
        {/if}
        {#if tooltipContent.therapeuticArea}
          <div class="tooltip-area">
            {tooltipContent.therapeuticArea}
          </div>
        {/if}
        <div class="tooltip-stage">
          {tooltipContent.id}
        </div>
      </div>
    {/if}
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
  
  .tooltip {
    position: absolute;
    background: white;
    border: 2px solid;
    border-radius: 5px;
    padding: 10px;
    pointer-events: none;
    width: 200px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10;
    font-size: 12px;
  }
  
  .tooltip-header {
    font-weight: bold;
    margin-bottom: 5px;
    font-size: 14px;
  }
  
  .tooltip-drug {
    font-style: italic;
    margin-bottom: 3px;
  }
  
  .tooltip-area {
    color: #666;
    margin-bottom: 3px;
  }
  
  .tooltip-stage {
    font-weight: 500;
    color: #555;
  }