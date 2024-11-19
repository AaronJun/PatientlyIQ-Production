<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let data: Array<any> = [];
    export let width: number = 400;
    export let height: number = 400;
    export let innerRadius: number = 50;
    export let outerRadius: number = 150;

    let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

    const petalPath = "M13.3333 4.48427L14.6381 3.36101L15.9429 4.48427C22.1156 9.79807 26.5412 17.7478 27.193 24.5897C27.5211 28.0344 26.9071 31.4391 24.7667 34.0096C22.5937 36.6191 19.158 38 14.6381 38C10.1182 38 6.68246 36.6191 4.50952 34.0096C2.36907 31.4391 1.7551 28.0344 2.08325 24.5897C2.73503 17.7478 7.16057 9.79807 13.3333 4.48427Z";

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    onMount(() => {
        svg = d3.select('#radial-layout')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        updateLayout();
    });

    function updateLayout() {
        if (!svg) return;

        const pie = d3.pie()
            .value(() => 1)
            .padAngle(0.02);

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        const petals = svg.selectAll('.petal')
            .data(pie(data))
            .join('g')
            .attr('class', 'petal')
            .attr('transform', d => `translate(${arc.centroid(d)})`);

        petals.append('path')
            .attr('d', petalPath)
            .attr('fill', (d, i) => colorScale(i.toString()))
            .attr('stroke', '#F4F4F4')
            .attr('stroke-width', 2)
            .attr('transform', 'scale(0.5)'); // Adjust scale as needed

        // Add center circle
        svg.append('circle')
            .attr('r', innerRadius)
            .attr('fill', '#F0CE98')
            .attr('stroke', 'white')
            .attr('stroke-width', 2);
    }

    $: {
        if (svg) {
            svg.selectAll('*').remove();
            updateLayout();
        }
    }
</script>

<svg id="radial-layout"></svg>

<style>
    svg {
        display: block;
        margin: auto;
    }
</style>