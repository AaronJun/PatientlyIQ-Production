<script lang="ts">
    import { cn } from "$lib/utils";
    import AnimatedBeam from '$lib/magicui/components/AnimatedBeam/AnimatedBeam.svelte';
    import Circle from "$lib/magicui/components/AnimatedBeam/Circle.svelte";
    import { inview } from 'svelte-inview';
    import type { ObserverEventDetails } from 'svelte-inview';
    import { MessageSquare, BrainCircuit, FileSearch, Lightbulb } from 'lucide-svelte';
    import {
        AiGenerate,
        Chat,
        UserFeedback,
        IbmWatsonSpeechToText,
        Microscope,
        Group,
        Idea,
        Book,
        Search,
        EventsAlt,
        DataBase,
        UserMultiple
    } from "carbon-icons-svelte";
    import CardBody from '$lib/ui/card/CardBody.svelte';
    import CardContainer from "$lib/ui/card/CardContainer.svelte";
    import {
        Tooltip,
        TooltipContent,
        TooltipTrigger,
    } from "$lib/components/ui/tooltip";


    let containerRef;
    let inView = false;

    // Source nodes
    let socialListeningRef;
    let interviewsRef;
    let focusGroupsRef;
    let academicRef;

    // Central node
    let centralDataBaseRef;

    // Output node
    let insightsRef;

    const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
        inView = detail.inView;
    };

    const sources = [
        {
            cardContent: {
                title: "Social Listening",
                description: "Real-time monitoring of patient conversations and experiences across social media and healthcare forums",
            },
            icon: IbmWatsonSpeechToText,
            ref: socialListeningRef
        },
        {
            cardContent: {
                title: "Patient & Caregiver Interviews",
                description: "Direct, in-depth conversations with patients and caregivers about their healthcare journey",
            },
            icon: UserFeedback,
            ref: interviewsRef
        },
        {
            cardContent: {
                title: "Focus Groups",
                description: "Structured group discussions to understand collective experiences and shared challenges",
            },
            icon: EventsAlt,
            ref: focusGroupsRef
        },
        {
            cardContent: {
                title: "Academic Research",
                description: "Integration of peer-reviewed findings and clinical studies",
            },
            icon: Book,
            ref: academicRef
        },
    ];
    const TOOLTIP_DELAY = 0; // 200ms delay


</script>

<section id="data-sources" class="relative mx-auto mt-2 max-w-7xl px-2 md:px-2">
    <div class="text-left mb-16">
        <section class="relative mx-auto mt-32 max-w-7xl px-6 md:px-8">
            <div class="text-left mb-16">
                <!-- Replace the AnimatedShinyText section with this new section marker -->
                <div class="section-divide mb-4 flex items-left gap-2">
                    <span class="font-mono text-xs text-gray-500">02</span>
                    <span class="font-mono text-xs text-gray-500">Comprehensive, Multi-Channel Data</span>
                </div>
        
        </div>
        <div class="grid grid-row md:grid-row gap-12 pb-12"
        use:inview={{ unobserveOnEnter: true, rootMargin: '-100px' }}
        on:inview_change={handleChange}
    >

        <h2 class=
        "animate-fade-in text-balance bg-gradient-to-br from-gray-800 from-30% to-gray-500 bg-clip-text mr-2 text-5xl font-light text-transparent opacity-0 tracking-medium w-9/12 [--animation-delay:200ms] dark:from-white/60 dark:to-white">

        A <span class="font-serif tracking-tight italic text-[#ff5151]">First-of-Its-Kind</span> Dataset
        </h2>

        <p class="-translate-y-4 animate-fade-in text-balance tracking-normal max-w-[775px] text-gray-600 opacity-0 [--animation-delay:400ms] dark:text-gray-400 text-lg md:text-lg sm:text-base">
            PatientlyIQ discovers and consolidates data from multiple channels, and categorizes and correlates the data to create a rich repository of patient insights.
        </p>
        </div>
    </div>
    <div
        use:inview={{ unobserveOnEnter: true, rootMargin: '-100px' }}
        on:inview_change={handleChange}
        class="animate-fade-up opacity-0 [--animation-delay:200ms]"
    >
    <div
    bind:this={containerRef}
    class={cn(
        "relative mx-auto flex w-full max-w-[12000px] items-center justify-left -z-20 first-line:overflow-hidden border border-slate-100 dark:border-gray-900 sdark:bg-background p-10 mb-16",
    )}
>
    <div class="absolute right-5 top-0 h-px w-1/2 bg-gradient-to-l from-transparent via-white/30 via-10% to-transparent" />

 
<div class="flex h-full w-full flex-row justify-between gap-10 items-center">
    <!-- Left column - Data sources -->
    <div class="flex flex-col justify-center gap-8">
        <!-- Social Listening -->
        <Tooltip>
            <TooltipTrigger>
                <Circle>
                    <div bind:this={socialListeningRef} class="flex items-center justify-center">
                        <IbmWatsonSpeechToText class="w-6 h-6  text-orange-800 dark:text-orange-600" />
                    </div>
                </Circle>
            </TooltipTrigger>
            <TooltipContent>
                <p class="text-sm">Social Listening</p>
            </TooltipContent>
        </Tooltip>
        
        <!-- Interviews -->
        <Tooltip>
            <TooltipTrigger>
                <Circle>
                    <div bind:this={interviewsRef} class="flex items-center justify-center">
                        <UserFeedback class="w-6 h-6 text-orange-800 dark:text-orange-600" />
                    </div>
                </Circle>
            </TooltipTrigger>
            <TooltipContent>
                <p class="text-sm">Patient & Caregiver Interviews</p>
            </TooltipContent>
        </Tooltip>
        
        <!-- Focus Groups -->
        <Tooltip>
            <TooltipTrigger>
                <Circle>
                    <div bind:this={focusGroupsRef} class="flex items-center justify-center">
                        <EventsAlt class="w-6 h-6  text-orange-800 dark:text-orange-600" />
                    </div>
                </Circle>
            </TooltipTrigger>
            <TooltipContent>
                <p class="text-sm">Focus Groups</p>
            </TooltipContent>
        </Tooltip>
        
        <!-- Academic Research -->
        <Tooltip>
            <TooltipTrigger>
                <Circle>
                    <div bind:this={academicRef} class="flex items-center justify-center">
                        <Book class="w-6 h-6  text-orange-800 dark:text-orange-600" />
                    </div>
                </Circle>
            </TooltipTrigger>
            <TooltipContent>
                <p class="text-sm">Academic Research</p>
            </TooltipContent>
        </Tooltip>
    </div>

    <!-- Center - DataBase -->
    <div class="flex flex-col justify-center">
        <Tooltip>
            <TooltipTrigger>
                <Circle >
                    <div bind:this={centralDataBaseRef} class="flex items-center justify-center">
                        <DataBase stroke-width="1.2" class="w-8 h-8  text-orange-800 dark:text-orange-600/70" />
                    </div>
                </Circle>
            </TooltipTrigger>
            <TooltipContent>
                <p class="text-sm">Proprietary Database</p>
            </TooltipContent>
        </Tooltip>
    </div>

    <!-- Right - Insights -->
    <div class="flex flex-col justify-center">
        <Tooltip>
            <TooltipTrigger>
                <Circle>
                    <div bind:this={insightsRef} class="flex items-center justify-center">
                        <Idea class="w-6 h-6  text-orange-800 dark:text-orange-600" />
                    </div>
                </Circle>
            </TooltipTrigger>
            <TooltipContent>
                <p class="text-sm">Actionable Insights</p>
            </TooltipContent>
        </Tooltip>
    </div>
</div>

    <!-- Animated beams -->
    <AnimatedBeam bind:containerRef bind:fromRef={socialListeningRef} bind:toRef={centralDataBaseRef} />
    <AnimatedBeam bind:containerRef bind:fromRef={interviewsRef} bind:toRef={centralDataBaseRef} />
    <AnimatedBeam bind:containerRef bind:fromRef={focusGroupsRef} bind:toRef={centralDataBaseRef} />
    <AnimatedBeam bind:containerRef bind:fromRef={academicRef} bind:toRef={centralDataBaseRef} />
    <AnimatedBeam bind:containerRef bind:fromRef={centralDataBaseRef} bind:toRef={insightsRef} />
</div>
<!-- Data source descriptions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mr-4 ml-4">
        {#each sources as source}
        <div class="group">
            <CardContainer>
                <CardBody
                    cardContent={source.cardContent}
                    class="h-40 flex flex-col justify-start w-96 py-6"
                >
                    <div class="p-2 text-[#ff5151] w-fit">
                        <svelte:component this={source.icon} class="w-5 h-5" />
                    </div>
                </CardBody>
            </CardContainer>
        </div>
        {/each}
    </div>


    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mr-4 ml-4">
            <CardContainer>
                <CardBody
                    cardContent={{
                        title: "Proprietary Database",
                        description: "PatientlyIQ discovers and consolidates data from multiple channels, and categorizes and correlates the data to create a rich repository of patient insights."
                    }}
                class="h-40 flex flex-col justify-start w-96 py-6"
                >
                        <div class="p-2 rounded-sm text-[#ff5151]">
                            <DataBase class="w-5 h-5" />
                        </div>
                </CardBody>
            </CardContainer>

            <CardContainer>
                <CardBody
                    cardContent={{
                        title: "AI-Powered Insights",
                        description: "Advanced analytics and machine learning transform raw data into actionable insights for healthcare providers and researchers."
                    }}
                    class="h-40 flex flex-col justify-start w-96 py-6">
                        <div class="p-2 rounded-sm text-[#ff5151]">
                            <AiGenerate class="w-5 h-5" />
                        </div>
                </CardBody>
            </CardContainer>
    </div>
    
</section>

<style>
    .section-divide {
		border-top: .25px solid #ff5151;
		padding-top: .525rem;
	}
    
</style>