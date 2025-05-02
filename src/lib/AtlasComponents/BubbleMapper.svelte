<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';
  import type { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
  import countryDataJson from './compScore.json';

  const dispatch = createEventDispatcher();

  export let width: number = 960;
  export let height: number = 500;
  export const selectedMetric: string = 'compositeScore';
  export let rankedData: {[key: string]: number};
  export let colorGradient: string[];
  export const higherIsBetter: boolean = true;
  export let onCountryClick: (data: CountryData) => void;
  export let onCountryHover: (data: CountryData | null) => void;

  interface CountryData {
    name: string;
    id: string;
    geoJsonId?: string;
    compositeScore: number;
    studyStartUpDays: number;
    studiesWithCountryExperience: number;
    competingStudies: number;
    experiencedSites: number;
    totalIPFCases: number;
    ipfPatientRegistry: string;
    worldwideIPFExperience: number;
    medidataAggregateRecruitmentRate: number;
    [key: string]: string | number | undefined;
  }

  let mapContainer: HTMLDivElement;
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let g: d3.Selection<SVGGElement, unknown, null, undefined>;
  let projection: d3.GeoProjection;
  let countryData: CountryData[] = countryDataJson;
  let path: d3.GeoPath;
  let worldData: FeatureCollection;
  let zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  let isMapInitialized = false;
  let updateTimeout: number | null = null;

  // Watch for changes in rankedData and update colors
  $: if (isMapInitialized && g && rankedData) {
    debouncedUpdateColors();
  }

  $: if (isMapInitialized && colorGradient && colorGradient.length > 0) {
    debouncedUpdateColors();
  }

  function debouncedUpdateColors() {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    
    updateTimeout = setTimeout(() => {
      updateColors();
      updateTimeout = null;
    }, 50) as unknown as number;
  }

  function updateColors() {
    if (!g) return;
    
    g.selectAll<SVGPathElement, Feature<Geometry, any>>("path.country")
      .transition()
      .duration(750)
      .attr("fill", d => getCountryColor(d));
  }

  export function resetZoom() {
    if (svg) {
      svg.transition()
        .duration(750)
        .call(zoom.transform as any, d3.zoomIdentity);
    }
  }

  export function highlightCountry(countryId: string | undefined) {
    if (!countryId || !g) return;
    
    g.selectAll<SVGPathElement, Feature<Geometry, any>>("path.country")
      .transition()
      .duration(200)
      .style("opacity", d => {
        const properties = d.properties || {};
        return (properties.ISO_A3 === countryId) ? 1 : 0.5;
      })
      .style("stroke-width", d => {
        const properties = d.properties || {};
        return (properties.ISO_A3 === countryId) ? "0.5px" : "0.125px";
      });
  }

  // Reset country highlight
  function resetHighlight() {
    if (!g) return;
    g.selectAll("path.country")
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke-width", "0.125px");
  }

  export function zoomToCountry(countryId: string | undefined) {
    if (!countryId || !worldData || !svg) return;
    
    const country = worldData.features.find(d => 
      d.properties && d.properties.ISO_A3 === countryId
    );
    
    if (country) {
      const bounds = path.bounds(country);
      const dx = bounds[1][0] - bounds[0][0];
      const dy = bounds[1][1] - bounds[0][1];
      const x = (bounds[0][0] + bounds[1][0]) / 2;
      const y = (bounds[0][1] + bounds[1][1]) / 2;
      const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
      const translate = [width / 2 - scale * x, height / 2 - scale * y];

      svg.transition()
        .duration(750)
        .call(zoom.transform as any, d3.zoomIdentity
          .translate(translate[0], translate[1])
          .scale(scale));
    }
  }

  onMount(async () => {
    svg = d3.select(mapContainer)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height].join(' '))
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // First create a background group for proper layering
    const background = svg.append("g").attr("class", "background-layer");
    
    // Add a background for the map
    background.append("rect")
      .attr("class", "map-background")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#fff")
      .attr("rx", 8)
      .attr("ry", 8);
      
    // Main map group (draw on top of background)  
    g = svg.append("g").attr("class", "map-layer");

    // Set up equirectangular projection with slight rotation for better appearance
    projection = d3.geoEquirectangular()
      .fitSize([width - 40, height - 40], { type: "Sphere" })
      .translate([width / 2, height / 2])
      .rotate([-10, 0, 0]); // Slight rotation for better visual

    path = d3.geoPath().projection(projection);

    // Load world data with proper type handling
    const response = await d3.json<FeatureCollection>('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson');
    
    if (!response) {
      throw new Error('Failed to load world data');
    }
    
    worldData = response;
    dispatch('dataLoaded', countryData);
    
    // Add world sphere outline for a cleaner look - using d3's built-in sphere generator
    g.append("path")
      .attr("class", "sphere")
      .attr("d", path({ type: "Sphere" }))
      .attr("fill", "none")
      .attr("stroke", "#E2E8F0")
      .attr("stroke-width", "0.5px");

    // Add graticules with lighter styling
    const graticule = d3.geoGraticule()
      .step([20, 20]); // Less dense graticule lines
      
    g.append("path")
      .datum(graticule)
      .attr("class", "graticule")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#E2E8F0")
      .attr("stroke-width", "0.15px");

    // Add countries with refined styling
    g.selectAll<SVGPathElement, Feature<Geometry, any>>("path.country")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("fill", d => getCountryColor(d))
      .attr("d", path)
      .style("stroke", "#565656")
      .style("stroke-width", "0.125px")
      .style("vector-effect", "non-scaling-stroke") // Maintain stroke width during zoom
      .on("mouseover", (event, d) => {
        const properties = d.properties || {};
        const countryInfo = countryData.find(c => 
          c.geoJsonId === properties.ISO_A3 || c.id === properties.ISO_A3
        );
        if (countryInfo) {
          onCountryHover(countryInfo);
          d3.select(event.target as Element)
            .style("cursor", "pointer")
            .style("stroke-width", "0.5px")
            .style("stroke", "#333333");
          highlightCountry(countryInfo.id);
        }
      })
      .on("mouseout", (event) => {
        onCountryHover(null);
        d3.select(event.target as Element)
          .style("stroke-width", "0.125px")
          .style("stroke", "#565656");
        resetHighlight();
      })
      .on("click", (event, d) => {
        const properties = d.properties || {};
        const countryInfo = countryData.find(c => 
          c.geoJsonId === properties.ISO_A3 || c.id === properties.ISO_A3
        );
        if (countryInfo) {
          onCountryClick(countryInfo);
          zoomToCountry(countryInfo.id);
        }
      });

    // Add zoom behavior with improved settings
    zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom as any)
      .on("dblclick.zoom", null); // Disable double-click zoom for better UX
    
    // Set flag to trigger reactive updates
    isMapInitialized = true;
  });

  function getCountryColor(d: Feature<Geometry, any>): string {
    const properties = d.properties || {};
    
    const countryInfo = countryData.find(c => 
      c.geoJsonId === properties.ISO_A3 || c.id === properties.ISO_A3
    );
    if (!countryInfo) return '#E1EEEE';
    
    // Make sure we have valid data
    if (!rankedData || typeof rankedData[countryInfo.id] === 'undefined') {
      return '#E1EEEE';
    }
    
    const rank = rankedData[countryInfo.id];
    return colorGradient[rank] || '#E1EEEE';
  }

  export function getMapSvgString(): string {
    return svg?.node()?.outerHTML || '';
  }
</script>

<div class="relative w-full h-full flex items-center justify-center">
  <div class="mapContainer" bind:this={mapContainer}></div>
  <div class="map-controls">
    <button class="control-btn" on:click={resetZoom} title="Reset zoom">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    </button>
  </div>
</div>

<style>
.mapContainer {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    max-height: calc(100vh - 160px);
    border-radius: 8px;
}

:global(svg) {
    width: 100%;
    height: 100%;
    position: relative;
    touch-action: none;
    overflow: visible;
    z-index: 1;
}

.map-background {
    z-index: 0;
}

.graticule {
    opacity: 0.4;
    z-index: 2;
}

.sphere {
    opacity: 0.8;
    z-index: 1;
}

:global(.mapContainer svg) {
    padding: 12px;
    box-sizing: border-box;
}

.map-controls {
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.control-btn {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    background: white;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #64748b;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
}

.control-btn:hover {
    background: #f1f5f9;
    color: #334155;
}
</style>