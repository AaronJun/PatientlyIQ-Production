<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    // Props
    export let content = '';
    
    // Main content container
    let contentContainer;
    
    // Navigation state
    let sections = [];
    let currentSection = null;
    let currentSubsection = null;
    let isMobileView = false;
    let showMobileMenu = false;
    
    // Find all sections and subsections in the paper
    function extractSections() {
        if (!contentContainer) return [];
        
        const h1Elements = contentContainer.querySelectorAll('h1');
        const extractedSections = [];
        
        h1Elements.forEach((h1, index) => {
            // Skip References section from navigation but keep its ID
            if (h1.textContent === 'References') {
                h1.id = `section-references`;
                return;
            }
            
            const sectionId = `section-${index}`;
            h1.id = sectionId;
            
            const subsections = [];
            let nextElement = h1.nextElementSibling;
            
            while (nextElement && nextElement.tagName !== 'H1') {
                if (nextElement.tagName === 'H3') {
                    const subsectionId = `subsection-${index}-${subsections.length}`;
                    nextElement.id = subsectionId;
                    
                    subsections.push({
                        id: subsectionId,
                        title: nextElement.textContent,
                        element: nextElement
                    });
                }
                nextElement = nextElement.nextElementSibling;
            }
            
            extractedSections.push({
                id: sectionId,
                title: h1.textContent,
                element: h1,
                subsections
            });
        });
        
        return extractedSections;
    }
    
    // Scroll to a specific section or subsection
    function scrollToElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Close mobile menu after navigation
            if (isMobileView) {
                showMobileMenu = false;
            }
        }
    }
    
    // Determine the active section based on scroll position
    function updateActiveSection() {
        if (!sections.length) return;
        
        // Get positions of all sections and subsections
        const positions = [];
        
        sections.forEach(section => {
            if (section.element) {
                positions.push({
                    id: section.id,
                    type: 'section',
                    top: section.element.getBoundingClientRect().top
                });
            }
            
            section.subsections.forEach(subsection => {
                if (subsection.element) {
                    positions.push({
                        id: subsection.id,
                        parentId: section.id,
                        type: 'subsection',
                        top: subsection.element.getBoundingClientRect().top
                    });
                }
            });
        });
        
        // Find the section closest to the top of the viewport
        const activePosition = positions
            .filter(pos => pos.top <= 100) // Elements above or near the top of viewport
            .sort((a, b) => b.top - a.top)[0]; // Get the closest one
        
        if (activePosition) {
            if (activePosition.type === 'section') {
                currentSection = activePosition.id;
                currentSubsection = null;
            } else {
                currentSection = activePosition.parentId;
                currentSubsection = activePosition.id;
            }
        } else if (positions.length > 0) {
            // If no section is near the top (we're at the beginning), activate the first one
            currentSection = positions[0].type === 'section' ? positions[0].id : positions[0].parentId;
            currentSubsection = positions[0].type === 'subsection' ? positions[0].id : null;
        }
    }
    
    // Handle scroll events
    function handleScroll() {
        updateActiveSection();
    }
    
    // Check window size for responsive layout
    function checkWindowSize() {
        isMobileView = window.innerWidth < 768;
    }
    
    // Toggle mobile menu
    function toggleMobileMenu() {
        showMobileMenu = !showMobileMenu;
    }
    
    // Monitor content changes
    $: {
        if (content && contentContainer) {
            // Small timeout to ensure DOM is updated after content changes
            setTimeout(() => {
                sections = extractSections();
                updateActiveSection();
            }, 100);
        }
    }
    
    // Lifecycle hooks
    onMount(() => {
        // Initialize
        checkWindowSize();
        
        // Initial load of sections if content already exists
        if (content) {
            setTimeout(() => {
                sections = extractSections();
                updateActiveSection();
            }, 100);
        }
        
        // Set up event listeners
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', checkWindowSize);
        
        // Cleanup on unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', checkWindowSize);
        };
    });
</script>

<div class="paper-navigator">
    <!-- Header with toggle button for mobile -->
    <header class="fixed z-10 top-0 left-0 right-0 bg-white shadow-md border-b border-slate-200 p-4">
        <div class="flex justify-between items-center max-w-7xl mx-auto">
            <h1 class="text-lg font-serif text-slate-800">
                {sections.length > 0 && sections[0].title !== 'Abstract' && sections[0].title !== '' 
                  ? sections[0].title 
                  : (sections.length > 1 ? sections[1].title : 'Priority Review Vouchers')}
            </h1>
            
            {#if isMobileView}
                <button 
                    class="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                    on:click={toggleMobileMenu}
                    aria-label="Toggle navigation menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
                        {#if showMobileMenu}
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        {:else}
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        {/if}
                    </svg>
                </button>
            {/if}
        </div>
    </header>
    
    <!-- Main layout -->
    <div class="pt-16 flex max-w-7xl mx-auto">
        <!-- Sidebar (desktop) or dropdown (mobile) -->
        {#if isMobileView}
            {#if showMobileMenu}
                <div 
                    class="fixed z-10 top-16 left-0 right-0 bg-white shadow-lg border-b border-slate-200 overflow-y-auto max-h-[70vh]"
                    transition:fade={{ duration: 150 }}
                >
                    <nav class="p-4">
                        <ul class="space-y-4">
                            {#each sections as section}
                                <li>
                                    <button 
                                        class="text-left w-full font-medium py-1 px-2 rounded-md text-slate-800 hover:bg-slate-100 
                                              {currentSection === section.id ? 'bg-slate-100 text-orange-600' : ''}"
                                        on:click={() => scrollToElement(section.id)}
                                    >
                                        {section.title}
                                    </button>
                                    
                                    {#if section.subsections.length > 0}
                                        <ul class="ml-4 mt-2 space-y-2">
                                            {#each section.subsections as subsection}
                                                <li>
                                                    <button 
                                                        class="text-left w-full text-sm py-1 px-2 rounded-md hover:bg-slate-100 
                                                              {currentSubsection === subsection.id ? 'text-orange-600' : 'text-slate-600'}"
                                                        on:click={() => scrollToElement(subsection.id)}
                                                    >
                                                        {subsection.title}
                                                    </button>
                                                </li>
                                            {/each}
                                        </ul>
                                    {/if}
                                </li>
                            {/each}
                        </ul>
                    </nav>
                </div>
            {/if}
        {:else}
            <!-- Desktop sidebar -->
            <aside class="w-64 fixed h-[calc(100vh-4rem)] overflow-y-auto pt-4 pb-16 pl-4 pr-2 hidden md:block border-r border-slate-100">
                <nav>
                    <ul class="space-y-4">
                        {#each sections as section}
                            <li>
                                <button 
                                    class="text-left w-full font-medium py-1 px-2 rounded-md hover:bg-slate-100 
                                          {currentSection === section.id ? 'text-orange-600 bg-orange-50 border-l-2 border-orange-500' : 'text-slate-800'}"
                                    on:click={() => scrollToElement(section.id)}
                                >
                                    {section.title}
                                </button>
                                
                                {#if section.subsections.length > 0}
                                    <ul class="ml-4 mt-2 space-y-2">
                                        {#each section.subsections as subsection}
                                            <li>
                                                <button 
                                                    class="text-left w-full text-sm py-1 px-2 rounded-md hover:bg-slate-100 
                                                          {currentSubsection === subsection.id ? 'text-orange-600 bg-orange-50' : 'text-slate-600'}"
                                                    on:click={() => scrollToElement(subsection.id)}
                                                >
                                                    {subsection.title}
                                                </button>
                                            </li>
                                        {/each}
                                    </ul>
                                {/if}
                            </li>
                        {/each}
                    </ul>
                </nav>
            </aside>
        {/if}
        
        <!-- Main content -->
        <main class="w-full md:ml-64 px-4 md:px-8 pt-4 pb-16">
            <div bind:this={contentContainer} class="prose prose-slate max-w-none">
                <!-- Paper content -->
                {@html content}
            </div>
        </main>
    </div>
    
            <!-- Progress indicator (small dots at bottom for mobile) -->
    {#if isMobileView}
        <div class="fixed bottom-4 left-0 right-0 flex justify-center">
            <div class="bg-slate-100 rounded-full px-3 py-1 flex space-x-1 shadow-md">
                {#each sections as section, i}
                    <button 
                        class="w-2 h-2 rounded-full {currentSection === section.id ? 'bg-orange-500' : 'bg-slate-300'}"
                        on:click={() => scrollToElement(section.id)}
                        title={section.title}
                    ></button>
                {/each}
            </div>
        </div>
    {:else}
        <!-- Floating back-to-top button for desktop -->
        <button 
            class="fixed bottom-6 right-6 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-colors"
            on:click={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        </button>
    {/if}
</div>

<style>
    .paper-navigator {
        position: relative;
        min-height: 100vh;
    }
    
    :global(h1, h3) {
        scroll-margin-top: 5rem;
    }
    
    /* Additional typography styling for paper content */
    :global(.prose h1) {
        font-weight: 700;
        font-size: 1.75rem;
        margin-top: 2.5rem;
        margin-bottom: 1.5rem;
        color: #1e293b;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #e2e8f0;
        font-family: 'IBM Plex Sans', system-ui, sans-serif;
    }
    
    :global(.prose h3) {
        font-weight: 600;
        font-size: 1.25rem;
        margin-top: 2rem;
        margin-bottom: 1rem;
        color: #334155;
        font-family: 'IBM Plex Sans', system-ui, sans-serif;
    }
    
    :global(.prose p) {
        margin-top: 1rem;
        margin-bottom: 1rem;
        line-height: 1.7;
        font-family: 'IBM Plex Serif', serif;
        color: #334155;
    }
    
    :global(.prose a) {
        color: #f97316;
        text-decoration: none;
        transition: color 0.2s;
    }
    
    :global(.prose a:hover) {
        color: #ea580c;
        text-decoration: underline;
    }
    
    :global(.prose sup) {
        font-size: 0.75em;
        vertical-align: super;
    }
    
    :global(.prose b, .prose strong) {
        font-weight: 600;
        color: #0f172a;
    }
    
    :global(.prose i, .prose em) {
        font-style: italic;
    }
    
    :global(.prose ul) {
        list-style-type: disc;
        margin-left: 1.5rem;
    }
    
    :global(.prose ol) {
        list-style-type: decimal;
        margin-left: 1.5rem;
    }
</style>