<script lang="ts">
    import "carbon-components-svelte/css/all.css";
    import ThreeColumnVisual from '$lib/components/ThreeColumnVisual.svelte';
    import { onMount } from 'svelte';
    import MarketSizeChart from '$lib/components/MarketSizeChart.svelte';
    import GTBInvestmentChart from '$lib/components/GTBInvestmentChart.svelte';
    import BiotechMarketGrowthChart from '$lib/components/BiotechMarketGrowthChart.svelte';
    import JapanSuccessTimelineCards from '$lib/components/JapanSuccessTimelineCards.svelte';
    import { Email, Globe } from 'carbon-icons-svelte';
    import AMEDEcosystemFlow from '$lib/components/AMEDEcosystemFlow.svelte';
    import AvapritinibDrawer from '$lib/components/AvapritinibDrawer.svelte';
    import SakigakeBenefits from '$lib/components/SakigakeBenefits.svelte';
    import SakigakeWaffleChart from '$lib/components/SakigakeWaffleChart.svelte';
    import DrugLagWaffleChart from '../../lib/components/DrugLagWaffleChart.svelte';
    import avapritinibData from './avapritinib.json';

    let isavapritinibDrawerOpen = false;

    function openavapritinibDrawer() {
        isavapritinibDrawerOpen = true;
    }

    function closeavapritinibDrawer() {
        isavapritinibDrawerOpen = false;
    }

    const references = [
        {
            id: 'ref1',
            text: 'Japan to scrap rule requiring testing of new drugs on Japanese (2023) Nikkei Asia.',
            url: 'https://asia.nikkei.com/Business/Pharmaceuticals/Japan-to-scrap-rule-requiring-testing-of-new-drugs-on-Japanese',
            date: '15 November 2024'
        },
        {
            id: 'ref3',
            text: 'Gate opening summit for Innovative Drug Discovery (2024) Prime Ministers Office of Japan.',
            url: 'https://japan.kantei.go.jp/101_kishida/actions/202407/30souyaku.html',
            date: '15 November 2024'
        },
        {
            id: 'ref4',
            text: 'Kobayashi, N. (2020) Japan: Balancing cost and innovation through pricing, PharmExec.',
            url: 'https://www.pharmexec.com/view/japan-balancing-cost-and-innovation-through-pricing',
            date: '15 November 2024'
        },
        {
            id: 'ref5',
            text: 'Gist of FY2024 Drug Pricing Reform (2023) PHARMA JAPAN.',
            url: 'https://pj.jiho.jp/article/250145',
            date: '04 November 2024'
        },
        {
            id: 'ref6',
            text: 'Regulatory updates in Japan (2024) PMDA.',
            url: 'https://www.pmda.go.jp/files/000269411.pdf',
            date: '04 November 2024'
        },
        {
            id: 'ref7',
            text: 'Tanaka, M. et al. (2021) \'Achievements and challenges of the designation system in Japan\', British Journal of Clinical Pharmacology, 87(10), pp. 4027–4035.',
            url: 'doi:10.1111/bcp.14807',
            date: '15 November 2024'
        },
        {
            id: 'ref8',
            text: 'Strengthening program for pharmaceutical startup ecosystem (2024) Japan Agency for Medical Research and Development (AMED).',
            url: 'https://www.amed.go.jp/content/000131506.pdf',
            date: '15 November 2024'
        },
        {
            id: 'ref9',
            text: 'Pharmaceuticals in Japan (2014) The Government of Japan.',
            url: 'https://www.japan.go.jp/letters/medical/pharmaceuticals/Pharmaceuticals%20in%20Japan.pdf',
            date: '04 November 2024'
        },
        {
            id: 'ref10',
            text: 'Siddiqui, A. (2024) Rebooting Japan\'s Biotech Growth Engine, BioSpectrum Asia.',
            url: 'https://www.biospectrumasia.com/analysis/25/24797/rebooting-japans-biotech-growth-engine.html',
            date: '15 November 2024'
        },
        {
            id: 'ref11',
            text: 'Government initiatives: Life science - industries - investing in Japan - Japan external trade organization (2023c) Japan External Trade Organisation (JETRO).',
            url: 'https://www.jetro.go.jp/en/invest/attractive_sectors/life_science/government_initiatives.html',
            date: '15 November 2024'
        },
        {
            id: 'ref12',
            text: 'Impact of the Changes',
            url: 'https://example.com/ref12',
            date: '15 November 2024'
        },
    ];

    onMount(() => {
        const footnotes = document.querySelectorAll('.footnote');
        footnotes.forEach(footnote   => {
            const refId = footnote.getAttribute('data-ref');
            if (refId) {
                const reference = document.getElementById(refId);
                if (reference) {
                    footnote.addEventListener('mouseenter', () => {
                        reference.classList.add('bg-slate-100');
                    });
                    footnote.addEventListener('mouseleave', () => {
                        reference.classList.remove('bg-slate-100');
                    });
                }
            }
        });
    });
</script>

<div class="max-w-4xl mx-auto px-4 pt-8">
    <!-- Introduction Section -->
    <section class="mb-16">
        <h3 class="section-header text-sky-800 mb-6">Introduction</h3>   
        <p class="prose-text">
            For a number of years, strict regulations and unfavorable market access conditions for new medicines have led to a phenomena in Japan known as drug lag or even drug loss. This is where foreign companies delay (in the case of drug lag) or even abandon (drug loss) developing and launching their products in Japan, as the barriers to market entry are too high. Drug loss presents a serious issue for Japanese patients who are unable to access new medicines that have already been approved in other markets.
        </p>

        <p class="prose-text">
            Drug loss presents a serious issue for Japanese patients who
            are unable to access new medicines that have already been
            approved in other markets. For example, the drug <span class="font-mono font-bold text-sm text-orange-600 cursor-pointer hover:text-sky-700 underline" on:click={openavapritinibDrawer}>avapritinib</span> -
            manufactured by US firm <span class="font-mono font-bold text-sm text-sky-900">Blueprint Medicines Corporation</span> - is
            the only treatment available for a type of gastrointestinal stromal
            tumor (GIST), and was approved in Europe and the US in 2020.
            However, <span class="font-mono font-bold text-sm text-orange-600 cursor-pointer hover:text-sky-700 underline" on:click={openavapritinibDrawer}>avapritinib</span> has still not been approved and therefore
            is still not available to patients in Japan <a href="#ref1" class="footnote font-mono underline text-2xs hover:text-blue-500 transition-colors" data-ref="ref1">1</a>.
        </p>
        
        <p class="prose-text">
            The complex drug development environment and pharmaceutical
            market has deterred many non-Japanese companies, particularly
            smaller biotech companies without Japanese affiliates, from
            entering the Japanese market. This is despite Japan being the
            world's third largest pharmaceutical market, with a value of $88
            billion in 2024, and a projected value of $92 billion by 2029 <a href="#ref2" class="footnote font-mono underline text-2xs hover:text-blue-500 transition-colors" data-ref="ref2">2</a>.
        </p>
    </section>

    <!-- Market Size Chart -->
    <section class="mb-16">
        <div class="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <MarketSizeChart />
        </div>
    </section>

    <section class="mb-16">
        <p class="prose-text">
            In recent years however, the Japanese government and the
            private sector have begun to address the issue of drug loss and
            drug lag in Japan with a series of measures designed to ease
            market entry for non-Japanese drug developers and incentivize
            innovative drug development in Japan, and signs of improvement
            are beginning to show.
        </p>
        
        <p class="prose-text">
            This article will briefly look at the origins of the problem of
            drug loss in Japan, before exploring a number of recent reforms
            that have been made to address the issue, and finally present
            some examples of non-Japanese companies that have begun to
            capitalize on the improved market conditions.
        </p>
    </section>

    <div class="section-divider"></div>
</div>

<!-- Avapritinib Drawer -->
<AvapritinibDrawer 
    isOpen={isavapritinibDrawerOpen}
    onClose={closeavapritinibDrawer}
    timelineData={avapritinibData}
/>

<style>
    .section-header {
        font-family: 'IBM Plex Serif', serif;
        font-size: 1.8725rem;
        font-weight: 400;
        font-style: italic;
    }

    .subsection-header {
        font-size: 1.125rem;
        font-weight: 700;
        text-transform: uppercase;
    }

    .prose-text {
        text-align: left;
        font-size: 1rem;
        line-height: 1.6;
        max-width: 65ch;
        color: #1e293b;
        font-family: 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', serif;
        margin-bottom: 1.5rem;
    }

    @media (min-width: 768px) {
        .prose-text {
            font-size: 1.125rem;
        }
    }

    .section-divider {
        width: 100%;
        height: 1px;
        background: #e2e8f0;
        margin: 3rem 0;
    }
</style> 