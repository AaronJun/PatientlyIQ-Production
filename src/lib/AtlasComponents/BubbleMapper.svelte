<script lang="ts">
  import { onMount, createEventDispatcher, afterUpdate } from 'svelte';
  import * as d3 from 'd3';
  import type { Feature, FeatureCollection, Geometry } from 'geojson';
  import countryDataJson from './compScore.json';

  const dispatch = createEventDispatcher();

  export let width: number = 950;
  export let height: number = 950;
  export const selectedMetric: string = 'compositeScore';
  export let rankedData: {[key: string]: number};
  export let colorGradient: string[];
  export const higherIsBetter: boolean = true;
  export let onCountryClick: (data: CountryData) => void;
  export let onCountryHover: (data: CountryData | null) => void;
  export let rotationSpeed: number = 0.00825; // Speed in degrees per millisecond
  export let initialScale: number = 1;
  export let minScale: number = 0.8;
  export let maxScale: number = 8;
  
  // Expose zoom methods
  export function zoomIn() {
    if (!projection) return;
    const currentScale = projection.scale();
    const newScale = Math.min(currentScale * 1.3, (height / 2.1) * maxScale);
    zoomTo(newScale);
  }

  export function zoomOut() {
    if (!projection) return;
    const currentScale = Math.max(projection.scale() / 1.3, (height / 2.1) * minScale);
    zoomTo(currentScale);
  }

  function zoomTo(scale: number) {
    if (!projection || !svg) return;
    
    projection.scale(scale);
    updateGlobe();
  }

  let mapContainer: HTMLDivElement;
  let svgElement: SVGSVGElement;
  let rotation = [0, 0, 0];
  let dragging = false;

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
  let path: d3.GeoPath<any, d3.GeoPermissibleObjects>;
  let worldData: FeatureCollection;

  // Create water sphere for the globe
  const graticule = d3.geoGraticule();
  const sphere = { type: 'Sphere' };

  let visibilityHandler: () => void;

  onMount(async () => {
    // Add visibility change listener
    visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);
    svg = d3.select(mapContainer)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%');

    svgElement = svg.node()!;
    g = svg.append("g");

    // Set up orthographic projection
    projection = d3.geoOrthographic()
      .scale(height / 2.45)
      .center([0, 0])
      .rotate(rotation)
      .translate([width / 2, height / 2]);

    path = d3.geoPath().projection(projection);

    // Load world data
    worldData = await d3.json<FeatureCollection>('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson');

    if (!worldData) {
      throw new Error('Failed to load world data');
    }

    dispatch('dataLoaded', countryData);

    // Add water sphere
    g.append("path")
      .datum(sphere)
      .attr("class", "sphere")
      .attr("d", path)
      .attr("fill", "#CED7EE");

    // Add graticules
    g.append("path")
      .datum(graticule)
      .attr("class", "graticule")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#B4C799")
      .attr("stroke-width", "0.425px");

    // Add countries
    g.selectAll<SVGPathElement, Feature<Geometry, any>>("path.country")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("fill", d => getCountryColor(d))
      .attr("d", path)
      .style("stroke", "#98A9DA")
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
        g.selectAll("path.country")
          .style("filter", "none")
          .style("cursor", "default");
      })
      .on("click", (event, d) => {
        const countryInfo = countryData.find(c => c.geoJsonId === d.properties.ISO_A3 || c.id === d.properties.ISO_A3);
        if (countryInfo) {
          onCountryClick(countryInfo);
          rotateToCountry(d);
        }
      });

    // Add drag behavior
    const drag = d3.drag<SVGSVGElement, unknown>()
      .on("start", () => { dragging = true; })
      .on("drag", (event) => {
        const rotate = projection.rotate();
        projection.rotate([
          rotate[0] + event.dx * 0.5,
          rotate[1] - event.dy * 0.5,
          rotate[2]
        ]);
        updateGlobe();
      })
      .on("end", () => { dragging = false; });

    svg.call(drag);

    // Add mouse wheel zoom
    svg.on('wheel', (event) => {
      event.preventDefault();
      const delta = event.deltaY;
      if (delta > 0) {
        zoomOut();
      } else {
        zoomIn();
      }
    });

    // Add smooth automatic rotation using requestAnimationFrame
    let lastTime = performance.now();
    let animationFrameId: number;

    function animate(currentTime: number) {
      if (!dragging && document.visibilityState === 'visible') {
        const delta = Math.min(currentTime - lastTime, 30); // Cap delta time
        lastTime = currentTime;
        
        const rotate = projection.rotate();
        const newRotation = [
          rotate[0] + delta * rotationSpeed,
          rotate[1],
          rotate[2]
        ];
        
        projection.rotate(newRotation);
        updateGlobe();
      }
      
      if (document.visibilityState === 'visible') {
        animationFrameId = requestAnimationFrame(animate);
      }
    }

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup animation on component destroy
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler);
      }
    };

    updateVisualization();
  });

  function updateGlobe() {
    g.selectAll("path")
      .attr("d", path);
  }

  function getCountryColor(d: Feature<Geometry, any>): string {
    const countryInfo = countryData.find(c => c.geoJsonId === d.properties.ISO_A3 || c.id === d.properties.ISO_A3);
    if (!countryInfo) return '#E9E5E0';
    const rank = rankedData[countryInfo.id];
    return colorGradient[rank];
  }

  function updateVisualization() {
    if (!g) return;

    g.selectAll<SVGPathElement, Feature<Geometry, any>>("path.country")
      .transition()
      .duration(1000)
      .attr("fill", d => getCountryColor(d));
  }

  function rotateToCountry(d: Feature<Geometry, any>) {
    if (!d.geometry) return;

    const centroid = d3.geoCentroid(d);
    const currentRotation = projection.rotate();

    // Animate rotation to center the selected country
    const interpolator = d3.geoInterpolate(
      [-currentRotation[0], -currentRotation[1]],
      [-centroid[0], -centroid[1]]
    );

    d3.transition()
      .duration(1000)
      .tween("rotate", () => {
        return (t: number) => {
          const r = interpolator(t);
          projection.rotate([-r[0], -r[1]]);
          updateGlobe();
        };
      });
  }

  function darkenOtherCountries(hoveredCountry: Feature<Geometry, any>) {
    g.selectAll<SVGPathElement, Feature<Geometry, any>>("path.country")
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

  afterUpdate(() => {
    updateVisualization();
  });
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
    touch-action: none;
    -ms-touch-action: none;
    display: flex;
    align-items: center;
    cursor: grab;
    justify-content: center;
}

:global(svg) {
    width: 100%;
    height: 100%;
    position: relative;
}

.heading { 
    border-bottom: 1px solid #D6D3CF;
}

.sphere {
    fill-opacity: 1;
}

.graticule {
    opacity: 0.3;
}
</style>