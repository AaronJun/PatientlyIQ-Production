<script lang="ts">
    import { inview } from 'svelte-inview';
    import type { ObserverEventDetails } from 'svelte-inview';
    
    // Import Carbon pictograms/icons
    import Journey from "carbon-pictograms-svelte/lib/MovementInOverlappingNetworks.svelte";
    import WindowsHosting from "carbon-pictograms-svelte/lib/WindowsHosting.svelte";
    import GlobalAnalytics from "carbon-pictograms-svelte/lib/GlobalAnalytics.svelte";
    import CustomReports from "carbon-pictograms-svelte/lib/CustomReports.svelte";
    import CompetitiveStrategy from "carbon-pictograms-svelte/lib/GlobalNetwork.svelte";

    let inView = false;
    let activeCapability = 'journey-mapping';
    let openAccordion = 0;

    const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
        inView = detail.inView;
    };

    const capabilities = {
        'journey-mapping': {
            title: "Patient Journey Maps",
            icon: Journey,
            description: "Transform complex patient experiences into clear, actionable visualizations",
            details: [
                "End-to-end journey visualization",
                "Touchpoint analysis",
                "Pain point identification",
                "Decision pathway mapping",
                "Treatment milestone tracking"
            ],
            stats: "85% clearer understanding",
            impact: "2.4x faster insights",
            longDescription: "Our AI-powered journey mapping combines real patient data with advanced analytics to create comprehensive visualizations of the patient experience. From initial symptoms through ongoing care, we identify critical touchpoints and opportunities for intervention."
        },
        'social-listening': {
            title: "Social Listening",
            icon: WindowsHosting,
            description: "Monitor and analyze patient conversations across digital channels",
            details: [
                "Real-time sentiment analysis",
                "Topic trend detection",
                "Community engagement tracking",
                "Unmet needs identification",
                "Voice of patient capture"
            ],
            stats: "93% sentiment accuracy",
            impact: "3.7x more patient insights",
            longDescription: "Advanced natural language processing monitors social media, forums, and online communities to capture authentic patient voices and experiences. Our AI identifies emerging trends, concerns, and unmet needs in real-time."
        },
        'competitive-analysis': {
            title: "Competitive Landscape",
            icon: CompetitiveStrategy,
            description: "Comprehensive analysis of market dynamics and competitor activities",
            details: [
                "Market positioning analysis",
                "Treatment pattern tracking",
                "Share of voice measurement",
                "Competitive messaging analysis",
                "Strategic opportunity mapping"
            ],
            stats: "76% market coverage",
            impact: "2.9x strategic advantage",
            longDescription: "Gain deep insights into market dynamics with our comprehensive competitive analysis tools. Track competitor activities, analyze treatment patterns, and identify strategic opportunities across the therapeutic landscape."
        },
        'global-experience': {
            title: "Global Patient Experience",
            icon: GlobalAnalytics,
            description: "Cross-cultural analysis of patient experiences and needs",
            details: [
                "Multi-region data analysis",
                "Cultural context mapping",
                "Healthcare system comparison",
                "Regional burden analysis",
                "Global trend identification"
            ],
            stats: "Coverage in 45+ countries",
            impact: "3.2x broader insights",
            longDescription: "Understanding patient experiences across different healthcare systems and cultures is crucial. Our platform analyzes global patterns while accounting for regional nuances and healthcare system variations."
        },
        'custom-research': {
            title: "Custom Research",
            icon: CustomReports,
            description: "Tailored research solutions for specific insight needs",
            details: [
                "Bespoke study design",
                "Mixed-method approaches",
                "Rapid insight generation",
                "Expert panel integration",
            "Custom analytics dashboards"
            ],
            stats: "92% client satisfaction",
            impact: "4.1x faster delivery",
            longDescription: "When standard approaches aren't enough, our custom research solutions deliver targeted insights. From study design to analysis, we create bespoke research programs that answer your specific questions."
        }
    };

    const updateCapability = (capability: string) => {
        activeCapability = capability;
        openAccordion = 0;
    };
</script>


<section class="relative mx-auto mt-2 max-w-7xl px-2 md:px-2">
    <div class="text-left mb-16">
        <section class="relative mx-auto mt-32 max-w-7xl px-6 md:px-8">
            <div class="text-left mb-16">
                <div class="mb-4 flex items-left gap-2">
                    <span class="font-mono text-xs text-gray-500">04</span>
                    <span class="font-mono text-xs text-gray-500">Analysis Capabilities</span>
                </div>
            </div>
        </section>
    </div>

    <section id="analysis" class="relative mx-auto mt-32 max-w-7xl px-6 md:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 pb-24"
            use:inview={{ unobserveOnEnter: true, rootMargin: '-100px' }}
            on:inview_change={handleChange}
        >
            <h2 class="animate-fade-in text-balance bg-gradient-to-br from-gray-800 from-30% to-gray-500 bg-clip-text mr-2 sm:mr-0 text-5xl font-normal [--animation-delay:200ms] dark:from-white/60 dark:to-white">
                See what others <span class="font-serif pr-2 italic text-[#ff5151]">miss</span>
            </h2>

            <p class="-translate-y-4 animate-fade-in text-balance tracking-normal max-w-[625px] text-gray-600 opacity-0 [--animation-delay:400ms] dark:text-gray-400 md:text-base sm:text-sm">
                Turn complex patient data into actionable insights with our comprehensive suite of analysis tools. From journey mapping to global trends, uncover the insights that drive better patient outcomes.
            </p>
        </div>

        <!-- Analysis Capabilities Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-12">
            {#each Object.entries(capabilities) as [key, capability]}
                <button
                    class="p-0 rounded-lg text-sm font-medium flex flex-col items-center justify-center aspect-square transition-all duration-200 {activeCapability === key ? 'bg-[#ff5151] text-white shadow-lg scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-[1.02] dark:bg-gray-800 dark:text-gray-300'}"
                    on:click={() => updateCapability(key)}
                >
                    <svelte:component 
                        this={capability.icon}
                        class="w-12 h-12 mb-4"
                        fill={activeCapability === key ? 'white' : 'currentColor'}
                    />
                    <span class="text-center font-medium text-xs">{capability.title}</span>
                </button>
            {/each}
        </div>

        <!-- Active Capability Content -->
        <div class="mt-8 animate-fade-in [--animation-delay:200ms]">
            {#if capabilities[activeCapability]}
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <!-- Left Column -->
                    <div class="space-y-6">
                        <h3 class="text-2xl font-base text-gray-900 dark:text-[#cd4444]">
                            {capabilities[activeCapability].title}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-200 text-base leading-relaxed">
                            {capabilities[activeCapability].longDescription}
                        </p>
                        <div class="flex gap-8 mt-8">
                            <div class="space-y-2">
                                <p class="text-lg font-bold text-gray-900 dark:text-white">
                                    {capabilities[activeCapability].stats}
                                </p>
                            </div>
                            <div class="space-y-2">
                                <p class="text-lg font-bold text-gray-900 dark:text-white">
                                    {capabilities[activeCapability].impact}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column -->
                    <div class= "p-8">
                        <h4 class="mb-4 text-xs font-bold text-gray-900 dark:text-[#d94343]">Key Features</h4>
                        <ul class="space-y-4">
                            {#each capabilities[activeCapability].details as detail}
                                <li class="flex items-center gap-3">
                                    <span class="flex-shrink-0 size-1 rounded-full bg-[#ff5151]"></span>
                                    <span class="text-sm text-gray-600 dark:text-gray-300">{detail}</span>
                                </li>
                            {/each}
                        </ul>
                    </div>
                </div>
            {/if}
        </div>
    </section>
</section>

<style>
    :global(button svg) {
        transition: fill 0.2s ease-in-out;
    }
</style>