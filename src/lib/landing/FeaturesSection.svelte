<script lang="ts">
    import { Motion, AnimateSharedLayout } from "svelte-motion";
    import { inview } from 'svelte-inview';
    import type { ObserverEventDetails } from 'svelte-inview';
    import { ChevronDown } from 'lucide-svelte';
    
    // Import Carbon pictograms
    import ClinicalTrial from "carbon-pictograms-svelte/lib/Hospital.svelte";
    import Research from "carbon-pictograms-svelte/lib/Research.svelte";
    import CoexistenceSociety from "carbon-pictograms-svelte/lib/NetworkTraffic.svelte";
    import MarketAnalysis from "carbon-pictograms-svelte/lib/EnterpriseDesignThinking_02.svelte";

    let inView = false;
    let activeIdx = 0;
    let openAccordion: number | null = 0; // Initialize to 0 instead of null
    let activeAudience = 'clinical-operations';


    const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
        inView = detail.inView;
    };

    const toggleAccordion = (index: number) => {
        openAccordion = openAccordion === index ? null : index;
    };


    const audienceFeatures = {
        'clinical-operations': [
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
                impact: "3.1x more efficient startup",
                chartData: Array.from({ length: 12 }, (_, i) => ({
                    x: i,
                    y: Math.exp(i / 6) * 10 + Math.random() * 5 + 30
                }))
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
                impact: "2.9x better protocol compliance",
                chartData: Array.from({ length: 12 }, (_, i) => ({
                    x: i,
                    y: Math.sin(i / 2) * 20 + 60
                }))
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
                impact: "3.4x better resource utilization",
                chartData: Array.from({ length: 12 }, (_, i) => ({
                    x: i,
                    y: Math.log(i + 1) * 15 + 40
                }))
            }
        ],        
        'medical-affairs': [
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
                impact: "3.2x higher KOL engagement",
                chartData: Array.from({ length: 12 }, (_, i) => ({
                    x: i,
                    y: Math.exp(i / 6) * 10 + Math.random() * 5 + 30
                }))
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
                impact: "2.4x more insights generated",
                chartData: Array.from({ length: 12 }, (_, i) => ({
                    x: i,
                    y: Math.sin(i / 2) * 20 + 60
                }))
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
                impact: "4.1x higher collaboration rate",
                chartData: Array.from({ length: 12 }, (_, i) => ({
                    x: i,
                    y: Math.log(i + 1) * 15 + 40
                }))
            }
        ],
        'patient-advocacy': [
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
                impact: "3.8x better patient understanding",
                chartData: Array.from({ length: 12 }, (_, i) => ({
                    x: i,
                    y: Math.exp(i / 6) * 10 + Math.random() * 5 + 30
                }))
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
                impact: "2.9x improved adherence",
                chartData: Array.from({ length: 12 }, (_, i) => ({
                    x: i,
                    y: Math.sin(i / 2) * 20 + 60
                }))
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
                impact: "3.5x stronger support networks",
                chartData: Array.from({ length: 12 }, (_, i) => ({
                    x: i,
                    y: Math.log(i + 1) * 15 + 40
                }))
            }
        ],
        'commercial-marketing': [
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
                impact: "2.6x better forecasting accuracy",
                chartData: Array.from({ length: 12 }, (_, i) => ({
                    x: i,
                    y: Math.exp(i / 6) * 10 + Math.random() * 5 + 30
                }))
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
                impact: "3.4x higher conversion rates",
                chartData: Array.from({ length: 12 }, (_, i) => ({
                    x: i,
                    y: Math.sin(i / 2) * 20 + 60
                }))
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
                impact: "2.8x ROI improvement",
                chartData: Array.from({ length: 12 }, (_, i) => ({
                    x: i,
                    y: Math.log(i + 1) * 15 + 40
                }))
            }
        ]
    };

    let features = audienceFeatures['medical-affairs'];

    const updateAudience = (audience: string) => {
        activeAudience = audience;
        features = audienceFeatures[audience];
        activeIdx = 0;
        openAccordion = null;
    };
</script>

<section id="use-cases" class="relative mx-auto mt-2 max-w-7xl px-2 md:px-2">
    <div class="text-left mb-16">
        <section class="relative mx-auto mt-32 max-w-7xl px-6 md:px-8">
            <div class="text-left mb-16">
                <div class="section-divide mb-4 flex items-left gap-2">
                    <span class="font-mono text-xs text-gray-500">03</span>
                    <span class="font-mono text-xs text-gray-500">Use Cases</span>
                </div>
            </div>
        </section>
    </div>
    <section class="relative mx-auto mt-32 max-w-7xl px-6 md:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 pb-24"
            use:inview={{ unobserveOnEnter: true, rootMargin: '-100px' }}
            on:inview_change={handleChange}
        >
            <h2 class="animate-fade-in text-balance bg-gradient-to-br from-gray-800 from-30% to-gray-500 bg-clip-text mr-2 sm:mr-0 text-5xl font-light [--animation-delay:200ms] dark:from-white/60 dark:to-white">
                Flexible data for <span class="font-serif pr-2 italic text-[#ff5151]">flexible</span>needs.
            </h2>

            <p class="-translate-y-4 animate-fade-in text-balance tracking-normal max-w-[625px] text-gray-600 opacity-0 [--animation-delay:400ms] dark:text-gray-400 md:text-base sm:text-sm">
                Transform your clinical trial operations with AI-powered tools for patient recruitment, retention, and engagement. Our platform streamlines complex workflows while maintaining rigorous compliance and data quality standards.
            </p>
        </div>

        <div
        use:inview={{ unobserveOnEnter: true, rootMargin: '-100px' }}
            on:inview_change={handleChange}
            class="animate-fade-up opacity-0 [--animation-delay:400ms]"
        >
            <!-- Audience Selection -->
           
<!-- Updated Audience Selection Buttons -->
<div class="mb-12">
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-12">        
        <button
            class="p-2 rounded-sm text-sm font-medium flex flex-col max-h-60 flex-grow items-center justify-center aspect-square transition-all duration-200 {activeAudience === 'clinical-operations' ? 'bg-[#ff5151] text-white shadow-lg scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-[1.02] dark:bg-gray-800 dark:text-gray-300'}"
            on:click={() => updateAudience('clinical-operations')}
        >
            <ClinicalTrial 
                class="w-8 h-8 mb-4" 
                fill={activeAudience === 'clinical-operations' ? 'white' : 'currentColor'}
            />
            <span class="text-center font-medium">Clinical Operations</span>
        </button>
        
        <button
            class="p-2 rounded-sm text-sm font-medium flex flex-col max-h-60 flex-grow items-center justify-center aspect-square transition-all duration-200 {activeAudience === 'medical-affairs' ? 'bg-[#ff5151] text-white shadow-lg scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-[1.02] dark:bg-gray-800 dark:text-gray-300'}"
            on:click={() => updateAudience('medical-affairs')}
        >
            <Research 
                class="w-8 h-8 mb-4" 
                fill={activeAudience === 'medical-affairs' ? 'white' : 'currentColor'}
            />
            <span class="text-center font-medium">Medical Affairs</span>
        </button>
        
        <button
            class="p-2 rounded-lg text-sm font-medium flex flex-col max-h-60 flex-grow items-center justify-center aspect-square transition-all duration-200 {activeAudience === 'patient-advocacy' ? 'bg-[#ff5151] text-white shadow-lg scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-[1.02] dark:bg-gray-800 dark:text-gray-300'}"
            on:click={() => updateAudience('patient-advocacy')}
        >
            <CoexistenceSociety 
                class="w-8 h-8 mb-4" 
                fill={activeAudience === 'patient-advocacy' ? 'white' : 'currentColor'}
            />
            <span class="text-center font-medium">Patient Advocacy</span>
        </button>
        
        <button
            class="p-2 rounded-sm text-sm font-medium flex flex-col max-h-60 flex-grow items-center justify-center aspect-square transition-all duration-200 {activeAudience === 'commercial-marketing' ? 'bg-[#ff5151] text-white shadow-lg scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-[1.02] dark:bg-gray-800 dark:text-gray-300'}"
            on:click={() => updateAudience('commercial-marketing')}
        >
            <MarketAnalysis 
                class="w-8 h-8 mb-4" 
                fill={activeAudience === 'commercial-marketing' ? 'white' : 'currentColor'}
            />
            <span class="text-center font-medium">Commercial & Marketing</span>
        </button>
    </div>
</div>



            <!-- Tabs for larger screens -->
            <div class="relative hidden sm:flex flex-wrap items-center justify-start mb-6 gap-2">
                <AnimateSharedLayout>
                    {#each features as feature, i}
                        <button
                            class="group relative z-[1] rounded-full px-5 py-2 {activeIdx === i ? 'border-2 border-[#ff5151] bg-slate-300 dark:bg-zinc-900' : 'border border-[#ffc0c0] hover:bg-gray-200 dark:hover:bg-gray-700'}"
                            on:click={() => {
                                activeIdx = i;
                            }}
                        >
                            <span class="text-2xs font-mono leading-5 {activeIdx === i ? 'text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-600'}">
                                {feature.title}
                            </span>
                        </button>
                    {/each}
                </AnimateSharedLayout>
            </div>

            <!-- Accordion for mobile -->
            <div class="sm:hidden space-y-4">
                {#each features as feature, i}
                    <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <button
                            class="w-full px-4 py-3 flex justify-between items-center bg-gray-50 dark:bg-gray-800"
                            on:click={() => toggleAccordion(i)}
                        >
                            <span class="text-sm font-mono {openAccordion === i ? 'text-[#ff5151]' : 'text-gray-600 dark:text-gray-300'}">
                                {feature.title}
                            </span>
                            <ChevronDown
                                class="w-5 h-5 transition-transform duration-200 {openAccordion === i ? 'rotate-180' : ''}"
                            />
                        </button>
                        
                        {#if openAccordion === i}
                            <div class="px-4 py-3 bg-white dark:bg-gray-900">
                                <div class="space-y-6">
                                    <div class="space-y-2">
                                        <h3 class="text-xl font-base text-gray-900 dark:text-[#cd4444]">
                                            {feature.header}
                                        </h3>
                                    </div>
                                    <p class="text-gray-600 dark:text-gray-200 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                    <div class="space-y-4 mt-4">
                                        <div class="space-y-2">
                                            <p class="text-base font-bold text-gray-900 dark:text-white">{feature.stats}</p>
                                            <p class="text-base font-bold text-gray-900 dark:text-white">{feature.impact}</p>
                                        </div>
                                        <ul class="space-y-2">
                                            {#each feature.details as detail}
                                                <li class="flex items-center gap-3 text-sm">
                                                    <span class="flex-shrink-0 size-1 rounded-full bg-[#ff5151]"></span>
                                                    <span class="text-gray-600 dark:text-gray-300">{detail}</span>
                                                </li>
                                            {/each}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>

            <!-- Feature Content for larger screens -->
            <div class="hidden sm:block mt-8 pl-4">
                {#each features as feature, i}
                    {#if activeIdx === i}
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div class="space-y-6">
                                <div class="space-y-2">
                                    <h3 class="text-2xl pt-4 font-base text-gray-900 dark:text-[#cd4444]">
                                        {feature.header}
                                    </h3>
                                </div>
                                <p class="text-gray-600 dark:text-gray-200 text-base leading-relaxed">
                                    {feature.description}
                                </p>
                                <div class="column gap-8 mt-8">
                                
                                </div>
                            </div>

                            <div class="p-8 mt-4">
                                <ul class="space-y-4">
                                    {#each feature.details as detail}
                                        <li class="flex items-center gap-3 text-sm">
                                            <span class="flex-shrink-0 size-1 rounded-full bg-[#ff5151]"></span>
                                            <span class="text-gray-600 dark:text-gray-300">{detail}</span>
                                        </li>
                                    {/each}
                                </ul>
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>
        </div>
    </section>
</section>

<style>
    .text-2xs {
        font-size: 0.6725rem;
        line-height: 1.5rem;
    }
    
    :global(.feature-visual .border-beam) {
        opacity: 0.5;
    }
    :global(button svg) {
        transition: fill 0.2s ease-in-out;
    }
    .section-divide {
		border-top: .25px solid #ff5151;
		padding-top: .525rem;
	}
</style>