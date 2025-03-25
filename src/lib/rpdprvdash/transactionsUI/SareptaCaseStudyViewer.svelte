<script lang="ts">
    import { onMount } from 'svelte';
    import SvelteMarkdown from 'svelte-markdown';
    import { writable } from 'svelte/store';
    import { fade, slide } from 'svelte/transition';
    
    // Define section interface
    interface Section {
        id: string;
        title: string;
        content: string;
    }
    
    // State
    let isLoading = true;
    let error: string | null = null;
    let markdown = '';
    let sections: Section[] = [];
    let currentSectionIndex = 0;
    let currentSection: Section | null = null;
    let sidebarOpen = true;
    
    // Track read sections
    const readSections = writable<Set<number>>(new Set());
    
    // Fetch markdown from static file
    async function fetchMarkdown() {
        try {
            const response = await fetch('/static/research/SareptaCaseStudy.md');
            if (!response.ok) {
                throw new Error(`Failed to fetch markdown: ${response.status}`);
            }
            
            return await response.text();
        } catch (err) {
            console.error('Error fetching markdown:', err);
            throw err;
        }
    }
    
    // Extract sections from markdown content
    function extractSections(content: string): Section[] {
        const extractedSections: Section[] = [];
        
        // Split the content by headings
        const sectionRegex = /^# (.+)$/gm;
        let matches = [...content.matchAll(sectionRegex)];
        
        // For debugging
        console.log(`Found ${matches.length} section headings`);
        
        // If no sections are found, create a default one
        if (matches.length === 0) {
            extractedSections.push({
                id: 'content',
                title: 'Case Study',
                content: content
            });
            return extractedSections;
        }
        
        // Handle content before the first heading if it exists
        if (matches.length > 0 && matches[0].index > 0) {
            const introContent = content.substring(0, matches[0].index).trim();
            if (introContent) {
                extractedSections.push({
                    id: 'introduction',
                    title: 'Introduction',
                    content: introContent
                });
            }
        }
        
        // Process each section
        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const title = match[1].trim();
            const id = `section-${i}`;
            const startPos = match.index;
            
            // Determine section end position
            let endPos = content.length;
            if (i < matches.length - 1) {
                endPos = matches[i + 1].index;
            }
            
            // Extract this section's content
            const sectionContent = content.substring(startPos, endPos);
            
            extractedSections.push({
                id,
                title,
                content: sectionContent
            });
        }
        
        console.log("Extracted sections:", extractedSections.map(s => s.title));
        return extractedSections;
    }
    
    function loadSection(index: number) {
        if (index >= 0 && index < sections.length) {
            currentSectionIndex = index;
            currentSection = sections[index];
            
            // Mark as read
            readSections.update(set => {
                set.add(index);
                return set;
            });
            
            // Scroll to top
            window.scrollTo(0, 0);
        }
    }
    
    function goToNextSection() {
        if (currentSectionIndex < sections.length - 1) {
            loadSection(currentSectionIndex + 1);
        }
    }
    
    function goToPreviousSection() {
        if (currentSectionIndex > 0) {
            loadSection(currentSectionIndex - 1);
        }
    }
    
    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }
    
    // Handle loading on mount
    onMount(async () => {
        try {
            isLoading = true;
            
            // First try fetching the markdown
            let content;
            try {
                content = await fetchMarkdown();
                console.log("Fetched markdown content, length:", content.length);
            } catch (fetchError) {
                console.error("Failed to fetch markdown:", fetchError);
                
                // Try importing as a fallback
                try {
                    const module = await import('/static/research/SareptaCaseStudy.md?raw');
                    content = module.default;
                    console.log("Imported markdown content, length:", content.length);
                } catch (importError) {
                    console.error("Failed to import markdown:", importError);
                    throw new Error("Could not load case study content");
                }
            }
            
            // Process the markdown
            if (content) {
                markdown = content;
                sections = extractSections(content);
                console.log(`Extracted ${sections.length} sections:`, sections.map(s => s.title));
                
                if (sections.length > 0) {
                    loadSection(0);
                } else {
                    throw new Error("No sections found in the case study");
                }
            } else {
                throw new Error("Empty case study content");
            }
        } catch (err: any) {
            console.error(err);
            error = err.message || "Failed to load case study";
        } finally {
            isLoading = false;
        }
    });
    
    // Calculate reading progress
    $: readingProgress = sections.length 
        ? Math.round(($readSections.size / sections.length) * 100)
        : 0;
    
    // Custom renderers for markdown - types are simplified for now
    // @ts-ignore
    const renderers = {
        // @ts-ignore
        link: (node) => ({
            tag: 'a',
            attrs: {
                href: node.href || '#',
                target: '_blank',
                rel: 'noopener noreferrer',
                class: 'text-blue-600 hover:text-blue-800 underline'
            },
            children: node.children || []
        }),
        // @ts-ignore
        strong: (node) => ({
            tag: 'strong',
            attrs: {
                class: 'font-bold text-gray-900'
            },
            children: node.children || []
        }),
        // @ts-ignore
        heading: (node) => {
            // For h1, create a nicer styled header
            if (node.depth === 1) {
                return {
                    tag: 'h1',
                    attrs: {
                        class: 'text-2xl font-bold text-gray-900 mb-6 mt-2'
                    },
                    children: node.children || []
                };
            }
            
            // Default handling for other headings
            const depth = node.depth || 2;
            return {
                tag: `h${depth}`,
                attrs: {
                    class: `text-${Math.max(1, 4 - depth)}xl font-semibold text-gray-800 mt-6 mb-4`
                },
                children: node.children || []
            };
        }
    };
</script>

<div class="flex flex-col md:flex-row h-full bg-gray-100">
    <!-- Mobile navigation toggle -->
    <div class="md:hidden p-2 bg-gray-800">
        <button 
            class="w-full px-4 py-2 text-white bg-blue-600 rounded"
            on:click={toggleSidebar}
        >
            {sidebarOpen ? 'Hide' : 'Show'} Sections
        </button>
    </div>
    
    <!-- Sidebar -->
    {#if sidebarOpen}
    <aside 
        class="w-full md:w-64 bg-gray-800 text-white overflow-y-auto p-4 md:h-screen"
        transition:slide={{duration: 200}}
    >
        <div class="mb-6">
            <h2 class="text-xl font-bold">Sarepta Therapeutics</h2>
            <p class="text-gray-300 text-sm">Case Study</p>
            
            <!-- Progress bar -->
            <div class="mt-4 w-full bg-gray-600 rounded-full h-2.5">
                <div 
                    class="bg-blue-600 h-2.5 rounded-full" 
                    style="width: {readingProgress}%">
                </div>
            </div>
            <p class="text-xs text-gray-400 mt-1">{readingProgress}% Complete</p>
        </div>
        
        <!-- Section navigation -->
        <nav>
            <ul class="space-y-1">
                {#each sections as section, index}
                    <li>
                        <button 
                            class="w-full text-left p-2 rounded {index === currentSectionIndex 
                                ? 'bg-blue-600 text-white' 
                                : $readSections.has(index) 
                                    ? 'bg-gray-700 text-gray-200' 
                                    : 'hover:bg-gray-700 text-gray-300'}"
                            on:click={() => loadSection(index)}
                        >
                            {section.title}
                            {#if $readSections.has(index)}
                                <span class="ml-2 text-xs">✓</span>
                            {/if}
                        </button>
                    </li>
                {/each}
            </ul>
        </nav>
    </aside>
    {/if}
    
    <!-- Main content -->
    <main class="flex-1 p-4 md:p-8 overflow-y-auto md:h-screen">
        {#if isLoading}
            <div class="flex items-center justify-center h-full">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        {:else if error}
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p class="font-bold">Error</p>
                <p>{error}</p>
            </div>
        {:else if currentSection}
            <div class="max-w-3xl mx-auto bg-white shadow rounded-lg p-6 md:p-8" transition:fade={{duration: 150}}>
                <SvelteMarkdown source={currentSection.content} {renderers} />
                
                <!-- Navigation buttons -->
                <div class="flex justify-between mt-8 pt-4 border-t border-gray-200">
                    <button 
                        class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={currentSectionIndex === 0}
                        on:click={goToPreviousSection}
                    >
                        Previous Section
                    </button>
                    
                    <button 
                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={currentSectionIndex === sections.length - 1}
                        on:click={goToNextSection}
                    >
                        Next Section
                    </button>
                </div>
            </div>
        {:else}
            <div class="text-center text-gray-500">
                No section selected
            </div>
        {/if}
    </main>
</div>

<style>
    /* Set full height for the component */
    :global(html, body) {
        height: 100%;
        margin: 0;
        padding: 0;
    }
    
    /* Style the markdown content */
    :global(.prose p) {
        margin-bottom: 1rem;
        line-height: 1.6;
    }
    
    :global(.prose ul) {
        list-style-type: disc;
        padding-left: 1.5rem;
        margin-bottom: 1rem;
    }
    
    :global(.prose ol) {
        list-style-type: decimal;
        padding-left: 1.5rem;
        margin-bottom: 1rem;
    }
</style> 