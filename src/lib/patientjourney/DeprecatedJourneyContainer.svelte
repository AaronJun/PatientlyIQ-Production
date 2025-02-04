<!-- JourneyContainer.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import AnimatedJourneyMap from './DeprecatedAnimatedJourneyMap.svelte';
    
    export let data = [];
    let currentId = null;
    let containerRef;
    let mapRef;
    
    onMount(() => {
        const sections = data.map(stage => {
            const section = document.createElement('div');
            section.className = 'journey-section min-h-[30vh] flex items-center';
            section.id = `stage-${stage.id}`;
            section.innerHTML = `<div class="opacity-0">${stage.Stage}</div>`;
            containerRef.appendChild(section);
            return section;
        });

        // Add observer for end section
        const endObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const mapContainer = document.querySelector('.journey-map-container');
                if (entry.isIntersecting) {
                    mapContainer?.classList.remove('fixed');
                    mapContainer?.classList.add('absolute', 'bottom-0');
                } else {
                    mapContainer?.classList.remove('absolute', 'bottom-0');
                    mapContainer?.classList.add('fixed');
                }
            });
        }, {
            threshold: 0
        });

        const endSection = document.querySelector('.bg-slate-600');
        if (endSection) {
            endObserver.observe(endSection);
        }

        // Observer for stages
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    currentId = parseInt(entry.target.id.split('-')[1]);
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '10% 10px -20% 50px'
        });

        sections.forEach(section => observer.observe(section));
        return () => observer.disconnect();
    });
</script>

<div class="relative h-full">
    <!-- Fixed height container for journey map -->
    <div class="journey-map-container fixed top-24 left-1/2 w-full lg:w-1/2 h-[700px] overflow-hidden pointer-events-none">
        <div bind:this={mapRef} class="journey-map-content">
            <AnimatedJourneyMap {data} currentStageId={currentId} />
        </div>
    </div>

    <!-- Scrollable content container -->
    <div bind:this={containerRef} class="relative z-10">
    </div>
</div>

<style>
    .journey-map-content {
        height: 700px;
    }

    .journey-section {
        opacity: 0.01;
        min-height: 600px;
    }
</style>