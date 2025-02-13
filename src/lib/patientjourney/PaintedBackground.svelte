<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    export let color: string = "#000000";
    export let height: number = 600;
    export let width: number = 2000;
    export let density: number = 100; // Number of brushstrokes
    export let opacity: number = 0.2; // Base opacity of strokes
    
    let canvas;
    let ctx;
    
    // Modified stroke function from the original oil paint example
    function paintStroke(ctx, x1, y1, x2, y2, thickness, color) {
      const shadow = Math.abs(Math.atan2(x2 - x1, y2 - y1)) / 2 / Math.PI * 4;
      
      // Create brush hairs
      const hairs = d3.range(Math.ceil(thickness ** 2 * 0.1)).map(i => {
        const t = Math.random() * Math.PI * 2;
        const rad = Math.sin(Math.random() * Math.PI * 0.5) * 0.2 + Math.random() * 0.8;
        return {x: Math.cos(t) * rad, y: Math.sin(t) * rad};
      });
      
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = (dx ** 2 + dy ** 2) ** 0.5;
      const segments = Math.ceil(dist * 0.1);
    
      // Draw each hair
      hairs.forEach(h => {
        const colors = [
          {color: `rgba(255,255,255,${Math.random() * opacity})`, width: Math.random(), offset: -shadow},
          {color: `rgba(0,0,0,${Math.random() * opacity})`, width: Math.random(), offset: +shadow},
          {color, width: 2 + Math.random() * 2, offset: 0}
        ];
        
        colors.forEach(c => {
          ctx.beginPath();
          ctx.moveTo(
            x1 + h.x * thickness * 0.5 + c.offset,
            y1 + h.y * thickness * 0.5 + c.offset
          );
          
          for(let i = segments - 1; i >= 0; --i) {
            const noisex = Math.random() * 2 - 1;
            const noisey = Math.random() * 2 - 1;
            ctx.lineWidth = c.width * Math.sin(i / segments * Math.PI) * 2;
            ctx.strokeStyle = c.color;
            ctx.lineTo(
              x1 + dx * i / segments + h.x * thickness * 0.5 + c.offset + noisex,
              y1 + dy * i / segments + h.y * thickness * 0.5 + c.offset + noisey
            );
          }
          ctx.stroke();
          ctx.closePath();
        });
      });
    }
    
    function generateStrokes() {
      ctx.clearRect(0, 0, width, height);
      
      // Create multiple overlapping strokes
      for(let i = 0; i < density; i++) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const angle = Math.random() * Math.PI * 2;
        const length = 100 + Math.random() * 500;
        
        const x2 = x1 + Math.cos(angle) * length;
        const y2 = y1 + Math.sin(angle) * length;
        
        paintStroke(
          ctx,
          x1, y1,
          x2, y2,
          10 + Math.random() * 30,
          `${color}${Math.floor((0.2 + Math.random() * 0.3) * 255).toString(16).padStart(2, '0')}`
        );
      }
    }
    
    onMount(() => {
      ctx = canvas.getContext('2d');
      generateStrokes();
    });
    
    $: if (ctx && color) {
      generateStrokes();
    }
    </script>
    
    <div class="relative w-full h-full overflow-hidden">
      <canvas
        bind:this={canvas}
        {width}
        {height}
        class="absolute inset-0 w-full h-full"
      />
      <div class="relative z-10">
        <slot></slot>
      </div>
    </div>
    
    <style>
    canvas {
      pointer-events: none;
    }
    </style>