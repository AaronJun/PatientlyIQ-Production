<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { fade, fly, slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import MarkdownIt from 'markdown-it';
    import { writable } from 'svelte/store';
    
    // Create a markdown parser with custom rendering
    const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true
    });
    
    // Custom renderer for footnotes
    md.renderer.rules.footnote_ref = (tokens, idx, options, env, slf) => {
        const id = tokens[idx].meta.id;
        return `<sup class="footnote-ref cursor-pointer text-emerald-600 hover:text-emerald-800" id="fnref${id}" data-footnote="${id}">[${id}]</sup>`;
    };
    
    // Fetch the markdown content
    let caseStudyContent = '';
    let sections = [];
    let activeSection = 0;
    let sidebarOpen = true;
    
    // Progress tracking
    let readSections = writable(new Set());
    
    // Footnotes handling
    let footnotes = {};
    let activeFootnote = null;
    
    onMount(async () => {
        try {
            const response = await fetch('/static/research/SareptaCaseStudy.md');
            caseStudyContent = await response.text();
            
            // Parse the markdown content into sections
            parseSections(caseStudyContent);
            
            // Set up footnote click handlers after content is rendered
            setTimeout(() => {
                setupFootnoteHandlers();
            }, 500);
        } catch (error) {
            console.error('Failed to load case study:', error);
        }
    });
    
    function setupFootnoteHandlers() {
        // Add click handlers to footnote references
        const footnoteRefs = document.querySelectorAll('.footnote-ref');
        footnoteRefs.forEach(ref => {
            ref.addEventListener('click', (e) => {
                const footnoteId = ref.getAttribute('data-footnote');
                showFootnote(footnoteId);
            });
        });
    }
    
    function showFootnote(id) {
        // Toggle active footnote
        activeFootnote = activeFootnote === id ? null : id;
    }
    
    function parseSections(content) {
        // Extract footnotes from the content
        const footnoteRegex = /\[\^(\d+)\]: (.*?)(?=\n\[\^|$)/gs;
        let match;
        
        while ((match = footnoteRegex.exec(content)) !== null) {
            const id = match[1];
            const text = match[2].trim();
            footnotes[id] = text;
        }
        
        // Clean content from footnote definitions
        content = content.replace(/\[\^(\d+)\]: .*?(?=\n\[\^|$)/gs, '');
        
        // Add footnote references
        content = content.replace(/\[\^(\d+)\]/g, (match, id) => {
            return `<sup class="footnote-ref" id="fnref${id}" data-footnote="${id}">[${id}]</sup>`;
        });
        
        // Split by headers (# for major sections)
        const lines = content.split('\n');
        const sectionMap = [];
        let currentSection = { title: '', content: '', id: '' };
        
        lines.forEach(line => {
            if (line.startsWith('# ')) {
                // If we have content in the current section, add it to the map
                if (currentSection.title) {
                    sectionMap.push({ ...currentSection });
                }
                
                // Start a new section
                const title = line.replace('# ', '');
                const id = title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
                currentSection = { 
                    title, 
                    content: line + '\n', 
                    id
                };
            } else {
                // Add this line to the current section
                currentSection.content += line + '\n';
            }
        });
        
        // Add the last section
        if (currentSection.title) {
            sectionMap.push({ ...currentSection });
        }
        
        sections = sectionMap;
    }
    
    function setActiveSection(index) {
        activeSection = index;
        updateReadStatus(index);
        
        // Reset active footnote when changing sections
        activeFootnote = null;
        
        // Setup footnote handlers after section change
        setTimeout(() => {
            setupFootnoteHandlers();
        }, 200);
    }
    
    function updateReadStatus(index) {
        readSections.update(set => {
            set.add(index);
            return set;
        });
    }
    
    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }
    
    // Calculate reading progress
    $: readingProgress = $readSections.size / sections.length * 100;
</script>

<div class="case-studies-container flex flex-col md:flex-row h-full">
    <!-- Sidebar toggle for mobile -->
    <button 
        class="md:hidden p-2 bg-slate-800 text-white mb-2 rounded"
        on:click={toggleSidebar}
    >
        {sidebarOpen ? 'Hide' : 'Show'} Navigation
    </button>

    <!-- Sidebar -->
    <aside 
        class="sidebar {sidebarOpen ? 'block' : 'hidden'} md:block bg-slate-800 text-white w-full md:w-64 md:min-w-64 overflow-y-auto p-4 md:h-[calc(100vh-200px)]"
        transition:slide={{ duration: 300 }}
    >
        <div class="mb-6">
            <h2 class="text-xl font-bold">Case Study: Sarepta</h2>
            <div class="mt-2 bg-slate-700 rounded-full h-2">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: {readingProgress}%"></div>
            </div>
            <p class="text-xs mt-1">Reading progress: {Math.round(readingProgress)}%</p>
        </div>
        
        <nav>
            <ul class="space-y-1">
                {#each sections as section, i}
                    <li>
                        <button 
                            class="w-full text-left p-2 rounded transition-colors text-sm {i === activeSection ? 'bg-emerald-600 text-white' : $readSections.has(i) ? 'bg-slate-700' : 'hover:bg-slate-700'}"
                            on:click={() => setActiveSection(i)}
                        >
                            {section.title}
                            {#if $readSections.has(i)}
                                <span class="ml-2 text-emerald-300">✓</span>
                            {/if}
                        </button>
                    </li>
                {/each}
            </ul>
        </nav>
    </aside>
    
    <!-- Main content -->
    <main 
        class="content flex-1 p-4 md:p-6 overflow-y-auto md:h-[calc(100vh-200px)] bg-white"
        in:fade={{ duration: 200 }}
    >
        {#if sections.length > 0 && activeSection < sections.length}
            <article class="prose prose-slate max-w-none">
                {@html md.render(sections[activeSection].content)}
                
                <!-- Footnotes popup -->
                {#if activeFootnote && footnotes[activeFootnote]}
                    <div 
                        class="fixed bottom-16 left-1/2 transform -translate-x-1/2 w-11/12 md:w-3/4 lg:w-1/2 bg-white border border-slate-200 rounded-lg shadow-lg p-4 z-50"
                        transition:slide={{ duration: 200 }}
                    >
                        <button 
                            class="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                            on:click={() => activeFootnote = null}
                        >
                            ✕
                        </button>
                        <h4 class="text-sm font-semibold text-slate-600 mb-2">Reference [{activeFootnote}]</h4>
                        <p class="text-sm">{footnotes[activeFootnote]}</p>
                    </div>
                {/if}
            </article>
            
            <!-- References section if this is the last section -->
            {#if activeSection === sections.length - 1}
                <div class="mt-8 pt-4 border-t border-slate-200">
                    <h3 class="text-lg font-semibold text-slate-700">References</h3>
                    <ul class="mt-4 space-y-2">
                        {#each Object.entries(footnotes) as [id, text]}
                            <li class="text-sm text-slate-600" id="fn{id}">
                                <span class="text-emerald-600 font-medium">[{id}]</span> {text}
                            </li>
                        {/each}
                    </ul>
                </div>
            {/if}
            
            <div class="flex justify-between mt-8 pt-4 border-t border-slate-200">
                <button 
                    class="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={activeSection === 0}
                    on:click={() => setActiveSection(activeSection - 1)}
                >
                    Previous Section
                </button>
                
                <button 
                    class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={activeSection === sections.length - 1}
                    on:click={() => setActiveSection(activeSection + 1)}
                >
                    Next Section
                </button>
            </div>
        {:else}
            <div class="flex justify-center items-center h-full">
                <p class="text-slate-500">Loading case study...</p>
            </div>
        {/if}
    </main>
</div>

<style>
    .case-studies-container {
        height: calc(100vh - 200px);
    }
    
    @media (max-width: 768px) {
        .case-studies-container {
            height: auto;
        }
    }
    
    /* Style markdown content */
    :global(.prose h1) {
        font-size: 1.8rem;
        margin-top: 0;
        color: #1e293b;
        font-weight: 700;
    }
    
    :global(.prose h2) {
        font-size: 1.4rem;
        margin-top: 2rem;
        color: #334155;
        font-weight: 600;
    }
    
    :global(.prose h3) {
        font-size: 1.2rem;
        margin-top: 1.5rem;
        color: #475569;
        font-weight: 600;
    }
    
    :global(.prose strong) {
        font-weight: 600;
        color: #334155;
    }
    
    :global(.prose p) {
        margin-bottom: 1rem;
        line-height: 1.6;
    }
    
    :global(.prose ul) {
        margin-bottom: 1rem;
    }
    
    :global(.footnote-ref) {
        cursor: pointer;
        color: #059669;
        font-weight: 500;
    }
    
    :global(.footnote-ref:hover) {
        text-decoration: underline;
    }
</style>

