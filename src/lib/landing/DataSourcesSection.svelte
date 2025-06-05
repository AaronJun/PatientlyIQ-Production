<script lang="ts">
    import { cn } from "$lib/utils";
    import { inview } from 'svelte-inview';
    import type { ObserverEventDetails } from 'svelte-inview';
    import { onMount } from 'svelte';
    import { writable, derived } from 'svelte/store';

    // Animation state
    let containerRef: HTMLElement;
    let sectionRef: HTMLElement;
    let inView = false;
    let currentStep = writable(0);
    let scrollY = writable(0);
    let stepElements: HTMLElement[] = [];
    let progress = writable(0);

    // Step data
    const steps = [
        {
            number: 1,
            title: "Lived Experiences of Patients and Caregivers",
            description: "PatientlyIQ gathers data from social media, forums, and direct patient feedback channels",
        },
        {
            number: 2,
            title: "Data is streamed to our secure cloud database",
            description: "Data travels through secure channels with enterprise-grade privacy protection",
        },
        {
            number: 3,
            title: "AI processes data through our proprietary models",
            description: "Our custom algorithms analyze patterns, sentiments, and patient journeys",
        },
        {
            number: 4,
            title: "Insights delivered to healthcare providers",
            description: "Actionable insights are delivered through our platform's intuitive interface",
        }
    ];

    const handleInView = ({ detail }: CustomEvent<ObserverEventDetails>) => {
        inView = detail.inView;
    };

    onMount(() => {
        // Watch for scroll to update current step and progress
        const handleScroll = () => {
            scrollY.set(window.scrollY);
            
            if (sectionRef) {
                // Calculate scroll progress through the sticky section
                const sectionTop = sectionRef.offsetTop;
                // Calculate total scrollable distance (section height minus viewport height)
                const scrollableDistance = sectionRef.offsetHeight - window.innerHeight;
                // How far we've scrolled into the section
                const scrolled = window.scrollY - sectionTop;
                
                // Calculate progress (0 to 1)
                const newProgress = Math.max(0, Math.min(1, scrolled / scrollableDistance));
                progress.set(newProgress);
                
                // Calculate current step based on progress
                const stepIndex = Math.floor(newProgress * steps.length);
                currentStep.set(Math.min(steps.length - 1, Math.max(0, stepIndex)));
            }
        };
        
        window.addEventListener('scroll', handleScroll);

        // Clean up
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    });
</script>

<section 
    id="data-sources" 
    bind:this={sectionRef}
    class="relative mx-auto bg-slate-100 text-slate-800"
>
    <!-- Create a tall section for scrolling - 400vh = 4 viewport heights -->
    <div class="h-[400vh] relative">
        <!-- Sticky container that will remain fixed while scrolling through the section -->
        <div class="sticky top-0 w-full h-screen flex flex-col justify-center overflow-hidden py-12 px-4">
            <div class="max-w-6xl mx-auto h-full flex flex-col">
                <!-- Header Content -->
                <div class="mb-8 text-left">
                    <div class="section-divide mb-4 flex items-left gap-2">
                        <span class="font-mono text-xs text-[#ff1515]">02</span>
                        <span class="font-mono text-xs text-gray-500">How PatientlyIQ Works</span>
                    </div>
                    
                    <h2 class="text-balance text-5xl font-light mb-6">
                        <span class="text-[#ff1515]">How</span> it works
                    </h2>
                    
                    <p class="max-w-[775px] text-gray-400 text-lg">
                        PatientlyIQ consolidates data from multiple channels, categorizes and correlates the information into actionable insights.
                    </p>
                </div>

                <!-- Main Content -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 relative flex-grow">
                    <!-- Left column - Steps sequence -->
                    <div class="lg:col-span-6 h-full flex flex-col justify-center">
                        <div class="relative">
                            <!-- Vertical line -->
                            <div class="absolute left-[22px] top-0 bottom-0 w-[1px] bg-gray-800"></div>
                            
                            {#each steps as step, i}
                                <div 
                                    class="flex mb-16 relative z-10" 
                                    bind:this={stepElements[i]}
                                >
                                    <!-- Circle with number -->
                                    <div class="relative flex-shrink-0 mr-6">
                                        <div class={cn(
                                            "flex items-center justify-center h-11 w-11 rounded-full bg-slate-100 border-2 transition-colors duration-500",
                                            $currentStep === i 
                                                ? "border-[#ff1515] text-[#ff1515]" 
                                                : "border-gray-700 text-gray-500"
                                        )}>
                                            <span class="font-mono text-lg">{step.number}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="space-y-2">
                                        <h3 class={cn(
                                            "text-xl font-medium transition-colors duration-500",
                                            $currentStep === i ? "text-[#ff1515]" : "text-gray-500"
                                        )}>
                                            {step.title}
                                        </h3>
                                        <p class={cn(
                                            "text-sm transition-colors duration-500",
                                            $currentStep === i ? "text-gray-900" : "text-gray-600"
                                        )}>
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            {/each}

                            <!-- Progress indicator -->
                            <div class="relative w-full mt-10">
                                <div class="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                        class="h-full bg-[#ff1515] transition-all duration-200 ease-out"
                                        style="width: {$progress * 100}%;"
                                    ></div>
                                </div>
                                <div class="mt-2 flex justify-between text-xs text-gray-500">
                                    <span>Start</span>
                                    <span>Progress</span>
                                    <span>Complete</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right column - Isometric panels -->
                    <div 
                        class="lg:col-span-6 h-full flex items-center"
                        use:inview={{ unobserveOnEnter: false, rootMargin: '-100px' }}
                        on:inview_change={handleInView}
                    >
                        <div 
                            bind:this={containerRef}
                            class="w-full h-[70vh]"
                        >
                            <!-- Implement simpler isometric panels directly -->
                            <div class="w-full h-full relative" style="perspective: 1000px;">
                                <div class="w-full h-full relative" style="transform-style: preserve-3d;">
                                    <!-- Panel 1: Data Collection -->
                                    <div 
                                        class="absolute w-full h-full border border-gray-800 rounded-lg overflow-hidden bg-gray-900"
                                        style="transform: translateZ({-40 + $currentStep * 20 * 0.4}px) rotateX(10deg) rotateY(-20deg); opacity: {$currentStep === 0 ? 1 : 0.7}; backface-visibility: hidden; transition: transform 0.8s cubic-bezier(0.075, 0.82, 0.165, 1), opacity 0.5s ease; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);"
                                    >
                                        <div class="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900 grid place-items-center">
                                            <div class="text-center space-y-4">
                                                <div class="mx-auto text-[#ff1515] w-8 h-8 grid place-items-center">1</div>
                                                <div class="text-xs uppercase tracking-wider text-gray-400">
                                                    Data Collection
                                                </div>
                                            </div>
                                        </div>
                                        <div class="absolute bottom-0 right-0 w-32 h-12 bg-gray-800/80 rounded-tl-lg grid place-items-center">
                                            <div class="text-xs text-[#ff1515]">DATA SOURCES</div>
                                        </div>
                                    </div>

                                    <!-- Panel 2: Database -->
                                    <div 
                                        class="absolute w-full h-full border border-gray-800 rounded-lg overflow-hidden bg-gray-900"
                                        style="transform: translateZ({40 + $currentStep * 20 * 0.8}px) rotateX(10deg) rotateY(-20deg); opacity: {$currentStep === 1 ? 1 : 0.7}; backface-visibility: hidden; transition: transform 0.8s cubic-bezier(0.075, 0.82, 0.165, 1), opacity 0.5s ease; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);"
                                    >
                                        <div class="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900 grid place-items-center">
                                            <div class="text-center space-y-4">
                                                <div class="mx-auto text-[#ff1515] w-8 h-8 grid place-items-center">2</div>
                                                <div class="text-xs uppercase tracking-wider text-gray-400">
                                                    Secure Database
                                                </div>
                                            </div>
                                        </div>
                                        <div class="absolute bottom-0 right-0 w-32 h-12 bg-gray-800/80 rounded-tl-lg grid place-items-center">
                                            <div class="text-xs text-[#ff1515]">PATIENT DATA</div>
                                        </div>
                                    </div>

                                    <!-- Panel 3: AI Processing -->
                                    <div 
                                        class="absolute w-full h-full border border-gray-800 rounded-lg overflow-hidden bg-gray-900"
                                        style="transform: translateZ({0 + $currentStep * 20 * 0.6}px) rotateX(10deg) rotateY(-20deg); opacity: {$currentStep === 2 ? 1 : 0.7}; backface-visibility: hidden; transition: transform 0.8s cubic-bezier(0.075, 0.82, 0.165, 1), opacity 0.5s ease; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);"
                                    >
                                        <div class="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900 grid place-items-center">
                                            <div class="text-center space-y-4">
                                                <div class="mx-auto text-[#ff1515] w-8 h-8 grid place-items-center">3</div>
                                                <div class="text-xs uppercase tracking-wider text-gray-400">
                                                    AI Processing
                                                </div>
                                            </div>
                                        </div>
                                        <div class="absolute bottom-0 right-0 w-32 h-12 bg-gray-800/80 rounded-tl-lg grid place-items-center">
                                            <div class="text-xs text-[#ff1515]">AGENT BACKEND</div>
                                        </div>
                                    </div>

                                    <!-- Panel 4: Output -->
                                    <div 
                                        class="absolute w-full h-full border border-gray-800 rounded-lg overflow-hidden bg-gray-900"
                                        style="transform: translateZ({80 + $currentStep * 20 * 1.0}px) rotateX(10deg) rotateY(-20deg); opacity: {$currentStep === 3 ? 1 : 0.7}; backface-visibility: hidden; transition: transform 0.8s cubic-bezier(0.075, 0.82, 0.165, 1), opacity 0.5s ease; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);"
                                    >
                                        <div class="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900 grid place-items-center">
                                            <div class="text-center space-y-4">
                                                <div class="mx-auto text-[#ff1515] w-8 h-8 grid place-items-center">4</div>
                                                <div class="text-xs uppercase tracking-wider text-gray-400">
                                                    User Interface
                                                </div>
                                            </div>
                                        </div>
                                        <div class="absolute bottom-0 right-0 w-32 h-12 bg-gray-800/80 rounded-tl-lg grid place-items-center">
                                            <div class="text-xs text-[#ff1515]">CLOUD AGENT</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Current step details card -->
                            {#if $currentStep >= 0 && $currentStep < steps.length}
                                <div class="mt-8 animate-fade-in opacity-0 [--animation-delay:200ms]">
                                    <div class="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 overflow-hidden relative">
                                        <div class="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-[#ff1515]/20 to-transparent opacity-60"></div>
                                        <div class="flex items-start gap-4">
                                            <div class="p-3 rounded-lg bg-gray-800/50 text-[#ff1515]">
                                                <div class="w-6 h-6 grid place-items-center font-bold">{steps[$currentStep].number}</div>
                                            </div>
                                            <div class="flex-1">
                                                <h3 class="text-xl font-medium text-[#ff1515] mb-2">{steps[$currentStep].title}</h3>
                                                <p class="text-gray-400">{steps[$currentStep].description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<style>
    .section-divide {
        border-top: .25px solid #ff1515;
        padding-top: .525rem;
    }
    
    @keyframes fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .animate-fade-in {
        animation: fade-in 0.5s ease-out forwards;
        animation-delay: var(--animation-delay, 0ms);
    }
</style>