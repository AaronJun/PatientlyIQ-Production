<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import "carbon-components-svelte/css/all.css";  
    import { Email, Globe } from 'carbon-icons-svelte';

    import ReferenceSidebar from '$lib/components/ReferenceSidebar.svelte';

    import ALZIntroduction from './KYBIntro.svelte';
    import KYBBody from './KYBBody.svelte';

    let isDrawerOpen = false;
   
    const siteUrl = 'https://patientlyiq.com/KYBORAdemo';
    const pageTitle = "KYBORA Demo";
    const pageDescription = "KYBORA is a global advisory firm and investment bank whose mission is to guide transformative healthcare companies to enduring success globally. We provide M&A, licensing, fundraising, and strategic advisory services to the global healthcare industry, creating value for our clients worldwide. With offices in the US, Switzerland, and China, and a direct presence in all key biopharma markets around the world, KYBORA offers unparalleled global reach and local knowledge. Contact us to explore how we can help you address your most pressing challenges.";
    const pageImage = `${siteUrl}/kybora-demo-preview.png`; // Make image URL absolute
    const pageUrl = `${siteUrl}/KYBORAdemo`; // Make page URL absolute
    
    // Component visibility states
    let waffleStagesVisible = false;
    let sentimentDriversVisible = false;
    let ctWaffleStagesVisible = false;
    let ctPositiveChartVisible = false;
    let journeyCard1Visible = false;
    let journeyCard2Visible = false;
    let journeyCard3Visible = false;

    const references = [
        {
            id: 'ref1',
            text: 'Japan to scrap rule requiring testing of new drugs on Japanese (2023) Nikkei Asia.',
            url: 'https://asia.nikkei.com/Business/Pharmaceuticals/Japan-to-scrap-rule-requiring-testing-of-new-drugs-on-Japanese',
            date: '15 November 2024'
        },
        {
            id: 'ref2',
            text: 'Japan Pharmaceutical Market Size: Mordor Intelligence (2024) Japan Pharmaceutical Industry Analysis | Market Growth, Size & Forecast Report.',
            url: 'https://www.mordorintelligence.com/industry-reports/japan-pharmaceutical-market',
            date: '04 November 2024'
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
            text: 'Japan Pharmaceutical Market Size: Mordor Intelligence (2024) Japan Pharmaceutical Industry Analysis | Market Growth, Size & Forecast Report.',
            url: 'https://www.mordorintelligence.com/industry-reports/japan-pharmaceutical-market',
            date: '04 November 2024'
        },
        {
            id: 'ref7',
            text: 'Regulatory updates in Japan (2024) PMDA.',
            url: 'https://www.pmda.go.jp/files/000269411.pdf',
            date: '04 November 2024'
        },
        {
            id: 'ref8',
            text: 'Tanaka, M. et al. (2021) Achievements and challenges of the designation system in Japan, British Journal of Clinical Pharmacology, 87(10), pp. 4027–4035.',
            url: 'https://doi.org/10.1111/bcp.14807',
            date: '15 November 2024'
        },
        {
            id: 'ref9',
            text: 'Strengthening program for pharmaceutical startup ecosystem (2024) Japan Agency for Medical Research and Development (AMED).',
            url: 'https://www.amed.go.jp/content/000131506.pdf',
            date: '15 November 2024'
        },
        {
            id: 'ref10',
            text: 'Pharmaceuticals in Japan (2014) The Government of Japan.',
            url: 'https://www.japan.go.jp/letters/medical/pharmaceuticals/Pharmaceuticals%20in%20Japan.pdf',
            date: '04 November 2024'
        },
        {
            id: 'ref11',
            text: "Siddiqui, A. (2024) Rebooting Japan's Biotech Growth Engine, BioSpectrum Asia.",
            url: 'https://www.biospectrumasia.com/analysis/25/24797/rebooting-japans-biotech-growth-engine.html',
            date: '15 November 2024'
        },
        {
            id: 'ref12',
            text: 'Government initiatives: Life science - industries - investing in Japan (2023) Japan External Trade Organisation (JETRO).',
            url: 'https://www.jetro.go.jp/en/invest/attractive_sectors/life_science/government_initiatives.html',
            date: '15 November 2024'
        }
    ];
</script>

<svelte:options immutable={false} />

<div class="w-full">

    <div class="flex flex-col w-full justify-stretch">
        <!-- Full width introduction section -->
        <div class="flex flex-col w-full">
            <div id="1. Introduction" class="flex-1 place-content-center">
                <ALZIntroduction />
            </div>
        </div>

        <!-- Main content area - no longer using grid layout -->
        <div class="flex flex-col px-8 mt-8">
            <div class="place-content-center pt-4">        
                <KYBBody />

            </div>
                </div>
            </div>  

    <!-- Fixed position reference drawer -->
    <ReferenceSidebar {references} />
</div>

<div class="flex flex-col md:flex-row gap-32 md:pr-8 pt-32 bg-slate-800 w-full h-mvh align-center justify-center">
    <div class="flex flex-col md:w-1/3 align-center justify-top">
    <h4 class="text-base font-bold uppercase text-sky-400">About KYBORA</h4>
    <p class="prose max-w-prose text-left text-sm text-sky-50 font-serif mt-8 mb-12">
        KYBORA is a global advisory firm and investment bank whose
        mission is to guide transformative healthcare companies to
        enduring success globally. We provide M&A, licensing, fundraising,
        and strategic advisory services to the global healthcare industry,
        creating value for our clients worldwide. With offices in the US,
        Switzerland, and China, and a direct presence in all key biopharma
        markets around the world, KYBORA offers unparalleled global
        reach and local knowledge. Contact us to explore how we can
        help you address your most pressing challenges.
        <br>
        <br>
        <button class="text-sky-200 font-mono text-xs hover:text-blue-500 transition-colors flex flex-row align-center justify-center">
            <Email class="inline-block mr-1" />
            info@kybora.com
        </button>
        <br>
        <button class="text-sky-200 font-mono text-xs hover:text-blue-500 transition-colors flex flex-row align-center justify-center">
            <Globe class="inline-block mr-1" />
            www.kybora.com
        </button>
    </p>
    </div>
    <div class="flex flex-col md:w-1/3 align-center justify-top">                
    <h4 class="text-base font-bold uppercase text-sky-400">About Swanielle</h4>
    <p class="prose max-w-prose text-left text-sm text-sky-50 font-serif mt-8 mb-12">
    Swanielle is a Japanese consulting company that accelerates
    medicine access through strategy and partnerships. The company's
    mission is to eliminate "Drug Loss" in Japan, thereby ensuring
    that patients have prompt access to essential medicines. Swanielle
    supports companies in strategically planning and executing
    partnerships, from co-development to commercial collaborations
    within Japan/Asia.
    <br>
    <br>
    <button class="text-sky-200 font-mono text-xs hover:text-blue-500 transition-colors flex flex-row align-center justify-center">
        <Email class="inline-block mr-1" />
        hiroshi.yamabe@swanielle.com
    </button>
    <br>
    <button class="text-sky-200 font-mono text-xs hover:text-blue-500 transition-colors flex flex-row align-center justify-center">
        <Globe class="inline-block mr-1" />
        www.swanielle.com
    </button>
    </div>
    </div>

    <div class="flex flex-col md:flex-row gap-32 md:pr-8 pt-32 pb-8 bg-slate-900 w-full h-mvh align-center justify-center">
    <p class="text-sky-100 font-mono text-xs hover:text-blue-500 transition-colors flex flex-row align-center justify-center">  
        <a href="https://plhd.com" class="text-sky-200 font-mono text-xs hover:text-blue-500 transition-colors flex flex-row align-center justify-center">PLHD</a>
    </p>
    </div>  

<style>
    .more-circle {
        background: rgba(255, 81, 81, 0.1);
    }

    .plus-icon {
        font-size: 2rem;
        color: #ff5151;
        line-height: 1;
        position: relative;
        z-index: 2;
    }

    .hover-circle {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: rgba(255, 81, 81, 0);
        transition: background-color 0.2s ease;
    }

    .patient-circle-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .vignette {
        border-top: .5px dotted #116661;
        border-bottom: .5px dotted #116661;
        background-color: #f7f7f7;
        padding-top: 4.25rem;
        padding-top: 4.25rem;
    }


    .loading-placeholder {
        width: 100%;
        min-height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .visualization-container {
        transition: opacity 0.5s ease;
    }
</style>