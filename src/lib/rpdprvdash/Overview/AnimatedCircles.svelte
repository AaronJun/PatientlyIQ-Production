<script lang="ts">
  import { onMount } from 'svelte';
  
  interface Circle {
    x: number;
    y: number;
    size: number;
    opacity: number;
    animationDuration: number;
    delay: number;
    color: string;
  }
  
  let circles: Circle[] = [];
  let containerWidth = 0;
  let containerHeight = 0;
  
  const colors = [
    'bg-slate-800/20',
    'bg-slate-700/15',
    'bg-slate-600/10',
    'bg-slate-500/15',
    'bg-slate-400/10'
  ];
  
  function createCircle(): Circle {
    return {
      x: Math.random() * containerWidth,
      y: Math.random() * containerHeight,
      size: Math.random() * 120 + 30, // Random size between 30 and 150
      opacity: Math.random(), // Random initial opacity
      animationDuration: Math.random() * 8 + 4, // Random duration between 4-12 seconds
      delay: Math.random() * 3, // Random delay between 0-3 seconds
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  }
  
  function initializeCircles() {
    const numCircles = 20; // Increased number of circles
    circles = Array.from({ length: numCircles }, createCircle);
  }
  
  onMount(() => {
    // Get container dimensions
    const container = document.querySelector('.circles-container');
    if (container) {
      containerWidth = container.clientWidth;
      containerHeight = container.clientHeight;
    }
    
    initializeCircles();
  });
</script>

<div class="circles-container absolute inset-0 overflow-hidden">
  {#each circles as circle, i}
    <div
      class="circle absolute rounded-full transition-all duration-500 hover:scale-110 hover:opacity-100 {circle.color}"
      style="
        left: {circle.x}px;
        top: {circle.y}px;
        width: {circle.size}px;
        height: {circle.size}px;
        animation: float {circle.animationDuration}s infinite ease-in-out;
        animation-delay: {circle.delay}s;
      "
    />
  {/each}
</div>

<style>
  .circle {
    transform: translate(-50%, -50%);
    will-change: transform, opacity;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.1;
    }
    25% {
      transform: translate(-50%, -50%) scale(1.05);
      opacity: 0.2;
    }
    50% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.4;
    }
    75% {
      transform: translate(-50%, -50%) scale(0.95);
      opacity: 0.2;
    }
  }
</style> 