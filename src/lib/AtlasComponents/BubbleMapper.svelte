<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';
  import type { Feature, FeatureCollection, Geometry } from 'geojson';
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
    [key: string]: string | number | undefined;
  }

  let mapContainer: HTMLDivElement;
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let g: d3.Selection<SVGGElement, unknown, null, undefined>;
  let projection: d3.GeoProjection;
  let countryData: CountryData[] = countryDataJson;
  let path: d3.GeoPath;
let worldData: FeatureCollection;
  let zoom: d3.ZoomBehavior<Element, unknown>;

  onMount(async () => {
    svg = d3.select(mapContainer)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height].join(' '));

    g = svg.append("g");

    // Set up equirectangular projection
    projection = d3.geoEquirectangular()
      .fitSize([width, height], { type: "Sphere" });

    path = d3.geoPath().projection(projection);

    // Load world data
    worldData = await d3.json('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson');

    if (!worldData) {
      throw new Error('Failed to load world data');
    }

    dispatch('dataLoaded', countryData);

    // Add graticules
    const graticule = d3.geoGraticule();
    g.append("path")
      .datum(graticule)
      .attr("class", "graticule")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#969696")
      .attr("stroke-width", "0.15px");

    // Add countries
    g.selectAll<SVGPathElement, Feature<Geometry, any>>("path.country")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("fill", d => getCountryColor(d))
      .attr("d", path)
      .style("stroke", "#565656")
      .style("stroke-width", "0.125px")
      .on("mouseover", (event, d) => {
        const countryInfo = countryData.find(c => 
          c.geoJsonId === d.properties.ISO_A3 || c.id === d.properties.ISO_A3
        );
        if (countryInfo) {
          onCountryHover(countryInfo);
          d3.select(event.target as Element).style("cursor", "pointer");
          highlightCountry(d);
        }
      })
      .on("mouseout", () => {
        onCountryHover(null);
        resetHighlight();
      })
      .on("click", (event, d) => {
        const countryInfo = countryData.find(c => 
          c.geoJsonId === d.properties.ISO_A3 || c.id === d.properties.ISO_A3
        );
        if (countryInfo) {
          onCountryClick(countryInfo);
          zoomToCountry(d);
        }
      });

    // Add zoom behavior
    zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
  });

  function getCountryColor(d: Feature<Geometry, any>): string {
    const countryInfo = countryData.find(c => 
      c.geoJsonId === d.properties.ISO_A3 || c.id === d.properties.ISO_A3
    );
    if (!countryInfo) return '#E1EEEE';
    const rank = rankedData[countryInfo.id];
    return colorGradient[rank];
  }

  function highlightCountry(d: Feature<Geometry, any>) {
    g.selectAll("path.country")
      .style("opacity", feature => feature === d ? 1 : 0.5);
  }

  function resetHighlight() {
    g.selectAll("path.country")
      .style("opacity", 1);
  }

  function zoomToCountry(d: Feature<Geometry, any>) {
    const bounds = path.bounds(d);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
    const translate = [width / 2  - scale * x, height / 2 - scale * y];

    svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity
        .translate(translate[0], translate[1])
        .scale(scale));
  }

  export function getMapSvgString(): string {
    return svg?.node()?.outerHTML || '';
  }
</script>

<div class="relative w-full h-full flex items-center justify-center">
  <div class="mapContainer" bind:this={mapContainer}></div>
</div>

<style>
.mapContainer {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
}

:global(svg) {
    width: 100%;
    height: 100%;
    position: relative;
}

.graticule {
    opacity: 0.3;
}
</style>