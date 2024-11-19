<script lang="ts">
    export let year: string;
    export let imageUrl: string;
    export let xScale: (year: number) => number;
    export let innerHeight: number;
  
    $: x = xScale(+year);
  </script>
  
  <image
    x={x}
    y="0"
    width="500"
    height={innerHeight}
    href={imageUrl}
    preserveAspectRatio="xMidYMid slice"
    opacity="0.3"
  />