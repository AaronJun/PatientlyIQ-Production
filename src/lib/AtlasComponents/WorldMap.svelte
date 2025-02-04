<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import type { Feature, FeatureCollection, Geometry } from 'geojson';
  import type { Topology, Objects } from 'topojson-specification';
  import * as topojson from 'topojson-client';

  let mapElement: HTMLDivElement;

  onMount(async () => {
    try {
      const width = 1000;
      const height = 1000;

      const svg = d3.select(mapElement)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('border', '1px solid red');

      const projection = d3.geoMercator()
        .scale(140)
        .translate([width / 2, height / 1.4]);

      const path = d3.geoPath().projection(projection);

      console.log('Loading world data...');
      const worldData = await d3.json<Topology<Objects<GeoJSON.GeoJsonProperties>>>('/world-110m.json');
      console.log('World data loaded:', worldData);

      if (!worldData) {
        throw new Error('Failed to load world data');
      }

      const countries = topojson.feature(worldData, worldData.objects.countries) as FeatureCollection<Geometry>;
      console.log('Countries data:', countries);

      svg.selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', 'country');

      console.log('Map rendering complete');
    } catch (error) {
      console.error('Error rendering map:', error);
    }
  });
</script>

<div bind:this={mapElement}></div>

<style>
  :global(.country) {
    fill: #f8f8f8;
    stroke: #161616;
    stroke-width: 0.5px;
  }

  :global(.country:hover) {
    fill: #999999;
  }
</style>