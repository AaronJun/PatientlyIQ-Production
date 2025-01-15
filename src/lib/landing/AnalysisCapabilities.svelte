<script lang="ts">
    import { inview } from 'svelte-inview';
    import type { ObserverEventDetails } from 'svelte-inview';
    import Journey from "carbon-pictograms-svelte/lib/MovementInOverlappingNetworks.svelte";
    import WindowsHosting from "carbon-pictograms-svelte/lib/WindowsHosting.svelte";
    import GlobalAnalytics from "carbon-pictograms-svelte/lib/GlobalAnalytics.svelte";
    import CustomReports from "carbon-pictograms-svelte/lib/CustomReports.svelte";
    import CompetitiveStrategy from "carbon-pictograms-svelte/lib/GlobalNetwork.svelte";

    let inView = false;
    let activeCapability = 'journey-mapping';

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
    };
</script>
  
<section id="analysis" class="section-divide relative mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="mb-16">
        <div class="border-t border-[#ff5151] pt-2">
            <div class="flex items-center gap-2">
                <span class="font-mono text-xs text-gray-500">04</span>
                <span class="font-mono text-xs text-gray-500">Analysis Capabilities</span>
            </div>
        </div>
    </div>

    <div class="space-y-12"
        use:inview={{ unobserveOnEnter: true, rootMargin: '-100px' }}
        on:inview_change={handleChange}
    >
        <div class="space-y-6">
            <h2 class="text-4xl sm:text-5xl font-light bg-gradient-to-br from-gray-800 to-gray-500 bg-clip-text">
                See what others <span class="font-serif italic text-[#ff5151]">miss.</span>
            </h2>
            <p class="max-w-xl text-base sm:text-lg text-gray-600 dark:text-gray-400">
                Turn complex patient data into actionable insights with our comprehensive suite of analysis tools.
            </p>
        </div>

        <div class="grid grid-cols-3 sm:grid-cols-5 gap-x-12 gap-y-4 max-w-fit">
            {#each Object.entries(capabilities) as [key, capability]}
                <button
                    class="max-w-36 text-xs font-medium flex flex-col items-left justify-center h-24 px-2 transition-all duration-200 {activeCapability === key ? 'text-[#ff5151] font-semibold' : ' text-slate-400 hover:test-orange-500 dark:bg-orange-800 dark:text-gray-300'}"
                    on:click={() => updateCapability(key)}
                >
                    <svelte:component 
                        this={capability.icon}
                        class="w-6 h-6 mb-2"
                        fill={activeCapability === key ? '#ff1551' : 'currentColor'}
                    />
                    <span class="text-left text-xs sm:text-sm max-w-24">{capability.title}</span>
                </button>
            {/each}
        </div>

    {#if capabilities[activeCapability]}
            <!-- Mobile Layout -->
            <div class="sm:hidden space-y-8">
                <div class="space-y-4">
                    <h3 class="text-xl text-gray-900 dark:text-[#cd4444]">
                        {capabilities[activeCapability].title}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-200">
                        {capabilities[activeCapability].longDescription}
                    </p>
                </div>

                <div class="space-y-3">
                    <h4 class="text-xs font-bold text-gray-900 dark:text-[#d94343]">Key Features</h4>
                    <ul class="space-y-2">
                        {#each capabilities[activeCapability].details as detail}
                            <li class="flex items-start gap-2">
                                <span class="w-1 h-1 mt-1.5 rounded-full bg-[#ff5151] flex-shrink-0"></span>
                                <span class="text-sm text-gray-600 dark:text-gray-300">{detail}</span>
                            </li>
                        {/each}
                    </ul>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
            
                    </div>
                </div>
            </div>

            <!-- Desktop Layout -->
            <div class="hidden sm:grid md:grid-cols-2 gap-8">
                <div class="space-y-6">
                    <h3 class="text-2xl text-slate-700 font-bold dark:text-[#cd4444]">
                        {capabilities[activeCapability].title}
                    </h3>
                    <p class="text-gray-600 dark:text-gray-200 pr-24">
                        {capabilities[activeCapability].longDescription}
                    </p>
                </div>

                <div class="space-y-6">
                    <h4 class="text-xs font-bold text-gray-900 dark:text-[#d94343]">Key Features</h4>
                    <ul class="space-y-3">
                        {#each capabilities[activeCapability].details as detail}
                            <li class="flex items-center gap-2">
                                <span class="w-1 h-1 rounded-full bg-[#ff5151]"></span>
                                <span class="text-sm text-gray-600 dark:text-gray-300">{detail}</span>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        {/if}
    </div>
</section>

<style>
    :global(button svg) {
        transition: fill 0.2s ease-in-out;
    }
    .section-divide {
		border-top: .25px solid #ff5151;
		padding-top: .525rem;
	}
</style>