<script lang="ts">  
    import { Separator } from 'bits-ui';
    import AnimatedStars from '../Overview/AnimatedStars.svelte';
    import { ArrowDown } from 'carbon-icons-svelte';
    import { onMount } from 'svelte';
onMount(() => {
    if (gradientCanvas) {
        setupGradient();
    }
});

let gradientCanvas: HTMLCanvasElement;
let canvasLoaded = false;


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

<header class="section-slanted-bottom flex flex-row w-full items-center min-h-[24.25vh] bg-slate-100 relative overflow-hidden shadow-xl">
    <canvas 
        bind:this={gradientCanvas}
        class="gradient-canvas absolute inset-0 w-full h-full {canvasLoaded ? 'is-loaded' : ''}"
        data-js-darken-top
    ></canvas>
    <div class="absolute mx-8 pr-32 bg-gradient-to-bl fade-in inset-0 z-10">
        <AnimatedStars />
    </div>
    
</header>

<!-- 
<div class="section-intro bg-slate-800 flex flex-col w-full place-content-center place-items-center px-8 gap-6 md:gap-32 lg:gap-48 min-h-96 md:min-h-[32.25vh]">
    <div class="flex flex-col md:flex-row justify-center"> 
            <div class="flex flex-col md:flex-row gap-4 md:gap-32">
            <h1 class="text-slate-300 w-full lg:w-3/5 text-balance font-light text-3xl lg:text-4xl">
                How Vouchers Fuel Research
            </h1>
        <p class="text-slate-100 text-left font-base text-sm text-balance max-w-prose lg:text-base">  
            Explore the transaction history, value trends, and market activity of Priority Review Vouchers.
                This view focuses on the monetary aspects and market dynamics of the PRV program.
            </p>
            </div>
    </div>
    
    <div class="bg-slate-500 rounded-full w-12 h-12 place-items-center place-content-center justify-self-center">
        <ArrowDown class="w-8 h-8 text-slate-100" />
    </div>
</div>   -->

<style>
    .section-slanted-bottom {
    position: relative;
    padding-bottom: calc(72px + 3rem);
    margin-top: -72px;
    clip-path: polygon(0 72px, 100% 0, 100% calc(100% - 20vh), 0 100%);
    z-index: 5;
  }
  
</style>