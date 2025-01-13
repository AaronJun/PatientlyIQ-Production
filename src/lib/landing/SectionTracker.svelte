
<script lang="ts">
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    
    export let activeSection: string;
    export let hamburgerMenuIsOpen: boolean = false;
    export let onSectionClick: (sectionId: string) => void;
    
    let isScrolled = false;
    let scrollTimeout: NodeJS.Timeout;

	const sections = [
    {
        id: 'hero',
        number: '01',
        label: 'PatientlyIQ'
    },
    {
        id: 'data-sources',
        number: '02',
        label: 'Comprehesive Data'
    },
    {
        id: 'use-cases',
        number: '03',
        label: 'Use Cases'
    },
    {
        id: 'analysis',
        number: '04',
        label: 'Capabilities'
    },
    {
        id: 'contact',
        number: '05',
        label: 'Contact us'
    }
];

    onMount(() => {
        const handleScroll = () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            
            // Set scrolled state when scrolling past threshold
            isScrolled = currentScroll > 50;

            // Clear existing timeout
            clearTimeout(scrollTimeout);

            // Set new timeout to revert to full size when scrolling stops
            scrollTimeout = setTimeout(() => {
                isScrolled = false;
            }, 150);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout) clearTimeout(scrollTimeout);
        };
    });
</script>

<div 
    class="fixed pl-8 w-full bg-white/80 backdrop-blur-xl dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out z-30"
    class:py-2={isScrolled}
    class:py-4={!isScrolled}
    style="top: {isScrolled ? '48px' : '64px'}"
>
    <!-- Desktop Navigation -->
    <div class="hidden md:block container">
        <nav class="h-full">
            <ul class="flex items-center space-x-8 h-full">
                {#each sections as section}
                    <li>
                        <button
                            on:click={() => onSectionClick(section.id)}
                            class="group flex items-center space-x-2 text-xs transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 px-2 py-1 rounded-md"
                        >
                            <span class="font-mono transition-colors duration-300 {activeSection === section.id ? 'text-[#ff5151]' : 'text-gray-500 group-hover:text-[#ff5151]'}">
							{section.number}
                            </span>
                            <span class="font-mono transition-colors duration-300 {activeSection === section.id ? 'text-[#ff5151]' : 'text-gray-500 group-hover:text-[#ff5151]'}">
                                {section.label}
                            </span>
                        </button>
                    </li>
                {/each}
            </ul>
        </nav>
    </div>

    <!-- Mobile Navigation -->
    {#if hamburgerMenuIsOpen}
        <div
            class="absolute left-0 w-full bg-white dark:bg-gray-700 md:hidden"
            transition:fly={{ y: -20, duration: 200 }}
        >
            <nav class="container py-4">
                {#each sections as section}
                    <button
                        on:click={() => onSectionClick(section.id)}
                        class="w-full text-left py-2 px-4 text-sm font-mono transition-colors duration-300 {activeSection === section.id ? 'text-[#ff5151]' : 'text-gray-500 hover:text-[#ff5151]'}"
                    >
                        <span class="mr-2">{section.number}</span>
                        {section.label}
                    </button>
                {/each}
            </nav>
        </div>
    {/if}
</div>

<style>
    /* Smooth transitions for all changes */
    .transition-all {
        transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Smooth transitions for color changes */
    .text-gray-500 {
        transition: color 1s ease-in-out;
    }

    /* Add smooth transition for mobile menu */
    nav button {
        transition: all 1s ease-in-out;
    }

    /* Subtle hover effect for navigation items */
    nav button:hover {
        background-color: rgba(0, 0, 0, 0.0);
    }
</style>