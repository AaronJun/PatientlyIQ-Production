<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { Motion, AnimatePresence } from "svelte-motion";
    import { fade } from 'svelte/transition';
    import { inview } from 'svelte-inview';
    import type { ObserverEventDetails } from 'svelte-inview';
    import patientData from '$lib/data/patientCardData.json';
    import PatientDrawer from './PatientJourneyDrawer.svelte';
    
    let inView = false;
    let active = 0;
    let startX: number;
    let cardElement: HTMLElement;
    let isGridView = false;
    let isDrawerOpen = false;
    let selectedPatient: any = null;

    const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
        inView = detail.inView;
    };

    const handleNext = () => {
        if (!isGridView) active = (active + 1) % patientData.length;
    };
    
    const handlePrev = () => {
        if (!isGridView) active = (active - 1 + patientData.length) % patientData.length;
    };

    const isActive = (index: number) => index === active;
    const randomRotateY = () => Math.floor(Math.random() * 21) - 10;

    const toggleView = () => {
        isGridView = !isGridView;
    };

    const handleTouchStart = (e: TouchEvent) => {
        if (isGridView) return;
        startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (isGridView || !startX) return;

        const currentX = e.touches[0].clientX;
        const diff = startX - currentX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) handleNext();
            else handlePrev();
            startX = null;
        }
    };

    const handleTouchEnd = () => {
        startX = null;
    };

    onMount(() => {
        if (cardElement) {
            cardElement.addEventListener('touchstart', handleTouchStart);
            cardElement.addEventListener('touchmove', handleTouchMove);
            cardElement.addEventListener('touchend', handleTouchEnd);
        }
    });

    onDestroy(() => {
        if (cardElement) {
            cardElement.removeEventListener('touchstart', handleTouchStart);
            cardElement.removeEventListener('touchmove', handleTouchMove);
            cardElement.removeEventListener('touchend', handleTouchEnd);
        }
    });

function openDrawer(patient: any) {
    selectedPatient = patient;
    isDrawerOpen = true;
}

    function closeDrawer() {
        isDrawerOpen = false;
        selectedPatient = null;
    }

    function handleNextPatient() {
    const currentIndex = patientData.findIndex(p => p.id === selectedPatient.id);
    selectedPatient = patientData[(currentIndex + 1) % patientData.length];
}

function handlePrevPatient() {
    const currentIndex = patientData.findIndex(p => p.id === selectedPatient.id);
    selectedPatient = patientData[(currentIndex - 1 + patientData.length) % patientData.length];
}
</script>

{#if isDrawerOpen && selectedPatient}
    <PatientDrawer 
        isOpen={isDrawerOpen}
        patient={selectedPatient}
        onClose={() => {
            isDrawerOpen = false;
            selectedPatient = null;
        }}
        onNext={handleNextPatient}
        onPrev={handlePrevPatient}
    />
{/if}

<div
    use:inview={{ unobserveOnEnter: true, rootMargin: '-100px' }}
    on:inview_change={handleChange}
    class="max-w-6xl mx-auto px-4 py-20"
>
    <div class="flex justify-end mb-4">
        <button
            on:click={toggleView}
            class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-[#ff5151] hover:text-white transition-all duration-300 text-sm flex items-center gap-2"
        >
            {#if isGridView}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                </svg>
                Stack View
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                </svg>
                Grid View
            {/if}
        </button>
    </div>

    {#if isGridView}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each patientData as patient}
                <div class="rounded-3xl shadow-xl overflow-hidden bg-white dark:bg-neutral-800 h-[500px]">
                    <div class="h-full w-full p-8 flex flex-col">
                        <div class="flex items-center gap-4 mb-6">
                            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff5151] to-[#ff8151] flex items-center justify-center text-white">
                                <span class="text-lg font-serif">
                                    {patient.name[0]}
                                </span>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                                    {patient.name}
                                </h3>
                                <p class="text-sm text-[#ff5151]">
                                    {patient.persona} • {patient.age}
                                </p>
                            </div>
                        </div>
                        
                        <div class="space-y-4 flex-grow">
                            <p class="text-sm text-gray-600 dark:text-gray-300">
                                {patient.quote}
                            </p>
                            <div class="pt-4">
                                <div class="space-y-2">
                                    <div class="flex justify-between text-xs">
                                        <span class="text-gray-500 dark:text-gray-400">Trial Sentiment</span>
                                        <span class="text-[#ff5151]">{patient["trial-sentiment"]}/5</span>
                                    </div>
                                    <div class="flex justify-between text-xs">
                                        <span class="text-gray-500 dark:text-gray-400">Treatment Sentiment</span>
                                        <span class="text-[#ff5151]">{patient["treatment-sentiment"]}/5</span>
                                    </div>
                                    <div class="flex justify-between text-xs">
                                        <span class="text-gray-500 dark:text-gray-400">Medical Literacy</span>
                                        <span class="text-[#ff5151]">{patient["medical-literacy"]}/5</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <div class="flex justify-center">
            <div 
                class="relative h-[500px] w-[400px]"
                bind:this={cardElement}
            >
                <AnimatePresence let:item list={[{ key: active }]}>
                    {#each patientData as patient, index}
                        <Motion
                            initial={{
                                opacity: 0,
                                scale: 0.9,
                                z: -100,
                                rotate: randomRotateY(),
                            }}
                            animate={{
                                opacity: isActive(index) ? 1 : 0.7,
                                scale: isActive(index) ? 1 : 0.95,
                                z: isActive(index) ? 0 : -100,
                                rotate: isActive(index) ? 0 : randomRotateY(),
                                zIndex: isActive(index) ? 999 : patientData.length + 2 - index,
                                y: isActive(index) ? [0, -20, 0] : 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.9,
                                z: -10,
                                rotate: randomRotateY(),
                            }}
                            transition={{
                                duration: 0.4,
                                ease: "easeInOut",
                            }}
                            let:motion
                        >
                            <div 
                                use:motion 
                                class="absolute inset-0 rounded-3xl shadow-xl overflow-hidden bg-white dark:bg-neutral-800 touch-none"
                            >
                                <div class="h-full w-full p-8 flex flex-col">
                                    <div class="flex items-center gap-4 mb-6">
                                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff5151] to-[#ff8151] flex items-center justify-center text-white">
                                            <span class="text-lg font-serif">
                                                {patient.name[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                                                {patient.name}
                                            </h3>
                                            <p class="text-sm text-[#ff5151]">
                                                {patient.persona} • {patient.age}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div class="space-y-4 flex-grow">
                                        <p class="text-sm text-gray-600 dark:text-gray-300">
                                            {patient.quote}
                                        </p>
                                        <div class="pt-4">
                                            <div class="space-y-2">
                                                <div class="flex justify-between text-xs">
                                                    <span class="text-gray-500 dark:text-gray-400">Trial Sentiment</span>
                                                    <span class="text-[#ff5151]">{patient["trial-sentiment"]}/5</span>
                                                </div>
                                                <div class="flex justify-between text-xs">
                                                    <span class="text-gray-500 dark:text-gray-400">Treatment Sentiment</span>
                                                    <span class="text-[#ff5151]">{patient["treatment-sentiment"]}/5</span>
                                                </div>
                                                <div class="flex justify-between text-xs">
                                                    <span class="text-gray-500 dark:text-gray-400">Medical Literacy</span>
                                                    <span class="text-[#ff5151]">{patient["medical-literacy"]}/5</span>
                                                </div>
                                            
                                            </div>
                                        </div>
                                        <button 
                                        on:click={() => openDrawer(patient)}
                                        class="w-full px-4 py-2 text-sm bg-orange-700  dark:bg-orange-700 hover:bg-[#ff5151] hover:text-white transition-all duration-300 rounded-full"
                                    >
                                        View Journey Map
                                    </button>
                                    </div>
                                </div>
                                
                            </div>
                        </Motion>
                    {/each}
                </AnimatePresence>
            </div>
        </div>

        <div class="flex justify-center gap-4 mt-8">
            <button
                on:click={handlePrev}
                class="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 dark:hover:bg-[#ff5151] flex items-center justify-center group hover:bg-[#ff5151] hover:text-white transition-all duration-300"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-5 w-5 group-hover:rotate-12 transition-transform duration-300"
                >
                    <path d="m12 19-7-7 7-7" />
                    <path d="M19 12H5" />
                </svg>
            </button>
            <button
                on:click={handleNext}
                class="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 dark:hover:bg-[#ff5151] flex items-center justify-center group hover:bg-[#ff5151] hover:text-white transition-all duration-300"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    class="h-5 w-5 group-hover:-rotate-12 transition-transform duration-300"
                    stroke-linejoin="round"
                >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                </svg>
            </button>
        </div>
    {/if}
</div>

<svelte:window 
    on:keydown={e => {
        if (!isGridView) {
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        }
    }}
/>