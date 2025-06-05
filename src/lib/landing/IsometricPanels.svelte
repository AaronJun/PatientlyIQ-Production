<script lang="ts">
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import {
        AiGenerate,
        UserFeedback,
        IbmWatsonSpeechToText,
        DataBase,
        Chat,
        Code,
        Document,
    } from "carbon-icons-svelte";

    // Export props
    export let currentStep: number = 0;

    // Panel animations
    const panelOffset = tweened(0, {
        duration: 600,
        easing: cubicOut
    });

    // Update panel animation as current step changes
    $: {
        panelOffset.set(currentStep * 20);
    }

    // Panel data for each step
    const panels = [
        {
            icon: UserFeedback,
            title: "Data Collection",
            subtitle: "DATA SOURCES",
            zIndex: -40,
            offsetMultiplier: 0.4
        },
        {
            icon: DataBase,
            title: "Secure Database",
            subtitle: "PATIENT DATA",
            zIndex: 40,
            offsetMultiplier: 0.8
        },
        {
            icon: AiGenerate,
            title: "AI Processing",
            subtitle: "AGENT BACKEND",
            zIndex: 0,
            offsetMultiplier: 0.6
        },
        {
            icon: Chat,
            title: "User Interface",
            subtitle: "CLOUD AGENT",
            zIndex: 80,
            offsetMultiplier: 1.0
        }
    ];

    // Card data for additional information
    const cards = [
        {
            title: "Comprehensive Data Collection",
            description: "We gather data from social media, forums, interviews, and direct patient feedback to create a comprehensive picture.",
            icon: Document,
            details: [
                "Social listening across platforms",
                "Patient interviews and surveys",
                "Healthcare forum monitoring",
                "Clinician feedback integration"
            ]
        },
        {
            title: "Secure Infrastructure",
            description: "Enterprise-grade security and privacy protection for all patient data with HIPAA compliance.",
            icon: DataBase,
            details: [
                "End-to-end encryption",
                "Data anonymization",
                "Secure cloud storage",
                "Regular security audits"
            ]
        },
        {
            title: "Advanced Analytics",
            description: "Our proprietary AI models identify patterns and insights that would be impossible to discover manually.",
            icon: AiGenerate,
            details: [
                "Natural language processing",
                "Sentiment analysis",
                "Pattern recognition",
                "Predictive modeling"
            ]
        },
        {
            title: "Actionable Insights",
            description: "Transform raw data into clear, actionable insights delivered through an intuitive interface.",
            icon: Chat,
            details: [
                "Visual dashboards",
                "Trend analysis",
                "Priority recommendations",
                "Comparative benchmarks"
            ]
        }
    ];
</script>

<div class="relative">
    <!-- Main isometric panels -->
    <div class="h-[70vh] perspective mb-24">
        <div class="w-full h-full relative" style="transform-style: preserve-3d;">
            {#each panels as panel, i}
                {@const zPos = panel.zIndex + $panelOffset * panel.offsetMultiplier}
                <div 
                    class="absolute w-full h-full border border-gray-800 rounded-lg overflow-hidden bg-gray-900"
                    style="transform: translateZ({zPos}px) rotateX(10deg) rotateY(-20deg); opacity: {currentStep === i ? 1 : 0.7}; backface-visibility: hidden; transition: transform 0.8s cubic-bezier(0.075, 0.82, 0.165, 1), opacity 0.5s ease; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);"
                >
                    <div class="absolute inset-0">
                        <div class="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900 grid place-items-center">
                            <div class="text-center space-y-4">
                                <svelte:component this={panel.icon} size={32} class="mx-auto text-[#0dcaf0]" />
                                <div class="text-xs uppercase tracking-wider text-gray-400">
                                    {panel.title}
                                </div>
                            </div>
                        </div>
                        <div class="absolute inset-0 border-t border-l border-gray-700/50"></div>
                        <div class="absolute bottom-0 right-0 w-32 h-12 bg-gray-800/80 rounded-tl-lg grid place-items-center">
                            <div class="text-xs text-[#0dcaf0]">{panel.subtitle}</div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <!-- Detail cards for the current step -->
    <div class="mt-16">
        {#if currentStep >= 0 && currentStep < cards.length}
            <div class="card-container animate-fade-in opacity-0 [--animation-delay:200ms]">
                <div class="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 overflow-hidden relative">
                    <div class="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-[#0dcaf0]/20 to-transparent opacity-60"></div>
                    
                    <div class="flex items-start gap-4">
                        <div class="p-3 rounded-lg bg-gray-800/50 text-[#0dcaf0]">
                            <svelte:component this={cards[currentStep].icon} size={24} />
                        </div>
                        
                        <div class="flex-1">
                            <h3 class="text-xl font-medium text-white mb-2">{cards[currentStep].title}</h3>
                            <p class="text-gray-400 mb-4">{cards[currentStep].description}</p>
                            
                            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {#each cards[currentStep].details as detail}
                                    <li class="flex items-center gap-2 text-sm text-gray-300">
                                        <span class="h-1.5 w-1.5 rounded-full bg-[#0dcaf0]"></span>
                                        {detail}
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>

    <!-- Additional supporting cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        {#each cards as card, i}
            <div 
                class="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-lg p-4 transition-all duration-300 hover:border-[#0dcaf0]/30 hover:bg-gray-900/50"
                class:opacity-50={currentStep !== i}
                class:border-[#0dcaf0]/20={currentStep === i}
            >
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 rounded-md bg-gray-800/80 text-[#0dcaf0]">
                        <svelte:component this={card.icon} size={18} />
                    </div>
                    <h4 class="font-medium text-white">{card.title}</h4>
                </div>
                <p class="text-sm text-gray-400">{card.description}</p>
            </div>
        {/each}
    </div>
</div>

<style>
    .perspective {
        perspective: 1000px;
    }
    
    .isometric-container {
        transform-style: preserve-3d;
    }
    
    .isometric-panel {
        backface-visibility: hidden;
        transition: transform 0.8s cubic-bezier(0.075, 0.82, 0.165, 1), opacity 0.5s ease;
    }
    
    .panel-shadow {
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }

    .card-container {
        position: relative;
    }

    .card-container::before {
        content: "";
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 0; 
        height: 0; 
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-bottom: 10px solid rgba(17, 24, 39, 0.8);
        z-index: 10;
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