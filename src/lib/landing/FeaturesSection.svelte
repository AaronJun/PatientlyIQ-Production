<script lang="ts">
    import { Motion, AnimateSharedLayout } from "svelte-motion";
    import { inview } from 'svelte-inview';
    import type { ObserverEventDetails } from 'svelte-inview';
    import { ChevronDown } from 'lucide-svelte';
    import ClinicalTrial from "carbon-pictograms-svelte/lib/Hospital.svelte";
    import Research from "carbon-pictograms-svelte/lib/Research.svelte";
    import CoexistenceSociety from "carbon-pictograms-svelte/lib/NetworkTraffic.svelte";
    import MarketAnalysis from "carbon-pictograms-svelte/lib/EnterpriseDesignThinking_02.svelte";

    let inView = false;
    let activeFeature = 'clinical-operations';
    let activeSubFeature = 0;

    const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
        inView = detail.inView;
    };

    const features = {
        'clinical-operations': {
            title: "Clinical Operations",
            icon: ClinicalTrial,
            description: "Transform your clinical trial operations with AI-powered tools for patient recruitment, retention, and engagement.",
            subFeatures: [
                {
                    title: "Study Startup Optimization",
                    header: "Accelerate Trial Activation",
                    subheader: "Streamlined Site Operations",
                    description: "Optimize site selection, activation, and management with AI-powered workflows and predictive analytics for faster study startup.",
                    details: [
                        "Site feasibility scoring",
                        "Document tracking automation",
                        "Regulatory submission management",
                        "Budget and contract optimization",
                        "Site readiness assessment"
                    ],
                    stats: "54% faster site activation",
                    impact: "3.1x more efficient startup"
                },
                {
                    title: "Trial Performance Monitoring",
                    header: "Real-Time Trial Intelligence",
                    subheader: "Proactive Risk Management",
                    description: "Monitor trial performance in real-time with advanced analytics and risk-based quality management systems.",
                    details: [
                        "Risk-based monitoring",
                        "Protocol deviation tracking",
                        "Enrollment forecasting",
                        "Quality metrics dashboard",
                        "Site performance analytics"
                    ],
                    stats: "76% risk reduction",
                    impact: "2.9x better protocol compliance"
                },
                {
                    title: "Resource Optimization",
                    header: "Maximize Operational Efficiency",
                    subheader: "Smart Resource Management",
                    description: "Optimize resource allocation and streamline trial operations with AI-driven forecasting and workflow automation.",
                    details: [
                        "CRA capacity planning",
                        "Visit scheduling optimization",
                        "Supply chain management",
                        "Budget tracking",
                        "Resource forecasting"
                    ],
                    stats: "42% cost reduction",
                    impact: "3.4x better resource utilization"
                }
            ]
        },
        'medical-affairs': {
            title: "Medical Affairs",
            icon: Research,
            description: "Transform complex clinical data into compelling scientific narratives with advanced analytics and AI-powered insights.",
            subFeatures: [
                {
                    title: "Scientific Communication",
                    header: "Accelerate Medical Communications",
                    subheader: "Evidence-Based Engagement",
                    description: "Transform complex clinical data into compelling scientific narratives. Generate publication-ready visualizations and real-world evidence analyses.",
                    details: [
                        "Automated scientific content generation",
                        "Real-world evidence synthesis",
                        "Publication planning workflow",
                        "KOL engagement tracking",
                        "Medical conference analytics"
                    ],
                    stats: "67% faster content development",
                    impact: "3.2x higher KOL engagement"
                },
                {
                    title: "Medical Data Intelligence",
                    header: "Unified Medical Insights Platform",
                    subheader: "Real-World Evidence Analytics",
                    description: "Consolidate and analyze real-world data sources to generate actionable medical insights and support evidence generation.",
                    details: [
                        "Automated data harmonization",
                        "Cross-study analysis",
                        "Safety signal detection",
                        "Outcomes research tools",
                        "Regulatory compliance tracking"
                    ],
                    stats: "45% reduction in analysis time",
                    impact: "2.4x more insights generated"
                },
                {
                    title: "KOL Engagement",
                    header: "Strategic Expert Management",
                    subheader: "Data-Driven KOL Relationships",
                    description: "Build and maintain meaningful relationships with key opinion leaders through data-driven engagement strategies.",
                    details: [
                        "Expert identification algorithms",
                        "Engagement opportunity mapping",
                        "Scientific impact tracking",
                        "Collaboration analytics",
                        "Advisory board management"
                    ],
                    stats: "89% improved KOL satisfaction",
                    impact: "4.1x higher collaboration rate"
                }
            ]
        },
        'patient-advocacy': {
            title: "Patient Advocacy",
            icon: CoexistenceSociety,
            description: "Amplify the patient voice and improve outcomes with AI-powered patient experience analytics.",
            subFeatures: [
                {
                    title: "Patient Voice Analytics",
                    header: "Amplify Patient Perspectives",
                    subheader: "Real Patient Insights",
                    description: "Capture and analyze patient experiences to inform trial design and improve patient outcomes through AI-powered sentiment analysis.",
                    details: [
                        "Patient journey mapping",
                        "Voice of patient analytics",
                        "Quality of life tracking",
                        "Patient community insights",
                        "Burden assessment tools"
                    ],
                    stats: "92% patient insight capture",
                    impact: "3.8x better patient understanding"
                },
                {
                    title: "Support Program Optimization",
                    header: "Enhance Patient Support",
                    subheader: "Data-Driven Care Programs",
                    description: "Design and optimize patient support programs using real-world data and predictive analytics to improve outcomes.",
                    details: [
                        "Support program analytics",
                        "Adherence prediction",
                        "Resource optimization",
                        "Impact measurement",
                        "Patient feedback loops"
                    ],
                    stats: "56% higher program engagement",
                    impact: "2.9x improved adherence"
                },
                {
                    title: "Community Engagement",
                    header: "Build Patient Communities",
                    subheader: "Connected Care Networks",
                    description: "Create and nurture patient communities with tools that facilitate meaningful connections and support networks.",
                    details: [
                        "Community platform analytics",
                        "Engagement tracking",
                        "Resource utilization",
                        "Peer support metrics",
                        "Advocacy impact measurement"
                    ],
                    stats: "78% increased participation",
                    impact: "3.5x stronger support networks"
                }
            ]
        },
        'commercial-marketing': {
            title: "Commercial & Marketing",
            icon: MarketAnalysis,
            description: "Drive market success with AI-powered analytics for competitive intelligence and customer engagement.",
            subFeatures: [
                {
                    title: "Market Intelligence",
                    header: "Strategic Market Insights",
                    subheader: "AI-Powered Market Analysis",
                    description: "Generate actionable market insights using AI-powered analysis of competitive landscapes, market trends, and customer behavior.",
                    details: [
                        "Competitive intelligence",
                        "Market trend analysis",
                        "Customer segmentation",
                        "Pricing optimization",
                        "Launch readiness tracking"
                    ],
                    stats: "73% faster market analysis",
                    impact: "2.6x better forecasting accuracy"
                },
                {
                    title: "Digital Engagement",
                    header: "Optimize Digital Channels",
                    subheader: "Multi-Channel Excellence",
                    description: "Maximize impact across digital channels with AI-driven content optimization and engagement analytics.",
                    details: [
                        "Content performance analytics",
                        "Channel optimization",
                        "Campaign attribution",
                        "Audience targeting",
                        "ROI measurement"
                    ],
                    stats: "82% improved engagement",
                    impact: "3.4x higher conversion rates"
                },
                {
                    title: "Brand Analytics",
                    header: "Strengthen Brand Performance",
                    subheader: "Data-Driven Brand Strategy",
                    description: "Track and optimize brand performance with comprehensive analytics and predictive modeling.",
                    details: [
                        "Brand health monitoring",
                        "Sentiment analysis",
                        "Share of voice tracking",
                        "Message effectiveness",
                        "Customer journey analytics"
                    ],
                    stats: "64% better brand metrics",
                    impact: "2.8x ROI improvement"
                }
            ]
        }
    };

    const updateFeature = (feature: string) => {
        activeFeature = feature;
        activeSubFeature = 0;
    };
</script>

<section id="use-cases" class="section-divide relative mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="mb-16">
        <div class="border-t border-[#ff5151] pt-2">
            <div class="flex items-center gap-2">
                <span class="font-mono text-xs text-gray-500">03</span>
                <span class="font-mono text-xs text-gray-500">Use Cases</span>
            </div>
        </div>
    </div>

    <div class="space-y-12">
        <div class="space-y-6">
            <h2 class="text-4xl sm:text-5xl font-light bg-gradient-to-br from-gray-800 to-gray-500 bg-clip-text">
                Flexible data for <span class="font-serif italic text-[#ff5151]">flexible</span> needs.
            </h2>
            <p class="max-w-3xl text-base sm:text-lg text-gray-600 dark:text-gray-400">
                {features[activeFeature].description}
            </p>
        </div>

        <!-- Feature Selection Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-12 max-w-fit">
            {#each Object.entries(features) as [key, feature]}
                <button
                class="max-w-32 text-xs font-medium flex flex-col items-left justify-center px-2 h-24 transition-all duration-200 {activeFeature === key ? 'text-[#ff5151] font-semibold' : ' text-slate-400 hover:test-orange-500 dark:bg-orange-800 dark:text-gray-300'}"
                    on:click={() => updateFeature(key)}
                >
                    <svelte:component 
                        this={feature.icon}
                        class="w-6 h-6 mb-2"
                        fill={activeFeature === key ? '#ff1515' : 'currentColor'}
                    />
                    <span class="text-left text-sm max-w-24">{feature.title}</span>
                </button>
            {/each}
        </div>

        <!-- Sub-Feature Navigation -->
        <div class="hidden sm:flex flex-wrap gap-2 mb-6">
            <AnimateSharedLayout>
                {#each features[activeFeature].subFeatures as subFeature, i}
                    <button
                        class="rounded-full px-4 py-2 text-xs font-mono transition-colors {activeSubFeature === i ? 'border-2 border-[#ff5151] bg-slate-100 dark:bg-zinc-900' : 'border border-[#ffc0c0] hover:bg-gray-100'}"
                        on:click={() => activeSubFeature = i}
                    >
                        {subFeature.title}
                    </button>
                {/each}
            </AnimateSharedLayout>
        </div>

        <!-- Mobile Layout -->
        <div class="sm:hidden space-y-8">
            <div class="space-y-4">
                <h3 class="text-xl text-gray-900 dark:text-[#cd4444]">
                    {features[activeFeature].subFeatures[activeSubFeature].header}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-200">
                    {features[activeFeature].subFeatures[activeSubFeature].description}
                </p>
            </div>

            <div class="space-y-3">
                <h4 class="text-xs font-bold text-gray-900 dark:text-[#d94343]">Key Features</h4>
                <ul class="space-y-2">
                    {#each features[activeFeature].subFeatures[activeSubFeature].details as detail}
                        <li class="flex items-start gap-2">
                            <span class="w-1 h-1 mt-1.5 rounded-full bg-[#ff5151] flex-shrink-0"></span>
                            <span class="text-sm text-gray-600 dark:text-gray-300">{detail}</span>
                        </li>
                    {/each}
                </ul>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                    <span class="text-sm font-bold text-gray-900 dark:text-white">
                        {features[activeFeature].subFeatures[activeSubFeature].stats}
                    </span>
                </div>
                <div class="space-y-1">
                    <span class="text-sm font-bold text-gray-900 dark:text-white">
                        {features[activeFeature].subFeatures[activeSubFeature].impact}
                    </span>
                </div>
            </div>
        </div>

        <!-- Desktop Layout -->
        <div class="hidden sm:grid md:grid-cols-2 gap-8">
            <div class="space-y-6">
                <h3 class="text-2xl font-bold text-slate-600 dark:text-[#cd4444]">
                    {features[activeFeature].subFeatures[activeSubFeature].header}
                </h3>
                <p class="text-gray-600 dark:text-gray-200 pr-24">
                    {features[activeFeature].subFeatures[activeSubFeature].description}
                </p>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                
                    </div>
                    <div class="space-y-1">
              
                    </div>
                </div>
            </div>

            <div class="space-y-4">
                <h4 class="text-xs font-bold text-gray-900 dark:text-[#d94343]">Key Features</h4>
                <ul class="space-y-3">
                    {#each features[activeFeature].subFeatures[activeSubFeature].details as detail}
                        <li class="flex items-center gap-2">
                            <span class="w-1 h-1 rounded-full bg-[#ff5151]"></span>
                            <span class="text-sm text-gray-600 dark:text-gray-300">{detail}</span>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>
    </div>
</section>

<style>
    :global(button svg) {
        transition: fill 0.2s ease-in-out;
    }

    .section-divide {
        border-top: 1px solid #ff5151;
    }
</style>