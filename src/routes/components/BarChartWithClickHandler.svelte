<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';

  interface Driver {
    name: string;
    count: number;
  }

  interface Sentiment {
    name: string;
    drivers: Driver[];
  }

  interface BarData {
    data: Sentiment;
    [key: number]: number;
  }

  let data: {sentiments: Sentiment[] };
  let width: number;
  let height: number;

  export { data, width, height };

  const dispatch = createEventDispatcher();

  const margin = { top: 40, right: 20, bottom: 60, left: 60 };
  const colors: { [key: string]: string } = {
    "Finances": "#6929c4",
    "Emotional": "#1192e8",
    "Treatment Options": "#005d5d",
    "QoL Concern": "#9f1853",
    "Clinical Trial": "#570408"
  };

  let svg: SVGSVGElement;
  let chart: d3.Selection<SVGGElement, unknown, null, undefined>;
  let x: d3.ScaleBand<string>;
  let y: d3.ScaleLinear<number, number>;
  let series: d3.Series<Sentiment, string>[];

  onMount(() => {
    initChart();
    updateChart(data.sentiments);
  });

function initChart() {
  chart = d3.select(svg)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  x = d3.scaleBand()
    .range([0, width - margin.left - margin.right])
    .padding(0.1);

  y = d3.scaleLinear()
    .range([height - margin.top - margin.bottom, 0]);

  chart.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height - margin.top - margin.bottom})`);

  chart.append('g')
    .attr('class', 'y-axis');

  chart.append('text')
    .attr('class', 'chart-title')
    .attr('x', (width - margin.left - margin.right) / 2)
    .attr('y', -margin.top / 2)
    .attr('text-anchor', 'middle')
    .text('Sentiment Distribution by Driver');
}

function updateChart(sentiments: Sentiment[]) {
  const stack = d3.stack<Sentiment>()
    .keys(Object.keys(colors))
    .value((d, key) => d.drivers.find(driver => driver.name === key)?.count || 0);

  series = stack(sentiments);

  x.domain(sentiments.map(d => d.name));
  y.domain([0, d3.max(series, d => d3.max(d, d => d[1])) || 0]);

  chart.select<SVGGElement>('.x-axis')
    .call(d3.axisBottom(x) as any)
    .selectAll('text')
    .style('font-family', 'var(--cds-charts-font-family-condensed)')
    .style('font-size', '12px')
    .style('fill', 'var(--cds-text-secondary)')
    .attr('transform', 'rotate(-45)')
    .attr('text-anchor', 'end');

  chart.select<SVGGElement>('.y-axis')
    .call(d3.axisLeft(y).ticks(5) as any)
    .selectAll('text')
    .style('font-family', 'var(--cds-charts-font-family-condensed)')
    .style('font-size', '12px')
    .style('fill', 'var(--cds-text-secondary)');

  const groups = chart.selectAll<SVGGElement, d3.Series<Sentiment, string>>('.serie')
    .data(series)
    .join('g')
    .attr('class', 'serie')
    .attr('fill', d => colors[d.key]);

  groups.selectAll<SVGRectElement, BarData>('rect')
    .data(d => d)
    .join('rect')
    .attr('x', d => x(d.data.name) || 0)
    .attr('y', d => y(d[1]))
    .attr('height', d => y(d[0]) - y(d[1]))
    .attr('width', x.bandwidth())
    .on('click', (event: MouseEvent, d: BarData) => handleBarClick(event, d));

  const legend = chart.selectAll('.legend')
    .data(Object.entries(colors))
    .enter().append('g')
    .attr('class', 'legend')
    .attr('transform', (d, i) => `translate(0,${i * 20})`);

  legend.append('rect')
    .attr('x', width - margin.right - 18)
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', d => d[1]);

  legend.append('text')
    .attr('x', width - margin.right - 24)
    .attr('y', 9)
    .attr('dy', '.35em')
    .style('text-anchor', 'end')
    .style('font-family', 'var(--cds-charts-font-family-condensed)')
    .style('font-size', '12px')
    .style('fill', 'var(--cds-text-secondary)')
    .text(d => d[0]);
}

function handleBarClick(event: MouseEvent, d: BarData) {
  const sentiment = d.data.name;
  const driver = Object.keys(colors).find(key => 
    d[0] === series.find(s => s.key === key)?.[sentiment as any][0]
  );
  const value = d[1] - d[0];
  
  dispatch('barclick', { 
    data: { 
      sentiment: sentiment,
      driver: driver,
      value: value
    }, 
    color: driver ? colors[driver] : undefined
  });
}

export function zoomToBar(sentiment: string) {
  const barWidth = x.bandwidth();
  const barX = x(sentiment) || 0;
  const barY = y(d3.max(series, d => d.find(item => item.data.name === sentiment)?.[1]) || 0);
  const barHeight = height - margin.top - margin.bottom - barY;
  const scale = Math.min(
    (width - margin.left - margin.right) / barWidth,
    (height - margin.top - margin.bottom) / barHeight
  ) * 0.9;
  const translateX = -(barX + barWidth / 2) * scale + (width - margin.left - margin.right) / 2;
  const translateY = -(barY + barHeight / 2) * scale + (height - margin.top - margin.bottom) / 2;

  chart.transition()
    .duration(750)
    .attr('transform', `translate(${margin.left + translateX},${margin.top + translateY}) scale(${scale})`);
}

export function resetZoom() {
  chart.transition()
    .duration(750)
    .attr('transform', `translate(${margin.left},${margin.top}) scale(1)`);
}
</script>

<div class="chart-container">
  <svg bind:this={svg} {width} {height}></svg>
</div>

<style>
.chart-container {
  font-family: var(--cds-charts-font-family);
  background-color: var(--cds-background);
}

:global(.serie rect) {
  transition: opacity 0.3s ease;
}

:global(.serie rect:hover) {
  opacity: 0.8;
}

:global(.x-axis path),
:global(.y-axis path) {
  stroke: var(--cds-border-subtle);
}

:global(.x-axis line),
:global(.y-axis line) {
  stroke: var(--cds-border-subtle);
}

:global(.chart-title) {
  font-family: var(--cds-charts-font-family);
  font-size: 16px;
  font-weight: 600;
  fill: var(--cds-text-primary);
}
</style>