<script lang="ts">
    import { onMount } from 'svelte';
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
    let sections: Section[] = [];
    let currentSectionIndex = 0;
    let currentSection: Section | null = null;
    let sidebarOpen = true;
    
    // Track read sections
    const readSections = writable<Set<number>>(new Set());
    
    // Hardcoded sections - this is much more reliable than parsing
    function createSections() {
        return [
            {
                id: 'introduction',
                title: 'Introduction',
                content: `
                <h1>Introduction</h1>
                <p>How has the FDA's Priority Review Voucher (PRV) program impacted drug development within rare pediatric diseases since its launch in 2012? Through analysis of regulatory outcomes, economic trends, and case studies, we evaluate the program's effectiveness in stimulating innovation, its effects on drug pricing and patient access, and its relationship to other pharmaceutical incentives.</p>
                <p>While PRVs have successfully contributed to bringing dozens of novel therapies to market for previously untreatable conditions, challenges persist regarding the sustainability of high drug prices and ensuring equitable access. The paper concludes with policy recommendations for optimizing this market-based incentive mechanism to better balance innovation with affordability and public health impact.</p>`
            },
            {
                id: 'influence',
                title: 'Influence on R&D Investment Decisions',
                content: `
                <h1>Influence on R&D Investment Decisions</h1>
                <p>The central rationale of Priority Review Vouchers (PRVs) is to motivate drug developers to invest in R&D for diseases they might otherwise ignore. After over a decade of experience, the evidence on how PRVs influence the drug development pipeline shows both promise and limitations.</p>
                <p>Some studies and reviews have found <strong>little or no measurable effect</strong> of the PRV programs on the overall rate of new drug development for targeted diseases. For example, a 2020 GAO report noted that few rigorous studies exist, and those that do failed to show a clear increase in development activity attributable solely to PRVs.</p>
                <p>Much of the rare disease innovation of the past decade can also be credited to the Orphan Drug Act incentives and scientific advances like gene therapy, making it difficult to isolate the PRV program's impact. However, <strong>qualitative evidence suggests PRVs are indeed a factor in companies' strategic decisions</strong>.</p>
                <p>In interviews with seven drug sponsors who had pursued qualifying drugs, all seven indicated the possibility of earning a PRV was considered in their development plans; six described it as <em>one of several factors</em> tipping the cost-benefit calculus, and one sponsor even called a PRV "pivotal" to its decision to develop a particular drug.</p>`
            },
            {
                id: 'sarepta',
                title: 'Case Study – Sarepta Therapeutics',
                content: `
                <h1>Case Study – Sarepta Therapeutics</h1>
                <p><em>Sarepta Therapeutics</em> provides a telling example of how PRVs can shape a company's pipeline and financial trajectory. Sarepta is a biotech firm specializing in genetic medicines for rare neuromuscular diseases, notably <strong>Duchenne Muscular Dystrophy (DMD)</strong>.</p>
                <p>DMD is a fatal genetic disorder affecting young boys – exactly the type of rare pediatric condition targeted by the PRV program. Over the past decade, Sarepta has developed multiple DMD therapies, and in doing so it has amassed <strong>four</strong> rare pediatric PRVs – the most for any single company.</p>
                <p>These vouchers were awarded upon FDA approvals of: <em>Exondys 51</em> (2016), <em>Vyondys 53</em> (2019), <em>Amondys 45</em> (2021), and <em>Elevidys</em> (delandistrogene moxeparvovec, 2023). Each of these drugs addressed a different subset of DMD patients (distinguished by genetic mutation type or therapy modality), and each qualified as a novel treatment for a rare pediatric disease.</p>
                <p>Sarepta strategically leveraged the PRV incentive in at least two ways:</p>
                
                <h2>Monetizing Vouchers for R&D Capital</h2>
                <p>Sarepta has opted to sell its PRVs for large sums, then reinvest the proceeds to fund its pipeline. For example, in July 2023 Sarepta sold the voucher earned from Elevidys' approval for $102 million in cash. Management explicitly stated that <em>"Sarepta will invest proceeds from the sale of the PRV into our R&D efforts to support the development of more transformative therapies"</em>.</p>
                <p>In other words, the voucher acted as a <strong>de facto financing mechanism</strong>, providing non-dilutive cash that can be poured into the next wave of gene therapy and RNA-based drug programs (Sarepta has over 40 programs in development).</p>
                <p>Similarly, Sarepta sold a prior voucher (from Vyondys 53) reportedly for around $108 million in 2020, and another (from Amondys 45) for an undisclosed sum around that time. Cumulatively, Sarepta may have generated on the order of $300–400 million from voucher sales over a few years, substantially bolstering its war chest.</p>
                <p>This capital has likely enabled the company to pursue expensive clinical trials (e.g., systemic gene therapies, gene editing projects) that otherwise would have required additional stock offerings or partnerships. In essence, PRVs have become part of Sarepta's <strong>business model</strong>, turning successful rare disease approvals into immediate funding for future research.</p>
                
                <h2>Pipeline Expansion and Acceleration</h2>
                <p>The availability of PRVs has reinforced Sarepta's focus on rare pediatric indications. The company's leadership in DMD therapies was driven by scientific opportunity, but the PRV program provided an extra incentive to tackle multiple subtypes of the disease in succession.</p>
                <p>Each time Sarepta developed a therapy targeting a new DMD mutation (e.g., exon-skipping drugs for different exons), the possibility of another voucher (and its sale) added to the project's expected value. This might have encouraged Sarepta to invest in therapies like Amondys 45 or Vyondys 53, which have relatively small patient sub-populations, knowing that a PRV could be earned.</p>
                <p>Moreover, Sarepta reportedly acquired a PRV on the open market in one case to accelerate approval of another gene therapy (for limb-girdle muscular dystrophy) – though that product has not yet reached filing. The net effect is that Sarepta's development pipeline has been very <em>PRV-focused</em>, concentrating on rare pediatric neuromuscular diseases where each success yields both a new drug <em>and</em> a voucher.</p>`
            },
            {
                id: 'economic',
                title: 'Economic and Pricing Trends',
                content: `
                <h1>Economic and Pricing Trends of PRV-Awarded Drugs</h1>
                
                <h2>High Pricing of PRV-Earning Drugs</h2>
                <p>Drugs that earn priority review vouchers are often <strong>orphan products or novel therapies</strong> in areas with little to no competition – factors that typically lead to high launch prices. Indeed, a consistent trend is that PRV-awarded drugs carry premium pricing, frequently drawing scrutiny for affordability.</p>
                <p>Many are gene therapies, biologics, or specialized small-molecules with development costs that companies seek to recoup from a tiny patient population. As a result, <em>"remedies for rare diseases are typically exorbitantly priced to recoup development costs"</em>.</p>
                <p>For example, <strong>Elevidys</strong>, the DMD gene therapy approved in 2023 that earned Sarepta a PRV, was priced at <strong>$3.2 million</strong> for a one-time dose. This makes Elevidys one of the most expensive drugs in the world, second only to a hemophilia gene therapy priced at $3.5 million.</p>
                <p>Similarly, Bluebird Bio's gene therapies – <strong>Zynteglo</strong> for beta-thalassemia and <strong>Skysona</strong> for cerebral ALD, each of which earned a PRV in 2022 – launched at around $2.8 million and $3.0 million respectively.</p>
                <p>Even non-gene-therapy voucher drugs often come at high cost: <strong>Spinraza</strong>, the first SMA treatment (PRV in 2016), costs about $750,000 in the first year and ~$375,000 annually thereafter; <strong>Voxzogo</strong>, a daily injection for achondroplasia (PRV in 2021), costs roughly $320,000 per year.</p>`
            },
            {
                id: 'access',
                title: 'Patient Access and Insurance',
                content: `
                <h1>Patient Access, Insurance, and Market Impacts</h1>
                
                <h2>Insurance Coverage of PRV-Driven Drugs</h2>
                <p>Given the often extraordinary prices of drugs that earn PRVs, a key question is whether patients can actually get these medications paid for by insurance. In general, new FDA-approved therapies – especially for serious or life-threatening conditions – <strong>are eventually covered by major insurers</strong>, but coverage policies can be stringent and take time to develop.</p>
                <p>For example, after Elevidys was approved in June 2023 at $3.2 million, insurance giant UnitedHealthcare announced coverage within weeks, but other insurers took a few months to outline their criteria.</p>
                <p>Payers typically conduct reviews (sometimes leveraging external cost-effectiveness analyses) to decide under what conditions a rare disease drug will be reimbursed. Commonly, insurers will require <strong>prior authorization</strong>, ensuring that the patient truly meets the label criteria (e.g., for Elevidys, the child must have DMD with a confirmed mutation and be in the specified age range).</p>
                
                <h2>Patient Assistance Programs</h2>
                <p>To address the affordability gap, virtually all manufacturers of PRV-awarded drugs have established <strong>patient support and assistance programs</strong>. For patients with private insurance, companies typically offer copay assistance: the Elevidys manufacturer's <em>SareptAssist</em> program, for example, will cover a patient's copays or coinsurance obligations up to a certain amount, effectively reducing out-of-pocket cost to as low as $0 for eligible privately insured patients.</p>
                <p>This is crucial because even with insurance, a 10% coinsurance on a $3.2M therapy would be $320k – an impossible sum for most families. Programs like SareptAssist ensure that families are not bankrupted by cost-sharing.</p>`
            },
            {
                id: 'conclusion',
                title: 'Conclusion',
                content: `
                <h1>Conclusion</h1>
                <p>Priority Review Vouchers have become a prominent, if unconventional, tool in pharmaceutical policy, leveraging the value of FDA review time to drive drug development for unmet needs. This comprehensive analysis finds that <strong>PRVs have had a meaningful impact</strong>: they have helped bring numerous drugs to market for rare pediatric and tropical diseases, providing companies an extra incentive that can influence R&D strategy and funding.</p>
                <p>The ability to redeem or sell a voucher for around $100 million has proven attractive to industry, as evidenced by the active secondary market and cases like Sarepta, which reinvested voucher proceeds to expand its pipeline.</p>
                <p>At the same time, the PRV system has introduced challenges. The FDA must manage accelerated reviews without compromising quality, a task it has handled thus far by using additional fees and shifting resources, though not without caution about workload strains.</p>
                <p>Economically, the program's success in spurring innovation comes with the side effect of <strong>very high drug prices</strong> for many PRV-awarded therapies, raising questions about long-term affordability and equity.</p>
                <p>In conclusion, priority review vouchers represent a novel market-based incentive that has delivered <strong>mixed but largely positive results</strong> in stimulating drug development for underserved diseases. The FDA's workload has increased modestly due to PRVs, but mechanisms are in place to handle it, funded by industry user fees.</p>`
            }
        ];
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
    onMount(() => {
        try {
            isLoading = true;
            
            // Simply create our hardcoded sections
            sections = createSections();
            
            if (sections.length > 0) {
                loadSection(0);
            } else {
                throw new Error("No sections found in the case study");
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
</script>

<div class="flex flex-col md:flex-row h-full bg-gray-50">
    <!-- Mobile navigation toggle -->
    <div class="md:hidden p-2 bg-slate-800">
        <button 
            class="w-full px-4 py-2 text-white bg-emerald-600 rounded"
            on:click={toggleSidebar}
        >
            {sidebarOpen ? 'Hide' : 'Show'} Sections
        </button>
    </div>
    
    <!-- Sidebar -->
    {#if sidebarOpen}
    <aside 
        class="w-full md:w-64 bg-slate-800 text-white overflow-y-auto p-4 md:h-screen"
        transition:slide={{duration: 200}}
    >
        <div class="mb-6">
            <h2 class="text-xl font-bold">Sarepta Therapeutics</h2>
            <p class="text-slate-300 text-sm">Case Study</p>
            
            <!-- Progress bar -->
            <div class="mt-4 w-full bg-slate-700 rounded-full h-2.5">
                <div 
                    class="bg-emerald-500 h-2.5 rounded-full" 
                    style="width: {readingProgress}%">
                </div>
            </div>
            <p class="text-xs text-slate-400 mt-1">{readingProgress}% Complete</p>
        </div>
        
        <!-- Section navigation -->
        <nav>
            <ul class="space-y-1">
                {#each sections as section, index}
                    <li>
                        <button 
                            class="w-full text-left p-2 rounded {index === currentSectionIndex 
                                ? 'bg-emerald-600 text-white' 
                                : $readSections.has(index) 
                                    ? 'bg-slate-700 text-slate-200' 
                                    : 'hover:bg-slate-700 text-slate-300'}"
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
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        {:else if error}
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p class="font-bold">Error</p>
                <p>{error}</p>
            </div>
        {:else if currentSection}
            <div class="max-w-3xl mx-auto bg-white shadow rounded-lg p-6 md:p-8" transition:fade={{duration: 150}}>
                <!-- Use {@html} to render the HTML content directly -->
                <div class="prose prose-slate max-w-none">
                    {@html currentSection.content}
                </div>
                
                <!-- Navigation buttons -->
                <div class="flex justify-between mt-8 pt-4 border-t border-slate-200">
                    <button 
                        class="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={currentSectionIndex === 0}
                        on:click={goToPreviousSection}
                    >
                        Previous Section
                    </button>
                    
                    <button 
                        class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={currentSectionIndex === sections.length - 1}
                        on:click={goToNextSection}
                    >
                        Next Section
                    </button>
                </div>
            </div>
        {:else}
            <div class="text-center text-slate-500">
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
    
    /* Style the prose content */
    :global(.prose h1) {
        font-size: 1.8rem;
        margin-top: 0;
        margin-bottom: 1.5rem;
        color: #1e293b;
        font-weight: 700;
        line-height: 1.2;
    }
    
    :global(.prose h2) {
        font-size: 1.4rem;
        margin-top: 2rem;
        margin-bottom: 1rem;
        color: #334155;
        font-weight: 600;
        line-height: 1.3;
    }
    
    :global(.prose p) {
        margin-bottom: 1rem;
        line-height: 1.6;
        color: #475569;
    }
    
    :global(.prose strong) {
        font-weight: 600;
        color: #1e293b;
    }
    
    :global(.prose em) {
        font-style: italic;
        color: #334155;
    }
</style> 