<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { Building, Medication, Stethoscope, MedicationAlert } from 'carbon-icons-svelte';

  interface ConstellationData {
    name: string;
    id: string;
    "Treatment Type": string;
    "Drug Name": string;
    Sponsor: string;
    [key: string]: any;
  }

  interface HierarchyNode {
    name: string;
    children?: HierarchyNode[];
    value?: number;
  }

  interface BreadcrumbNode {
    name: string;
    depth: number;
    data: any;
  }

  interface TooltipContent {
    sponsor: string;
    drugName: string;
    therapeuticArea: string;
    id: string;
  }

  const therapeuticAreaColors = {
    "Gastroenterology": "#39FF14",
    "Neurology": "#4D4DFF",
    "Ophthalmology": "#E79028",
    "Immunology": "#EA38A5",
    "Metabolic": "#133B11",
    "Dermatology": "#559368",
    "Hematology": "#CF3630",
    "Orthopedics": "#441780",
    "Pulmonology": "#CBC09F",
    "Nephrology": "#ACA3DB",
    "Oncology": "#FF84DE",
    "Genetic": "#4D4DFF",
    "Hepatology": "#FF00D4"
  };

  export let constellationData: ConstellationData[];
  
  let svg: SVGElement;
  let root: any;
  let arc: any;
  let path: any;
  let label: any;
  let parent: any;
  let svgElement: any;
  let currentPath: BreadcrumbNode[] = [];
  
  let tooltipVisible = false;
  let tooltipX = 0;
  let tooltipY = 0;
  let tooltipContent: TooltipContent = {
    sponsor: '',
    drugName: '',
    therapeuticArea: '',
    id: ''
  };
  let tooltipBorderColor = '';

  const width = 900;
  const height = width;
  const radius = width / 6.25;

  function processData(data: ConstellationData[]): HierarchyNode {
    const root: HierarchyNode = {
      name: "All Treatments",
      children: []
    };

    const byName = d3.group(data, d => d.name);
    
    byName.forEach((nameGroup, name) => {
      const nameNode: HierarchyNode = {
        name: name,
        children: []
      };

      const byId = d3.group(nameGroup, d => d.id);
      
      byId.forEach((idGroup, id) => {
        const idNode: HierarchyNode = {
          name: id,
          children: []
        };

        const byTreatmentType = d3.group(idGroup, d => d["Treatment Type"] || "Unknown");
        
        byTreatmentType.forEach((treatmentGroup, treatmentType) => {
          const treatmentNode: HierarchyNode = {
            name: treatmentType,
            children: treatmentGroup.map(d => ({
              name: d["Drug Name"],
              value: 1,
              Sponsor: d.Sponsor
            }))
          };
          
          idNode.children?.push(treatmentNode);
        });
        
        nameNode.children?.push(idNode);
      });
      
      root.children?.push(nameNode);
    });

    return root;
  }

  function getColor(d: any) {
    if (d.depth === 0) return "#fff";
    
    if (d.depth === 1) {
      return therapeuticAreaColors[d.data.name] || "#999";
    }
    
    let ancestor = d;
    while (ancestor.depth > 1) ancestor = ancestor.parent;
    const baseColor = therapeuticAreaColors[ancestor.data.name] || "#999";
    
    const rgb = d3.rgb(baseColor);
    const opacity = 1 - (d.depth - 1) * 0.2;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  }

  function getStrokeColor(d: any) {
    if (d.parent && d.parent.depth === 0) {
      return "white";
    }
    
    let therapeuticArea = d;
    while (therapeuticArea.depth > 1) therapeuticArea = therapeuticArea.parent;
    return therapeuticAreaColors[therapeuticArea.data.name] || "#999";
  }

  function arcVisible(d: any) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  function labelVisible(d: any) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function labelTransform(d: any) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }

  function getTherapeuticAreaAncestor(d: any) {
    let node = d;
    while (node.depth > 1) node = node.parent;
    return node.depth === 1 ? node : null;
  }

  function handleMouseOver(event: MouseEvent, d: any) {
    const therapeuticArea = getTherapeuticAreaAncestor(d);
    
    tooltipX = event.pageX;
    tooltipY = event.pageY;
    tooltipContent = {
      sponsor: d.data.Sponsor || '',
      drugName: d.data.name,
      therapeuticArea: therapeuticArea?.data.name || '',
      id: d.parent?.data.name || ''
    };
    tooltipBorderColor = therapeuticAreaColors[therapeuticArea?.data.name || ''] || '#999';
    tooltipVisible = true;

    path.attr("opacity", (p: any) => {
      const pArea = getTherapeuticAreaAncestor(p);
      return (!therapeuticArea || pArea === therapeuticArea) ? 1 : 0.3;
    });

    d3.select(event.target).raise();
  }

  function handleMouseOut() {
    tooltipVisible = false;
    path.attr("opacity", 1);
  }

  function handleBreadcrumbClick(node: BreadcrumbNode) {
    if (!node) return;
    updateBreadcrumb(node);
    clicked(null, node);
  }

  function updateBreadcrumb(node: any) {
    currentPath = node.ancestors().reverse().slice(1);
  }

  function clicked(event: any, p: any) {
    if (!p) return;
    updateBreadcrumb(p);
    parent.datum(p.parent || root);

    root.each((d: any) => d.target = {
      x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      y0: Math.max(0, d.y0 - p.depth),
      y1: Math.max(0, d.y1 - p.depth)
    });

    const t = svgElement.transition().duration(750);

    path.transition(t)
      .tween("data", (d: any) => {
        const i = d3.interpolate(d.current, d.target);
        return (t: number) => d.current = i(t);
      })
      .filter(function(d: any) {
        return +this.getAttribute("fill-opacity")! || arcVisible(d.target);
      })
      .attr("fill-opacity", (d: any) => arcVisible(d.target) ? 0.9 : 0)
      .attr("pointer-events", (d: any) => arcVisible(d.target) ? "auto" : "none")
      .attrTween("d", (d: any) => () => arc(d.current));

    label.filter(function(d: any) {
      return +this.getAttribute("fill-opacity")! || labelVisible(d.target);
    }).transition(t)
      .attr("fill-opacity", (d: any) => +labelVisible(d.target))
      .attrTween("transform", (d: any) => () => labelTransform(d.current));
  }

  onMount(() => {
    if (!svg) return;

    d3.select(svg).selectAll("*").remove();

    const hierarchy = d3.hierarchy(processData(constellationData))
      .sum(d => (d as any).value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    root = d3.partition()
      .size([2 * Math.PI, hierarchy.height + 1])(hierarchy);

    root.each((d: any) => d.current = d);

    // Modify the arc generator to contain the lines
    arc = d3.arc()
      .startAngle((d: any) => d.x0)
      .endAngle((d: any) => d.x1)
      .padAngle(0) // Remove padding to prevent line extension
      .innerRadius((d: any) => d.y0 * radius/3.25)
      .outerRadius((d: any) => Math.max(d.y0 * radius, d.y1 * radius - 1))
      .cornerRadius(0); // Ensure sharp corners

    svgElement = d3.select(svg)
      .attr("viewBox", [-width / 2, -height / 2, width, width])
      .style("font", "10px sans-serif");

    // Add a clip path to contain the lines
    svgElement.append("defs")
      .append("clipPath")
      .attr("id", "sunburst-clip")
      .append("circle")
      .attr("r", radius * 3); // Match the outermost radius

    // Modify the path creation to use clip path
    path = svgElement.append("g")
      .attr("clip-path", "url(#sunburst-clip)")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
      .attr("fill", d => getColor(d))
      .attr("stroke", d => getStrokeColor(d))
      .attr("stroke-width", "0.25")
      .attr("fill-opacity", d => arcVisible(d.current) ? 0.9 : 0)
      .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
      .attr("d", d => arc(d.current));

    path.filter(d => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

    const format = d3.format(",d");
    path.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

    label = svgElement.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
      .attr("dy", "0.35em")
      .attr("fill", "white")
      .attr("fill-opacity", d => +labelVisible(d.current))
      .attr("transform", d => labelTransform(d.current))
      .text(d => d.data.name);

    parent = svgElement.append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);

    updateBreadcrumb(root);
  });
</script>

<div class="visualization-container">
  <div class="breadcrumb-container">
    <div class="breadcrumbs">
      <span 
        class="breadcrumb-item home"
        on:click={() => handleBreadcrumbClick(currentPath[0])}
        on:keydown={(e) => e.key === 'Enter' && handleBreadcrumbClick(currentPath[0])}
        tabindex="0"
      >
        All Treatments
      </span>
      {#each currentPath as node, i}
        {#if i > 0}
          <span class="separator">/</span>
        {/if}
        <span 
          class="breadcrumb-item"
          on:click={() => handleBreadcrumbClick(node)}
          on:keydown={(e) => e.key === 'Enter' && handleBreadcrumbClick(node)}
          tabindex="0"
        >
          {node.data.name}
        </span>
      {/each}
    </div>
  </div>

  <div class="sunburst-container">
    <svg bind:this={svg}></svg>
  </div>

  {#if tooltipVisible}
    <div
      class="tooltip"
      style="left: {tooltipX}px; top: {tooltipY}px; --border-color: {tooltipBorderColor};"
    >
      <div class="tooltip-content">
        <div class="entry-title">
          <Medication size={12} />
          <span class="drugname">{tooltipContent.drugName}</span> 
        </div>
        <div class="entry-bottom">
          <Building size={12} />
          <span class="sponsor">{tooltipContent.sponsor}</span> 
        </div>
        <div class="entry-bottom">
          <MedicationAlert size={12} />
          <span class="therapeutic-area">{tooltipContent.therapeuticArea}</span>
        </div>
        <div class="entry-bottom">
          <Stethoscope size={12} />
          <span class="indication">{tooltipContent.id}</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .visualization-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 928px;
    margin: 0 auto;
  }

  .breadcrumb-container {
    width: 100%;
    padding: 1rem 0;
  }

  .breadcrumbs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    font-size: 0.875rem;
    color: #4b5563;
  }

  .breadcrumb-item {
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    text-transform: capitalize;
    color: #4b5563;
    transition: all 0.2s ease;
  }

  .breadcrumb-item:hover {
    background-color: rgba(201, 98, 63, 0.1);
    color: #C9623F;
  }

  .breadcrumb-item:focus {
    outline: none;
    color: #C9623F;
  }

  .home {
    color: #C9623F;
    font-weight: 600;
  }

  .separator {
    margin: 0 0.5rem;
    color: #9ca3af;
  }

  .sunburst-container {
    width: 928px;
    height: 928px;
    
  }

  svg {
    width: 100%;
    height: 100%;
  }
</style>