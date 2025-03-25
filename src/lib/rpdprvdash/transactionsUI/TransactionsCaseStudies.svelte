<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { fade, fly, slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import SvelteMarkdown from 'svelte-markdown';
    import { writable } from 'svelte/store';
    import TransactionsCaseStudiesTitle from './TransactionsCaseStudiesTitle.svelte';
    
    // Define interfaces for better type safety
    interface Section {
        title: string;
        content: string;
        id: string;
    }
    
    interface FootnotesMap {
        [key: string]: string;
    }
    
    // Fallback content if fetch fails
    const FALLBACK_CONTENT = `# Form Catalyst to Enduring Impact: The Evolution and Future of Priority Review Vouchers for Rare Pediatric Diseases

# Abstract
This paper examines the impact of the FDA's Priority Review Voucher (PRV) program on drug development for rare pediatric diseases and neglected tropical diseases. Through analysis of regulatory outcomes, economic trends, and case studies, we evaluate the program's effectiveness in stimulating innovation, its effects on drug pricing and patient access, and its relationship to other pharmaceutical incentives. While PRVs have successfully contributed to bringing dozens of novel therapies to market for previously untreatable conditions, challenges persist regarding the sustainability of high drug prices and ensuring equitable access. The paper concludes with policy recommendations for optimizing this market-based incentive mechanism to better balance innovation with affordability and public health impact.

# 1. Introduction: Influence on R&D Investment Decisions
The central rationale of Priority Review Vouchers (PRVs) is to motivate drug developers to invest in R&D for diseases they might otherwise ignore. After over a decade of experience, the evidence on how PRVs influence the drug development pipeline shows both promise and limitations. Empirical studies and reviews have found **little or no measurable effect** of the PRV programs on the overall rate of new drug development for targeted diseases. For example, a 2020 GAO report noted that few rigorous studies exist, and those that do failed to show a clear increase in development activity attributable solely to PRVs. [^1] Much of the rare disease innovation of the past decade can also be credited to the Orphan Drug Act incentives and scientific advances like gene therapy, making it difficult to isolate the PRV program's impact. However, **qualitative evidence suggests PRVs are indeed a factor in companies' strategic decisions**. In interviews with seven drug sponsors who had pursued qualifying drugs, all seven indicated the possibility of earning a PRV was considered in their development plans; six described it as *one of several factors* tipping the cost-benefit calculus, and one sponsor even called a PRV "pivotal" to its decision to develop a particular drug. This sentiment was echoed by industry executives, especially for small biotech firms: the prospect of selling a voucher for tens of millions can meaningfully improve the expected return on investment for a low-revenue disease area. [^2]

# 2. Case Study – Sarepta Therapeutics
*Sarepta Therapeutics* provides a telling example of how PRVs can shape a company's pipeline and financial trajectory. Sarepta is a biotech firm specializing in genetic medicines for rare neuromuscular diseases, notably **Duchenne Muscular Dystrophy (DMD)**.[^7] DMD is a fatal genetic disorder affecting young boys – exactly the type of rare pediatric condition targeted by the PRV program. Over the past decade, Sarepta has developed multiple DMD therapies, and in doing so it has amassed **four** rare pediatric PRVs – the most for any single company.[^8] These vouchers were awarded upon FDA approvals of: *Exondys 51* (2016), *Vyondys 53* (2019), *Amondys 45* (2021), and *Elevidys* (delandistrogene moxeparvovec, 2023). Each of these drugs addressed a different subset of DMD patients (distinguished by genetic mutation type or therapy modality), and each qualified as a novel treatment for a rare pediatric disease. Sarepta strategically leveraged the PRV incentive in at least two ways:

## 2.1 Monetizing Vouchers for R&D Capital
Sarepta has opted to sell its PRVs for large sums, then reinvest the proceeds to fund its pipeline. For example, in July 2023 Sarepta sold the voucher earned from Elevidys' approval for $102 million in cash.[^9] Management explicitly stated that *"Sarepta will invest proceeds from the sale of the PRV into our R&D efforts to support the development of more transformative therapies"*.
In other words, the voucher acted as a **de facto financing mechanism**, providing non-dilutive cash that can be poured into the next wave of gene therapy and RNA-based drug programs (Sarepta has over 40 programs in development [^9]).
Similarly, Sarepta sold a prior voucher (from Vyondys 53) reportedly for around $108 million in 2020,[^10] and another (from Amondys 45) for an undisclosed sum around that time. Cumulatively, Sarepta may have generated on the order of $300–400 million from voucher sales over a few years, substantially bolstering its war chest. This capital has likely enabled the company to pursue expensive clinical trials (e.g., systemic gene therapies, gene editing projects) that otherwise would have required additional stock offerings or partnerships. In essence, PRVs have become part of Sarepta's **business model**, turning successful rare disease approvals into immediate funding for future research.

## 2.2 Pipeline Expansion and Acceleration
The availability of PRVs has reinforced Sarepta's focus on rare pediatric indications. The company's leadership in DMD therapies was driven by scientific opportunity, but the PRV program provided an extra incentive to tackle multiple subtypes of the disease in succession. Each time Sarepta developed a therapy targeting a new DMD mutation (e.g., exon-skipping drugs for different exons), the possibility of another voucher (and its sale) added to the project's expected value. This might have encouraged Sarepta to invest in therapies like Amondys 45 or Vyondys 53, which have relatively small patient sub-populations, knowing that a PRV could be earned. Moreover, Sarepta reportedly acquired a PRV on the open market in one case to accelerate approval of another gene therapy (for limb-girdle muscular dystrophy) – though that product has not yet reached filing. The net effect is that Sarepta's development pipeline has been very *PRV-focused*, concentrating on rare pediatric neuromuscular diseases where each success yields both a new drug *and* a voucher. From an investor perspective, this strategy has had mixed reception. On one hand, the repeated monetization of PRVs has provided substantial cash inflows, which is a positive for a pre-profit biotech. On the other hand, Sarepta's **stock performance** has been swayed more by the scientific and regulatory outcomes of its drugs than by one-time voucher sales. For instance, in 2023, Sarepta's share price was down about *13.7% year-to-date* by early July (versus a 10.2% decline in the biotech industry index)[^11] despite the FDA's accelerated approval of Elevidys and the impending $102M voucher sale. This dip was largely due to investor concerns over Elevidys' clinical data and narrow advisory committee vote.[^12] The stock did tick up on news of the PRV sale (since it strengthens the balance sheet), but the market typically prices in expected voucher revenue once a company's application is approved. In summary, Sarepta's case demonstrates that **PRVs can significantly affect a company's R&D funding and portfolio choices**, enabling it to undertake more projects in rare diseases. However, the ultimate success and value creation still depend on the drugs' efficacy, approvals, and uptake – the PRV is a helpful boost, not a guarantee of profitability. Sarepta's aggressive pursuit of DMD therapies, aided by PRVs, has benefitted patients by bringing multiple DMD drugs to market (7 different DMD treatments have been approved industry-wide, spanning Sarepta and others[^13]). It also illustrates a virtuous cycle intended by policymakers: reward reinvestment so that one breakthrough begets another. At the same time, critics note that Sarepta's therapies (like others earning PRVs) are extremely expensive, raising issues addressed in the next section.

# 3. Economic and Pricing Trends of PRV-Awarded Drugs
## 3.1 High Pricing of PRV-Earning Drugs
Drugs that earn priority review vouchers are often **orphan products or novel therapies** in areas with little to no competition – factors that typically lead to high launch prices. Indeed, a consistent trend is that PRV-awarded drugs carry premium pricing, frequently drawing scrutiny for affordability. Many are gene therapies, biologics, or specialized small-molecules with development costs that companies seek to recoup from a tiny patient population. As a result, *"remedies for rare diseases are typically exorbitantly priced to recoup development costs"*.[^14] For example, **Elevidys**, the DMD gene therapy approved in 2023 that earned Sarepta a PRV, was priced at **$3.2 million** for a one-time dose.[^15] This makes Elevidys one of the most expensive drugs in the world, second only to a hemophilia gene therapy priced at $3.5 million.[^16] Similarly, Bluebird Bio's gene therapies – **Zynteglo** for beta-thalassemia and **Skysona** for cerebral ALD, each of which earned a PRV in 2022 – launched at around $2.8 million and $3.0 million respectively. Even non-gene-therapy voucher drugs often come at high cost: **Spinraza**, the first SMA treatment (PRV in 2016), costs about $750,000 in the first year and ~$375,000 annually thereafter; **Voxzogo**, a daily injection for achondroplasia (PRV in 2021), costs roughly $320,000 per year. In tropical diseases, some PRV drugs are more affordable (e.g., a $15 dengue vaccine, or a $100 course antiparasitic) thanks to external funding and low-income pricing, but those are exceptions. Overall, the **PRV incentive does not require any pricing concessions**, so sponsors generally price these breakthrough therapies at levels the market will bear. The **affordability concerns** are significant: while a PRV might encourage development of a cure for a rare deadly disease, that cure may come with a price in the millions, putting severe pressure on healthcare payers and potentially limiting patient access if not managed properly.

# References

[^1]: "FDA's Priority Review Voucher Programs," DocSlib, accessed 2024. https://docslib.org/doc/9312118/fdas-priority-review-voucher-programs 
[^2]: "Sarepta Therapeutics Agrees to Sale of Priority Review Voucher for $125M," Sarepta Therapeutics Investor Relations, accessed 2024 https://investorrelations.sarepta.com/news-releases/news-release-details/sarepta-therapeutics-agrees-sale-priority-review-voucher-125m 
[^7]: "Sarepta Therapeutics Announces Sale of Priority Review Voucher for 102 million," Business Wire, July 2023. https://www.businesswire.com/news/home/20230705080072/en/Sarepta-Therapeutics-Announces-Sale-of-Priority-Review-Voucher-for-102-million 
[^8]: "Priority Review Vouchers by the Numbers," BioSpace, 2024. https://www.biospace.com/business/priority-review-vouchers-by-the-numbers 
[^9]: "Sarepta Therapeutics Announces Sale of Priority Review Voucher for 102 million," Business Wire, July 2023. https://www.businesswire.com/news/home/20230705080072/en/Sarepta-Therapeutics-Announces-Sale-of-Priority-Review-Voucher-for-102-million 
[^10]: "Recent Facts & Figures related to Priority Review Vouchers Value 2020 to 2024," Kybora, 2024. https://kybora.com/wp-content/uploads/2024/12/Recent-Facts-Figures-related-to-Priority-Review-Vouchers-Value-2020-to-2024.pdf 
[^11]: "Sarepta (SRPT) Sells Priority Review Voucher for $102M," Zacks, July 2023. https://www.zacks.com/stock/news/2117602/sarepta-srpt-sells-priority-review-voucher-for-102m 
[^12]: "Sarepta (SRPT) Sells Priority Review Voucher for $102M," Zacks, July 2023. 
[^13]: "Priority Review Vouchers by the Numbers," BioSpace, 2024. 
[^14]: "Priority Review Vouchers: A Winning Example of Government Intervention Spurring Innovation for Rare Pediatric Diseases," NuSci Magazine, 2024. 
[^15]: "How Much Does Elevidys Cost?" Drugs.com, 2023. https://www.drugs.com/medical-answers/how-elevidys-cost-3577480/ 
[^16]: "Sarepta prices Duchenne gene therapy at $3.2M," BiopharmaDive, 2023. https://www.biopharmadive.com/news/sarepta-duchenne-elevidys-price-million-gene-therapy/653720/`;
    
    // Fetch the markdown content
    let caseStudyContent: string = '';
    let sections: Section[] = [];
    let activeSection: number = 0;
    let sidebarOpen: boolean = true;
    let isLoading: boolean = true;
    let loadError: boolean = false;
    let source: string = '';
    
    // Title page state
    let showTitlePage: boolean = true;
    
    // Progress tracking
    let readSections = writable<Set<number>>(new Set());
    
    // Footnotes handling
    let footnotes: FootnotesMap = {};
    let activeFootnote: string | null = null;
    
    // Define custom renderer type to fix TypeScript error
    type CustomRenderers = {
        [key: string]: any;
    };
    
    // Custom renderers for svelte-markdown
    const renderers: CustomRenderers = {
        // Customize how footnotes are rendered
        sup: (node: any) => {
            const text = node.text || '';
            if (text.match(/\[\d+\]/)) {
                const id = text.replace(/\[(\d+)\]/, '$1');
                return {
                    tag: 'sup',
                    attrs: {
                        class: 'footnote-ref',
                        id: `fnref${id}`,
                        'data-footnote': id,
                        on: {
                            click: () => showFootnote(id)
                        }
                    },
                    children: [{ text }]
                };
            }
            return { tag: 'sup', children: [{ text }] };
        },
        
        // Add custom renderers for links
        link: (node: any) => {
            const href = node.href || '#';
            return {
                tag: 'a',
                attrs: {
                    href,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    class: 'text-emerald-600 hover:text-emerald-800 no-underline border-b border-emerald-600',
                },
                children: node.children
            };
        },
        
        // Make strong text more prominent
        strong: (node: any) => {
            return {
                tag: 'strong',
                attrs: {
                    class: 'font-semibold text-slate-800',
                },
                children: node.children
            };
        }
    };
    
    function handleStartReading() {
        showTitlePage = false;
    }
    
    onMount(async () => {
        try {
            // Clear loading state when we try to load content
            isLoading = true;
            loadError = false;
            
            // Try multiple methods to load the case study
            let loadedContent = false;
            
            // Method 1: Import the case study directly in development mode
            try {
                const module = await import('/static/research/SareptaCaseStudy.md?raw');
                if (module.default) {
                    caseStudyContent = module.default;
                    console.log("Loaded case study directly via import, length:", caseStudyContent.length);
                    loadedContent = true;
                }
            } catch (importError) {
                console.warn("Could not import directly:", importError);
            }
            
            // Method 2: Try fetching with different paths if import fails
            if (!loadedContent) {
                const possiblePaths = [
                    '/static/research/SareptaCaseStudy.md',
                    './static/research/SareptaCaseStudy.md',
                    '../static/research/SareptaCaseStudy.md',
                    '../../static/research/SareptaCaseStudy.md',
                    '/SareptaCaseStudy.md'
                ];
                
                for (const path of possiblePaths) {
                    try {
                        console.log(`Attempting to load from: ${path}`);
                        const response = await fetch(path);
                        if (response.ok) {
                            caseStudyContent = await response.text();
                            console.log(`Successfully loaded from: ${path}, length:`, caseStudyContent.length);
                            loadedContent = true;
                            break;
                        }
                    } catch (e) {
                        console.warn(`Failed to load from ${path}:`, e);
                    }
                }
            }
            
            // Method 3: Fallback content if all else fails
            if (!loadedContent) {
                console.log("Using fallback content after all load attempts failed");
                caseStudyContent = FALLBACK_CONTENT;
            }
            
            // Parse the content into sections regardless of how we got it
            if (caseStudyContent) {
                parseSections(caseStudyContent);
                isLoading = false;
                
                // If no sections were found, that's an error
                if (sections.length === 0) {
                    console.error("No sections were parsed from the content");
                    loadError = true;
                }
            } else {
                loadError = true;
                isLoading = false;
            }
            
        } catch (error) {
            console.error('Failed to load case study:', error);
            loadError = true;
            isLoading = false;
            
            // Use fallback content on error
            console.log("Using fallback content after error");
            caseStudyContent = FALLBACK_CONTENT;
            parseSections(caseStudyContent);
        }
    });
    
    function showFootnote(id: string): void {
        // Toggle active footnote
        activeFootnote = activeFootnote === id ? null : id;
    }
    
    function parseSections(content: string): void {
        // Extract footnotes from the content
        const footnoteRegex = /\[\^(\d+)\]: (.*?)(?=\n\[\^|$)/gs;
        let match;
        
        // Clear existing footnotes
        footnotes = {};
        
        while ((match = footnoteRegex.exec(content)) !== null) {
            const id = match[1];
            const text = match[2].trim();
            footnotes[id] = text;
        }
        
        // Clean content from footnote definitions at the end of the document
        content = content.replace(/\[\^(\d+)\]: .*?(?=\n\[\^|$)/gs, '');
        
        // Split by headers (# for major sections and ## for subsections)
        const lines = content.split('\n');
        const sectionMap: Section[] = [];
        let currentSection: Section = { title: '', content: '', id: '' };
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check if it's a main section header (# Section)
            if (line.match(/^# /)) {
                // If we have content in the current section, add it to the map
                if (currentSection.title) {
                    sectionMap.push({ ...currentSection });
                }
                
                // Start a new section
                const title = line.replace(/^# /, '');
                const id = title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
                currentSection = { 
                    title, 
                    content: line + '\n', 
                    id
                };
            } else {
                // Add this line to the current section
                if (currentSection.title) {
                    currentSection.content += line + '\n';
                } else if (line.trim() !== '') {
                    // If we encounter content before any section header, create a default section
                    const title = "Introduction";
                    const id = "introduction";
                    currentSection = {
                        title,
                        content: line + '\n',
                        id
                    };
                }
            }
        }
        
        // Add the last section if it has content
        if (currentSection.title) {
            sectionMap.push({ ...currentSection });
        }
        
        sections = sectionMap;
        console.log(`Parsed ${sections.length} sections from case study:`, sections.map(s => s.title));
        
        // Update source for active section
        updateActiveSection();
    }
    
    function updateActiveSection() {
        if (sections.length > activeSection) {
            source = sections[activeSection].content;
            console.log(`Updated active section to ${activeSection}: ${sections[activeSection].title}`);
        }
    }
    
    function setActiveSection(index: number): void {
        // Make sure index is valid
        if (index >= 0 && index < sections.length) {
            activeSection = index;
            updateReadStatus(index);
            
            // Reset active footnote when changing sections
            activeFootnote = null;
            
            // Update source for the new active section
            updateActiveSection();
            
            // Scroll to top of content area for better reading experience
            const contentElement = document.querySelector('.content');
            if (contentElement) {
                contentElement.scrollTop = 0;
            }
        }
    }
    
    function updateReadStatus(index: number): void {
        readSections.update(set => {
            set.add(index);
            return set;
        });
    }
    
    function toggleSidebar(): void {
        sidebarOpen = !sidebarOpen;
    }
    
    // Calculate reading progress
    $: readingProgress = $readSections.size / (sections.length || 1) * 100;
    
    // Update source when active section changes - This is more reliable than relying on function calls
    $: {
        if (sections.length > 0 && activeSection >= 0 && activeSection < sections.length) {
            source = sections[activeSection].content;
            console.log(`Reactive update: Active section ${activeSection}: ${sections[activeSection].title}`);
        }
    }
</script>

<div class="case-studies-container flex flex-col md:flex-row h-full">
    {#if showTitlePage}
        <TransactionsCaseStudiesTitle on:startReading={handleStartReading} />
    {:else}
        <!-- Sidebar toggle for mobile -->
        <button 
            class="md:hidden p-2 bg-slate-800 text-white mb-2 rounded"
            on:click={toggleSidebar}
        >
            {sidebarOpen ? 'Hide' : 'Show'} Navigation
        </button>

        <!-- Sidebar -->
        <aside 
            class="sidebar {sidebarOpen ? 'block' : 'hidden'} md:block bg-slate-800 text-slate-50 w-full md:w-64 md:min-w-64 overflow-y-auto p-4 md:h-[calc(100vh-200px)]"
            transition:slide={{ duration: 300 }}
        >
            <div class="mb-6">
                <h3 class="text-sm font-semibold text-slate-300">Case Study</h3>
                <h2 class="text-xl font-bold">Sarepta Therapeutics</h2>
                <div class="mt-4 bg-slate-700 rounded-full h-2">
                    <div class="bg-emerald-500 h-2 rounded-full" style="width: {readingProgress}%"></div>
                </div>
            </div>
            
            <nav>
                <ul class="space-y-1">
                    {#each sections as section, i}
                        <li>
                            <button 
                                class="w-full text-left py-2 transition-colors text-sm {i === activeSection ? 'border-b-2 border-emerald-600 text-white' : $readSections.has(i) ? 'bg-slate-700' : 'hover:bg-slate-700'}"
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
            {#if isLoading}
                <div class="flex justify-center items-center h-full">
                    <p class="text-slate-500">Loading case study...</p>
                </div>
            {:else if loadError}
                <div class="flex flex-col gap-4 justify-center items-center h-full">
                    <p class="text-red-500 font-medium">Failed to load the case study.</p>
                    <p class="text-slate-500 mt-2">Please try refreshing the page.</p>
                </div>
            {:else if sections.length > 0 && activeSection < sections.length}
                <article class="prose prose-slate max-w-prose mx-auto">
                    <!-- Use svelte-markdown component with reactive source -->
                    <SvelteMarkdown 
                        {source}
                        {renderers}
                    />
                    
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
                    <div class="mt-8 pt-4 border-t border-slate-200 max-w-prose mx-auto">
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
                
                <div class="flex justify-between mt-8 pt-4 border-t border-slate-200 max-w-prose mx-auto">
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
                    <p class="text-slate-500">No content found. Please try refreshing the page.</p>
                </div>
            {/if}
        </main>
    {/if}
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
    
    :global(.prose a) {
        color: #059669;
        text-decoration: none;
        border-bottom: 1px solid currentColor;
    }
    
    :global(.prose a:hover) {
        border-bottom: 2px solid currentColor;
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

