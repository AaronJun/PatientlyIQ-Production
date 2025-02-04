<script lang="ts">
  import { onMount, createEventDispatcher, afterUpdate } from 'svelte';
  import * as d3 from 'd3';
  import type { Feature, FeatureCollection, Geometry } from 'geojson';
  import countryDataJson from './compScore.json';

  const dispatch = createEventDispatcher();

  export let width: number = 1200;
  export let height: number = 950;
  export const selectedMetric: string = 'compositeScore';
  export let rankedData: {[key: string]: number};
  export let colorGradient: string[];
  export const higherIsBetter: boolean = true;
  export let onCountryClick: (data: CountryData) => void;
  export let onCountryHover: (data: CountryData | null) => void;

export function highlightCountry(countryId: string | null) {
  if (!g) return;
  
  g.selectAll("path")
    .style("filter", d => {
      const feature = d as Feature<Geometry, any>;
      if (!countryId) return "none";
      const isTarget = feature.properties.ISO_A3 === countryId;
      return isTarget ? "none" : "brightness(0.7) saturate(0.5)";
    });
}

export function zoomToCountry(countryId: string) {
  if (!g || !path || !zoom || !svg) return;
  
  const feature = worldData.features.find(
    f => f.properties.ISO_A3 === countryId
  );
  
  if (feature) {
    const bounds = path.bounds(feature);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
    const translate = [width / 2 - scale * x, height / 2 - scale * y];

    svg.transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
  }
}

  let mapContainer: HTMLDivElement;
  let svgElement: SVGSVGElement;

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

  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let g: d3.Selection<SVGGElement, unknown, null, undefined>;
  let projection: d3.GeoProjection;
  let countryData: CountryData[] = countryDataJson;
  let zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  let path: d3.GeoPath<any, d3.GeoPermissibleObjects>;
  let worldData: FeatureCollection;

  onMount(async () => {
    svg = d3.select(mapContainer)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%');

    svgElement = svg.node()!;

    g = svg.append("g");

    zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", zoomed);

    svg.call(zoom);

    projection = d3.geoNaturalEarth1(); // or another projection of your choice

    path = d3.geoPath().projection(projection);

    worldData = await d3.json<FeatureCollection>('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson');


    if (!worldData) {
      throw new Error('Failed to load world data');
    }

    dispatch('dataLoaded', countryData);

g.selectAll<SVGPathElement, Feature<Geometry, any>>("path")
  .data(worldData.features)
  .enter()
  .append("path")
  .attr("fill", d => getCountryColor(d))
  .attr("d", path)
  .style("stroke", "#D6D3CF")
  .style("stroke-width", "0.325px")
  .on("mouseover", (event, d) => {
    const countryInfo = countryData.find(c => c.geoJsonId === d.properties.ISO_A3 || c.id === d.properties.ISO_A3);
    if (countryInfo) {
      onCountryHover(countryInfo);
      d3.select(event.target as Element).style("cursor", "pointer");
      darkenOtherCountries(d);
    }
  })
  .on("mouseout", () => {
    onCountryHover(null);
    g.selectAll("path")
      .style("filter", "none")
      .style("cursor", "default");
  })
  .on("click", (event, d) => {
    const countryInfo = countryData.find(c => c.geoJsonId === d.properties.ISO_A3 || c.id === d.properties.ISO_A3);
    if (countryInfo) {
      onCountryClick(countryInfo);
      zoomToFeature(d);
    }
  });

updateVisualization();

const { scale, translate } = fitMapToContainer();
g.attr("transform", `translate(${translate[0]},${translate[1]}) scale(${scale})`);
zoom.transform(svg, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
});

  afterUpdate(() => {
    updateVisualization();
  });

  function getCountryColor(d: Feature<Geometry, any>): string {
  const countryInfo = countryData.find(c => c.geoJsonId === d.properties.ISO_A3 || c.id === d.properties.ISO_A3);
  if (!countryInfo) return '#E9E5E0';
  const rank = rankedData[countryInfo.id];
  return colorGradient[rank]; 

}
  function updateVisualization() {
    if (!g) return;

    g.selectAll<SVGPathElement, Feature<Geometry, any>>("path")
      .transition()
      .duration(1000)
      .attr("fill", d => getCountryColor(d));
  }

  function zoomed(event: d3.D3ZoomEvent<SVGSVGElement, unknown>) {
    const {transform} = event;
    g.attr("transform", transform.toString());
  }

  function zoomToFeature(d: Feature<Geometry, any>) {
    const bounds = path.bounds(d);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
    const translate = [width / 2 - scale * x, height / 2 - scale * y];

    svg.transition().duration(850).call(
      zoom.transform,
      d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
    );
  }

  function fitMapToContainer() {
    const bounds = path.bounds({ type: "FeatureCollection", features: worldData.features });
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 3.25;
    const y = (bounds[0][1] + bounds[1][1]) / 4;

    const scale = 1.3 / Math.max(dx / width, dy / height);
    const translate = [width / 2 - scale * x, height / 2 - scale * y];

    return { scale, translate };
  }

  export function resetZoom() {
    const { scale, translate } = fitMapToContainer();
    
    svg.transition()
      .duration(700)
      .call(
        zoom.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
  }

  function darkenOtherCountries(hoveredCountry: Feature<Geometry, any>) {
    g.selectAll<SVGPathElement, Feature<Geometry, any>>("path")
      .style("filter", d => {
        const countryInfo = countryData.find(c => c.geoJsonId === d.id || c.id === d.id);
        if (countryInfo && d !== hoveredCountry) {
          return "brightness(.9) saturate(0) opacity(0.5) blur(.5px)";
        }
        return "none"
      });
  }

  export function getMapSvgString(): string {
    if (!svgElement) return '';
    
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    
    clonedSvg.setAttribute('width', width.toString());
    clonedSvg.setAttribute('height', height.toString());
    clonedSvg.removeAttribute('transform');
    
    const serializer = new XMLSerializer();
    return serializer.serializeToString(clonedSvg);
  }
</script>
<div class="relative w-full h-full">
<h1 class="heading text-2xl align-middle justify-center w-full ml-4 mr-12 mt-8 font-semibold text-slate-800">Feasibility Mapper</h1>
<div class="mapContainer bg-[#D6D3C]" bind:this={mapContainer}></div>
</div>
<style>
.mapContainer {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    touch-action: none;
    -ms-touch-action: none;
}

:global(svg) {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}

.heading 
{ 
  border-bottom: 1px solid #D6D3CF;
}

</style>