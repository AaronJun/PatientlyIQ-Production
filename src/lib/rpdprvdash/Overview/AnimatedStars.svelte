<script lang="ts">
  import { onMount } from 'svelte';
  import starSvg from '../../../assets/star.svg';
  
  interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    animationDuration: number;
    delay: number;
    rotation: number;
  }
  
  let stars: Star[] = [];
  let containerWidth = 0;
  let containerHeight = 0;
  
  function createStar(): Star {
    return {
      x: Math.random() * containerWidth,
      y: Math.random() * containerHeight,
      size: Math.random() * 20 + 20, // Random size between 20 and 80
      opacity: Math.random(), // Random initial opacity
      animationDuration: Math.random() * 8 + 2, // Random duration between 4-12 seconds
      delay: Math.random() * 3, // Random delay between 0-3 seconds
      rotation: Math.random() * 360 // Random initial rotation
    };
  }
  
  function initializeStars() {
    const numStars = 22; // Number of stars to create
    stars = Array.from({ length: numStars }, createStar);
  }
  
  onMount(() => {
    // Get container dimensions
    const container = document.querySelector('.stars-container');
    if (container) {
      containerWidth = container.clientWidth;
      containerHeight = container.clientHeight;
    }
    
    initializeStars();
  });
</script>

<div class="stars-container absolute inset-0 overflow-hidden">
  {#each stars as star, i}
    <div
      class="star mix-blend-screen absolute transition-all duration-500 hover:scale-110 hover:opacity-100"
      style="
        left: {star.x}px;
        top: {star.y}px;
        width: {star.size}px;
        height: {star.size}px;
        animation: float {star.animationDuration}s infinite ease-in-out;
        animation-delay: {star.delay}s;
        opacity: {star.opacity};
        transform: translate(-50%, -50%) rotate({star.rotation}deg);
      "
    >
      <img 
        src={starSvg} 
        alt="star" 
        class="w-full h-full"
        style="filter: brightness(2) saturate(1.5) contrast(.2);"
      />
    </div>
  {/each}
</div>

<style>
  .star {
    will-change: transform, opacity;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1) rotate(0deg);
      opacity: 0.1;
    }
    25% {
      transform: translate(-50%, -50%) scale(1.05) rotate(5deg);
      opacity: 0.2;
}
    50% {
      transform: translate(-50%, -50%) scale(1) rotate(0deg);
      opacity: 0.4;
    }
    75% {
      transform: translate(-50%, -50%) scale(0.95) rotate(-5deg);
      opacity: 0;
    }
  }
</style> 