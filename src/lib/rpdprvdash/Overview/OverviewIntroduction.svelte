<script lang="ts">
import { ArrowDown, ArrowUpRight } from "carbon-icons-svelte";
import { Button, Separator } from "bits-ui"; 
import { createEventDispatcher, onMount } from 'svelte';
import AnimatedStars from './AnimatedStars.svelte';

const dispatch = createEventDispatcher();

function navigateToSponsorTab() {
    dispatch('navigateToSponsor');
}

let gradientCanvas: HTMLCanvasElement;
let canvasLoaded = false;

// Define types for gradient points
interface GradientColor {
    r: number;
    g: number;
    b: number;
}

interface GradientPoint {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: GradientColor;
}

onMount(() => {
    if (gradientCanvas) {
        setupGradient();
    }
});

function setupGradient() {
    const ctx = gradientCanvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match container
    const resizeCanvas = () => {
        const parentRect = gradientCanvas.parentElement?.getBoundingClientRect();
        if (parentRect) {
            gradientCanvas.width = parentRect.width;
            gradientCanvas.height = parentRect.height;
        }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create gradient points
    const colors: GradientColor[] = [
        { r: 1, g:107, b: 107 },   // Dark slate blue
        { r: 65, g: 78, b: 111 },  // Medium slate blue
        { r: 93, g: 105, b: 100 },   // Very dark blue
        { r: 20, g: 24, b: 5 }    // Deep navy
    ];
    
    const points: GradientPoint[] = [];
    for (let i = 0; i < 6; i++) {
        points.push({
            x: Math.random() * gradientCanvas.width,
            y: Math.random() * gradientCanvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            color: colors[i % colors.length]
        });
    }
    
    // Animation loop
    const animate = () => {
        if (!ctx) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, gradientCanvas.width, gradientCanvas.height);
        
        // Update point positions
        points.forEach(point => {
            point.x += point.vx;
            point.y += point.vy;
            
            // Bounce off edges
            if (point.x <= 0 || point.x >= gradientCanvas.width) point.vx *= -1;
            if (point.y <= 0 || point.y >= gradientCanvas.height) point.vy *= -1;
        });
        
        // Create radial gradients for each point
        points.forEach(point => {
            const gradient = ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, gradientCanvas.width * 0.5
            );
            
            gradient.addColorStop(0, `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, 0.8)`);
            gradient.addColorStop(1, `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);
        });
        
        // Apply an overall darker blue overlay
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7725)';
        ctx.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);
        
        if (!canvasLoaded) {
            canvasLoaded = true;
        }
        
        requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
        window.removeEventListener('resize', resizeCanvas);
    };
}
</script>

<header class="section-slanted-bottom flex flex-row w-full items-center min-h-[25vh] bg-slate-900 relative overflow-hidden">
    <canvas 
        bind:this={gradientCanvas} 
        class="gradient-canvas absolute inset-0 w-full h-full {canvasLoaded ? 'is-loaded' : ''}"
        data-js-darken-top
    ></canvas>
    <div class="absolute w-2/3 inset-0 z-10">
        <AnimatedStars />
    </div>
</header>

<div class="section-slanted-top w-full flex flex-col justify-evenly min-h-[40vh] place-content-end gap-12 md:gap-24 lg:gap-32 px-8 py-8 md:py-16 mb-20">
    <h1 class="text-slate-600 w-full md:w-1/2 lg:w-/5 text-balance text-left font-light text-4xl lg:text-5xl md:justify-end mb-2">
        A Catalyst <span class="italic font-serif">for</span> 
        Rare Pediatric Disease Research</h1>

        <div class="flex-container justify-end w-full md:w-2/3 lg:w-3/5 max-w-prose"> 
        <p class="text-slate-800 text-left font-base text-sm md:text-base">  
        Like the Big Bang, <span class="highlight font-extrabold text-[#ff4a4a]">the RPD Priority Review Voucher Program (RPD PRV)</span> introduced new energy into a space that previously had fewer incentives for investment, catalyzing the development of rare pediatric disease treatments across more than 60 indications.<br> <br> 
        This dashboard provides insights into how PRVs have been awarded, used, and traded—helping researchers, policymakers, and industry leaders assess their impact within the evolving rare disease ecosystem.</p>  

<div class="flex flex-row align-baseline gap-4 mt-8">   
    <Button.Root class="rounded-input flex-row gap-2 border-1 border-slate-800 text-slate-800 text-left text-sm shadow-mini hover:bg-slate-200 inline-flex w-full px-4 py-2 h-12 place-items-center justify-between font-semibold active:scale-[0.98] active:transition-all" on:click={navigateToSponsorTab}>
        Explore the Data <ArrowUpRight class="p-1 ring-1 ring-slate-800 w-6 h-6 font-light rounded-full" />   
    </Button.Root>
<!-- 
    <Button.Root class="secondary-button rounded-full bg-slate-50 shadow-md text-slate-800 font-medium px-4 py-2 text-sm border-1 border-slate-800 hover:bg-slate-800 hover:text-slate-50 on:click={navigateToLearnMore}">
            Learn More
    </Button.Root> -->
</div>
</div>
</div>

<Separator.Root
class="bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px]"
/>
<style>
.section-slanted-bottom {
    position: relative;
    padding-bottom: calc(72px + 3rem);
    clip-path: polygon(0 0px, 100% 0, 100% calc(100% - 192px), 0 100%);
    z-index: 5;
}

  /* Slanted section styles */
  .section-slanted-top {
    position: relative;
    margin-top: -90px;
    padding-top: calc(90px + 3rem);
    clip-path: polygon(0 72px, 100% 0, 100% 100%, 0 100%);
    z-index: 5;
  }
  
  /* New slanted both top and bottom style */
  .section-slanted-both {
    position: relative;
    margin-top: -72px;
    padding-top: calc(190px + 3rem);
    padding-bottom: calc(192px + 3rem);
    clip-path: polygon(0 72px, 100% 0, 100% calc(100% - 72px), 0 100%);
    z-index: 5;
  }

.gradient-canvas {
    display: block;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    opacity: 0;
    transition: opacity 1.8s ease-in 50ms;
}

.gradient-canvas.is-loaded {
    opacity: 1;
}
</style>