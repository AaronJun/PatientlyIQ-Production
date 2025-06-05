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

<div class="grid pt-8">
    <div class="">
            <div class="flex flex-col">

    <div class="mt-8 md:ml-24">
     <h3 class="section-header text-sky-800 mb-6">Introduction</h3>   
        <p class="text-left text-lg max-w-prose text-slate-800 font-serif mt-8 mb-12">
            For a number of years, strict regulations and unfavorable market access conditions for new medicines have led to a phenomena in Japan known as drug lag or even drug loss. This is where foreign companies delay (in the case of drug lag) or even abandon (drug loss) developing and launching their products in Japan, as the barriers to market entry are too high. Drug loss presents a serious issue for Japanese patients who are unable to access new medicines that have already been approved in other markets.
            <br><br>

            Drug loss presents a serious issue for Japanese patients who
            are unable to access new medicines that have already been
            approved in other markets. For example, the drug <span class="font-mono font-bold text-sm text-orange-600 cursor-pointer hover:text-sky-700 underline" on:click={openavapritinibDrawer}>avapritinib</span> -
            manufactured by US firm <span class="font-mono font-bold text-sm text-sky-900">Blueprint Medicines Corporation</span> - is
            the only treatment available for a type of gastrointestinal stromal
            tumor (GIST), and was approved in Europe and the US in 2020.
            However, <span class="font-mono font-bold text-sm text-orange-600 cursor-pointer hover:text-sky-700 underline" on:click={openavapritinibDrawer}>avapritinib</span> has still not been approved and therefore
            is still not available to patients in Japan <a href="#ref1" class="footnote font-mono underline text-2xs hover:text-blue-500 transition-colors" data-ref="ref1">1</a>.
            
            <br><br>
            The complex drug development environment and pharmaceutical
            market has deterred many non-Japanese companies, particularly
            smaller biotech companies without Japanese affiliates, from
            entering the Japanese market. This is despite Japan being the
            world's third largest pharmaceutical market, with a value of $88
            billion in 2024, and a projected value of $92 billion by 2029 <a href="#ref2" class="footnote font-mono underline text-2xs hover:text-blue-500 transition-colors" data-ref="ref2">2</a>.
        </div>
        <div class="flex flex-col bg-slate-50 p-4 outline-dashed outline-1 outline-slate-500">
            <MarketSizeChart />
        </div>
        <p class="text-left ml-24 text-lg max-w-prose text-slate-800 font-serif mt-8 mb-12">
            
            In recent years however, the Japanese government and the
            private sector have begun to address the issue of drug loss and
            drug lag in Japan with a series of measures designed to ease
            market entry for non-Japanese drug developers and incentivize
            innovative drug development in Japan, and signs of improvement
            are beginning to show.
            
            This article will briefly look at the origins of the problem of
            drug loss in Japan, before exploring a number of recent reforms
            that have been made to address the issue, and finally present
            some examples of non-Japanese companies that have begun to
            capitalize on the improved market conditions.
            </p>

    <div class="section-divider"></div>

    <!-- Drug Loss SVG Icon -->
    <div class="flex justify-center md:justify-start md:ml-24 mb-6">
        <svg width="120" height="120" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-sky-800">
            <path d="M5.46284 105.102C5.50735 105.276 6.19717 105.896 6.47533 105.94L64.3873 105.025C65.3219 104.601 65.4332 99.821 65.2997 98.6342C65.0549 96.4675 63.5528 94.2137 63.2747 92.145C62.7517 88.3015 62.3957 85.4489 67.1466 86.3417C69.4942 86.7772 68.3927 90.6751 68.6375 92.5478C69.0492 95.738 70.4511 99.0153 70.6847 102.652C71.3968 113.518 70.6847 125.342 57.2554 126.279C47.0972 126.986 36.4494 126.105 26.3356 125.865C14.1079 125.571 1.65767 128.957 0.511674 112.778C-1.046 90.8166 1.71331 67.1026 0.533926 44.9565C1.16812 39.8936 2.42538 35.6364 6.74236 32.468C9.95783 30.1053 13.8743 30.0617 14.7866 25.4017C15.6433 21.0138 13.8631 23.2023 11.7047 21.1118C11.115 20.5456 10.5809 19.4895 10.4585 18.6947C10.0246 15.9291 10.0913 7.06632 10.4251 4.18101C10.6699 2.0143 12.1163 0.609751 14.3416 0.348439C22.2078 -0.587927 33.0336 0.664191 41.1335 0.71863C45.5617 0.751294 50.2904 -0.0761918 54.8076 0.337551C57.6337 0.598863 59.2025 1.72032 59.5363 4.59475C59.8701 7.46917 59.9034 15.4718 59.5029 18.2809C58.9021 22.4728 54.3292 21.3949 55.0858 25.0859C55.9091 29.0491 62.5404 31.1614 65.3108 34.0685C71.0185 40.0569 71.3634 54.7339 69.3273 62.203C69.1605 62.791 66.1898 71.2836 64.9102 69.7811C65.3219 68.9209 64.4986 67.6035 64.4986 67.1571V51.0102C64.4986 50.5638 63.4861 50.4331 63.0744 50.3896C50.7577 48.9741 35.6372 51.5001 23.0089 50.3896C18.0355 51.7397 11.3152 49.9541 6.51983 50.8142C6.17492 50.8795 5.48509 51.1408 5.48509 51.4239V105.113L5.46284 105.102ZM17.8352 5.19359H14.9424V16.8982H17.8352V5.19359ZM25.6792 5.19359H21.5514V16.8982H25.6792V5.19359ZM33.1004 5.19359C32.3215 5.22625 28.9725 4.9105 28.9725 5.80331V16.909H33.1004V5.19359ZM36.8165 5.19359V16.8982H40.5327C40.5104 13.5882 41.3783 9.89719 40.9666 6.58725C40.6773 4.31166 38.708 5.41135 36.8165 5.19359ZM48.7883 16.909V5.80331C48.7883 4.92139 45.4394 5.22625 44.6605 5.19359V16.8982H48.7883V16.909ZM54.9745 5.19359H52.0817V16.8982H54.9745V5.19359ZM37.2282 24.977C35.4369 24.6504 20.4165 24.106 20.3052 25.1839C20.3497 25.663 20.4944 26.8933 21.0062 27.0131C22.0632 27.2526 26.6027 27.1002 27.9712 27.0131C30.5525 26.8389 34.035 26.24 36.6163 25.7719C37.295 25.6521 37.3283 26.0332 37.2393 24.977H37.2282ZM23.198 36.6816H17.2121C16.322 36.6816 12.6393 37.3784 11.6268 37.6724C8.60044 38.5543 6.68673 41.6901 7.0984 44.7496C10.4696 45.4355 10.058 43.0402 11.4599 41.1457C12.8618 39.2512 14.8645 38.4999 17.1454 37.8249L23.1869 36.6816H23.198ZM12.2721 120.236C16.0216 120.846 21.3288 119.79 25.2675 120.236C25.3009 119.975 24.7223 119.43 24.6444 119.43H18.4583C17.6683 119.43 14.0968 118.472 13.318 118.004C10.1136 116.077 10.147 111.112 9.54616 110.6C9.00098 110.143 6.31956 110.197 6.2528 111.961C6.13041 115.554 8.42242 119.615 12.2721 120.236ZM65.2885 113.377L59.1023 120.236C62.7517 120.051 65.5556 116.937 65.2885 113.377Z" fill="currentColor"/>
            <path d="M114.389 26.5884C111.54 28.1345 89.2212 33.6547 88.8317 34.9068C88.6871 35.3859 90.445 39.3273 90.8011 40.1766C96.0193 52.3929 102.539 64.631 107.157 77.0541C108.102 79.5802 110.695 85.0241 105.51 83.097L86.7511 41.1129C84.4591 47.5368 80.921 53.5797 78.0059 59.8076C74.579 67.1461 71.4971 74.6697 68.1258 82.0299C67.7253 83.2058 63.8979 83.6523 64.2317 82.2695L84.1031 37.0953C85.0488 34.6346 81.8778 35.3314 81.1658 33.0558C79.7416 28.5482 84.3034 27.0021 87.8193 28.9946C96.787 27.1001 105.51 23.7902 114.333 21.2751C114.945 16.8763 110.706 17.2683 110.773 12.2489C110.873 3.86518 122.934 3.44055 124.202 11.1383C124.903 15.4173 121.42 15.3955 121.209 18.9124L148.646 10.2346C151.239 8.5579 153.976 4.73622 157.458 4.91043C160.384 5.05197 161.152 7.89373 159.606 10.0495C158.738 11.2472 156.78 11.4105 157.403 12.9458L169.697 39.6866C168.084 39.1531 165.903 39.36 164.802 38.0208L155.456 18.9015C154.766 18.7382 154.643 19.4676 154.41 19.8923C151.428 25.3798 149.503 31.6948 146.543 37.2259C145.831 37.7921 142.315 39.8064 142.048 38.4672L152.362 14.8729L121.02 24.1713L120.998 110.535C123.79 110.252 126.149 111.155 127.785 113.387C129.676 115.957 129.965 117.775 126.171 118.211C122.377 118.646 113.977 118.526 110.049 118.211C100.514 117.459 109.193 109.609 114.4 110.927V26.5884H114.389Z" fill="currentColor"/>
            <path d="M160.195 38.293C157.325 40.6556 156.946 41.0912 157.336 44.9237C157.458 46.1323 158.649 47.1449 157.714 48.1792C156.501 49.5293 155.456 48.4188 155.01 51.5981C154.699 53.7974 155.834 55.6048 155.678 56.5956C155.622 56.9223 151.194 59.5136 151.973 61.8545C152.318 62.8998 157.136 62.7256 157.536 62.1376C157.926 61.5823 157.547 60.254 157.937 59.2959C158.393 58.1526 160.596 56.7807 160.93 55.3653C161.375 53.4708 160.051 50.9992 160.195 50.8141C160.574 50.3133 163.756 50.052 164.145 47.6022C164.535 45.1524 159.75 41.0476 166.882 43.2579C172.089 44.8693 175.205 52.0336 174.214 57.0638C173.491 60.7657 165.069 56.4976 165.558 62.5187L180 62.9216C180.1 68.7684 177.152 75.1487 172.579 78.8724C159.828 89.2487 139.745 85.2528 133.592 69.781C133.236 68.899 131.011 62.5187 132.758 62.5187H144.719C145.676 62.5187 145.231 60.1016 144.496 59.5027C141.715 57.1945 136.407 62.0614 137.531 53.8736C138.399 47.5586 146.432 38.3038 153.386 38.3038H160.195V38.293ZM144.096 50.8141C142.638 50.4548 142.171 54.135 142.449 54.4398C144.452 54.3201 144.151 52.2731 144.096 50.8141ZM142.349 68.2784C141.603 67.5816 139.578 67.4292 139.567 68.7575C139.567 69.3237 140.535 70.9133 140.891 71.5231C143.083 75.2467 146.699 77.2501 151.127 77.0433L146.165 74.0382C144.53 73.08 143.183 69.0515 142.371 68.2784H142.349ZM168.851 71.4033C168.106 71.24 164.468 71.5339 164.724 72.8078C165.057 74.4737 168.651 72.7316 168.851 71.4033ZM172.979 71.8061C172.479 71.3053 170.187 74.0382 169.653 74.3975C167.661 75.7694 164.824 76.5315 163.077 78.2518C166.827 77.5768 171.155 75.1052 172.979 71.8061Z" fill="currentColor"/>
            <path d="M51.5812 134.477C69.7948 132.343 74.7571 155.328 58.2569 162.808C50.1681 166.477 27.059 173.206 18.4028 173.87C3.62713 175.013 -4.10559 156.787 7.55469 148.327C11.371 145.561 29.1618 140.781 34.8473 139.105C39.5648 137.711 46.9638 135.022 51.5812 134.477ZM40.9445 163.428C41.5119 163.951 54.0623 159.4 55.6645 158.66C61.1497 156.123 65.3554 150.689 62.8965 144.581C58.6908 134.151 43.6036 142.197 35.9933 143.656C41.0669 148.817 43.0362 156.536 40.9445 163.428ZM7.94411 159.389C9.64642 157.342 11.0817 155.099 13.5851 153.814C16.0885 152.53 31.0978 149.503 31.4204 148.261C31.209 147.303 31.0199 145.812 29.707 146.138C22.4416 149.731 7.35442 148.436 7.94411 159.4V159.389Z" fill="currentColor"/>
            <path d="M53.9399 69.781C54.5518 69.8681 55.798 70.5322 55.798 71.1964V84.5124C55.798 84.5124 55.2194 85.1221 55.1749 85.1221H43.2142C43.2142 85.1221 42.5912 85.6883 42.5912 85.7319V98.0462C41.0001 98.6014 28.561 98.9063 28.561 97.4364V85.7319C28.561 85.7319 27.9824 85.1221 27.9379 85.1221H15.5544C15.5544 85.1221 14.9314 84.556 14.9314 84.5124V70.7936C14.9314 69.4543 19.4041 70.1729 20.0494 70.1512C21.2066 70.1076 22.4082 69.781 23.8212 69.7701C24.511 69.7701 28.5499 70.7173 28.5499 69.1821V57.8804C28.5499 56.3888 37.2283 56.8787 38.6747 56.8896C39.2755 56.8896 42.58 56.1057 42.58 57.4776V69.1821C42.58 69.1821 43.1586 69.7919 43.2031 69.7919C46.3073 69.7919 51.0916 69.3781 53.9288 69.7919L53.9399 69.781Z" fill="currentColor"/>
            <path d="M84.1365 138.963C91.9248 138.843 101.838 147.434 107.19 152.519C109.259 154.489 112.82 157.527 113.176 160.391C114.578 171.649 106.178 182.842 93.794 179.358C87.4966 177.583 72.2537 165.758 71.4971 159.193C70.5959 151.441 74.5568 139.116 84.1476 138.963H84.1365ZM84.5815 143.754C80.6095 143.895 76.5929 147.641 77.8502 151.735C78.2062 152.889 83.0906 158.148 84.0475 158.17C85.6941 157.636 96.4643 151.005 96.6423 150.287C97.1208 148.338 87.0849 143.656 84.5815 143.754ZM88.3978 161.414C88.2532 162.122 88.7761 162.405 89.2212 162.83C90.356 163.897 93.705 166.532 95.029 167.239C98.6228 169.156 105.354 169.918 107.891 166.15C111.551 160.717 104.653 157.135 101.338 153.803L88.3978 161.414ZM102.84 173.522C100.225 173.609 97.3989 173.424 94.9067 172.596C90.8567 171.257 80.8765 162.394 77.8724 158.986C77.0602 158.061 76.6485 156.809 75.6138 156.155C75.5025 157.201 75.7362 158.126 76.1145 159.095C77.5164 162.764 89.8108 172.77 93.6494 174.229C96.1862 175.198 101.048 176.113 102.851 173.511L102.84 173.522Z" fill="currentColor"/>
            <path d="M143.361 133.878C144.607 134.771 147.867 133.584 149.058 135.359C150.86 138.027 149.269 142.589 151.717 144.462C153.965 146.182 155.667 144.146 158.115 145.267C158.615 145.986 154.743 150.951 153.976 151.909C147.456 160.14 135.918 173.141 125.092 162.83C114.266 152.519 128.797 138.234 136.452 131.135C137.053 130.579 138.989 129.012 139.645 129.175C139.868 129.229 142.738 131.124 142.883 131.32C143.295 131.864 142.627 133.367 143.35 133.878H143.361ZM130.477 158.583C127.918 154.707 129.554 151.071 131.79 147.565C132.88 145.855 138.466 139.725 138.677 138.93C138.844 138.299 138.021 137.21 137.687 137.199C136.775 137.199 128.207 147.369 127.562 149.078C126.138 152.813 126.271 156.819 130.466 158.583H130.477Z" fill="currentColor"/>
            <path d="M162.109 141.489C160.93 143.199 156.19 142.121 155.734 140.542C155.444 139.529 155.834 138.517 155.344 137.286C155.022 136.481 153.041 134.347 152.34 133.356C151.828 132.626 151.317 131.113 150.916 130.71C150.271 130.079 146.699 130.231 145.186 129.458C144.73 129.229 143.161 127.727 142.861 127.291C141.492 125.277 142.449 124.537 143.695 122.86C146.388 119.245 154.243 110.404 157.748 107.954C170.487 99.0587 181.78 112.897 176.773 125.353C174.181 131.799 166.404 136.198 162.109 141.478V141.489ZM167.616 110.556C158.66 110.143 154.632 119.191 149.459 124.678C151.873 125.168 154.243 122.642 155.878 121.063C160.095 116.991 162.109 115.412 166.682 111.852C167.171 111.471 167.817 111.395 167.616 110.556Z" fill="currentColor"/>
            <path d="M98.6117 120.748C107.001 119.572 118.249 122.511 126.961 120.628C130.299 120.562 141.092 119.833 136.474 125.898C135.718 126.888 128.486 133.301 127.718 133.476L96.0304 133.563C91.1126 133.214 91.6244 128.064 93.1376 124.678C94.228 122.261 95.9414 121.118 98.6117 120.748ZM104.075 125.484C103.819 125.266 98.9232 125.713 98.7452 125.908C98.6784 125.985 98.6562 127.433 98.7118 127.498C99.0901 127.879 104.408 127.248 104.075 125.484Z" fill="currentColor"/>
            <path d="M17.012 101.672C17.6128 102.303 16.8896 102.358 16.4445 102.521C15.0426 103.011 8.34465 104.274 8.33352 101.879C8.3224 99.3418 16.311 100.931 17.0231 101.683L17.012 101.672Z" fill="currentColor"/>
            <path d="M16.1886 54.4398C14.7979 55.1367 9.26813 56.1166 8.40028 54.7991C6.45319 51.8267 15.4543 52.8066 16.1886 54.4398Z" fill="currentColor"/>
            <path d="M14.1192 98.449C14.0858 99.0043 12.2166 99.1676 11.8049 99.2003C10.7479 99.2656 8.55605 99.7556 8.34465 98.253C8.67844 96.8267 13.0177 98.6885 14.1192 98.449Z" fill="currentColor"/>
            <path d="M10.3807 58.1091C11.1596 59.2523 9.257 59.8294 8.34465 59.6878C7.6437 58.0329 9.71318 57.1183 10.3807 58.1091Z" fill="currentColor"/>
            <path d="M56.2097 141.631C56.4099 142.807 55.9315 142.284 55.2528 142.491C53.0609 143.133 45.9735 145.714 44.4492 145.703C43.9597 145.703 42.58 145.605 42.6023 145.06C42.6468 143.83 54.3404 140.934 56.2097 141.631Z" fill="currentColor"/>
            <path d="M55.6867 155.437C58.446 155.35 53.9844 157.462 53.4281 157.68C51.8037 158.333 47.1418 159.912 45.5841 160.118C43.3922 160.412 43.2254 159.171 45.3616 158.268C46.3629 157.843 54.8968 155.458 55.6867 155.437Z" fill="currentColor"/>
            <path d="M76.3259 85.5685L61.884 85.9714C61.7839 91.8182 64.7323 98.1986 69.3052 101.922C82.0559 112.299 102.139 108.303 108.291 92.8308C108.648 91.9489 110.873 85.5685 109.126 85.5685H97.1653M99.5352 91.3283C100.281 90.6314 102.306 90.479 102.317 91.8074C102.317 92.3735 101.349 93.9632 100.993 94.5729C98.8008 98.2966 95.1848 100.3 90.7566 100.093L97.4657 95.9557C99.1012 94.9975 98.7007 92.1013 99.524 91.3283H99.5352ZM73.0214 94.4531C73.7668 94.2898 77.4051 94.5838 77.1492 95.8577C76.8154 97.5235 73.2216 95.7815 73.0214 94.4531ZM68.8935 94.856C69.3942 94.3551 71.6862 97.088 72.2203 97.4473C74.2119 98.8192 77.0491 99.5814 78.7959 101.302C75.0463 100.627 70.7182 98.155 68.8935 94.856Z" fill="currentColor"/>
            <path d="M89.2212 61.321C86.3506 63.6837 85.9723 64.1192 86.3617 67.9518C86.4841 69.1604 87.6746 70.1729 86.74 71.2073C85.5272 72.5574 84.4814 71.4468 84.0363 74.6261C83.7248 76.8255 84.8597 78.6329 84.7039 79.6237C84.6483 79.9503 80.22 82.5417 80.9989 84.8826C81.3438 85.9278 86.1614 85.7536 86.562 85.1657C86.9514 84.6104 86.5731 83.2821 86.9625 82.3239C87.4187 81.1807 89.6217 79.8088 89.9555 78.3934C90.4005 76.4989 89.0765 74.0273 89.2212 73.8422C89.5994 73.3413 92.7815 73.08 93.171 70.6302C93.5604 68.1805 88.7761 64.0757 95.908 66.2859C101.115 67.8974 104.23 75.0616 103.24 80.0919C102.517 83.7938 94.0944 79.5257 94.584 85.5468L109.026 85.9496C109.126 91.7965 106.178 98.1768 101.605 101.901C88.854 112.277 68.7712 108.281 62.6184 92.809C62.2623 91.9271 60.0371 85.5468 61.7839 85.5468H73.7446C74.7014 85.5468 74.2564 83.1296 73.5221 82.5308C70.7405 80.2225 65.4333 85.0895 66.557 76.9017C67.4249 70.5867 75.458 61.3319 82.4119 61.3319H89.2212V61.321ZM73.1215 73.8313C71.664 73.472 71.1967 77.1521 71.4748 77.457C73.4775 77.3372 73.1771 75.2903 73.1215 73.8313ZM71.3747 91.2956C70.6292 90.5988 68.6043 90.4464 68.5931 91.7747C68.5931 92.3409 69.5611 93.9305 69.9172 94.5402C72.109 98.2639 75.725 100.267 80.1533 100.06L75.191 97.0554C73.5554 96.0972 72.2092 92.0687 71.3969 91.2956H71.3747ZM97.8885 94.4205C97.143 94.2572 93.5047 94.5511 93.7606 95.825C94.0944 97.4909 97.6882 95.7488 97.8885 94.4205ZM102.005 94.8233C101.504 94.3225 99.2125 97.0554 98.6784 97.4147C96.6868 98.7866 93.8497 99.5487 92.1028 101.269C95.8524 100.594 100.18 98.1224 102.005 94.8233Z" fill="currentColor"/>
        </svg>
    </div>

 <h3 class="section-header text-sky-800 mt-12 md:ml-24 mb-6">
        Origins of Drug Loss in Japan</h3>

            <h4 class="text-lg font-bold md:ml-24 uppercase text-sky-800">Drug Price Cuts</h4>
            <p class="prose max-w-prose text-left md:ml-24 text-lg text-slate-800 font-serif mt-8 mb-12">
                As with other markets around the world, Japan has faced
                increasing pressure to reduce spending on healthcare and
                drugs. This has led to Japan's <span class="font-mono font-bold text-sm text-sky-900">National Health Insurance (NHI)</span>
                implementing strict drug pricing policies, with yearly downward
                price revisions and premium adjustments on drugs and medical
                devices. Such pricing controls have undoubtedly deterred some
                life science firms from marketing of their products in Japan.
            </p>


            <h4 class="text-lg font-bold md:ml-24 uppercase text-sky-800">Mandatory Japanese Phase 1 Data</h4>
            <p class="prose max-w-prose text-left md:ml-24 text-lg text-slate-800 font-serif mt-8 mb-12">
                Until late 2023, Japan's regulators required phase 1 data from
                trials conducted in Japanese patients before allowing Japanese
                patients to enter later phase global, registrational trials.
                <br>
                <br>
                Given that development of new drugs today increasingly
                comes from emerging biopharma companies, primarily based
                outside Japan and with no Japanese affiliate, as opposed to large
                multinational pharmaceutical companies, the requirement for
                phase 1 data in Japanese patients is likely to have contributed to
                drug lag and drug loss.
            </p>

            <div class="section-divider"></div>

            <h4 class="text-lg font-bold md:ml-24 uppercase text-sky-800">Drug Pricing Reforms</h4>
            <p class="text-left md:ml-24 text-lg max-w-prose text-slate-800 font-serif mt-8 mb-12">
                <span class="font-mono font-bold text-sm text-sky-900">Price Maintenance Premiums (PMP)</span> were first introduced in
                2Ca012, with the aim of protecting prices of innovative drugs from
                frequent price reductions, to encourage investment in new drug
                development, and help counter drug loss. <span class="font-mono font-bold text-sm text-sky-900">PMPs</span> apply specifically
                to drugs that are designated as innovative, which may include
                those with unique mechanisms of action, orphan drugs, and
                therapies with high clinical value.
                <br><br>
                The initial impact of <span class="font-mono font-bold text-sm text-sky-900">PMPs</span> was positive, with the percentage of
                new drugs being approved in Japan within a year of overseas
                approval increasing from just 18% before <span class="font-mono font-bold text-sm text-sky-900">PMPs</span> to 71% after the
                introduction of these premiums <a href="#ref4" class="footnote font-mono underline text-2xs hover:text-blue-500 transition-colors" data-ref="ref4">4</a>.
                </p>
                </div>

                <DrugLagWaffleChart />
                
                <div class="flex flex-col">
                <p class="text-left md:ml-24 text-lg max-w-prose text-slate-800 font-serif mt-8 mb-12">
                Recent updates to drug pricing policies, including updating <span class="font-mono font-bold text-sm text-sky-900">PMP</span>
                eligibility to allow more small and mid-sized life science firms to
                benefit, have further improved conditions for drug developers
                interested in marketing their products in Japan. The new policies,
                introduced by Japan's main government advisory body that sets
                prices for medicines and medical devices - the <span class="font-mono font-bold text-sm text-sky-900">Chuikyo</span> - in April
                of this year <a href="#ref5" class="footnote font-mono underline text-2xs hover:text-blue-500 transition-colors" data-ref="ref5">5</a>, can be summarized as follows:
            </p>

            <h5 class="text-sm font-bold md:ml-24 text-sky-800 mb-4">Expanded Eligibility for Premiums for New Drugs</h5>
            <ul class="list-disc pl-6 prose max-w-prose text-left md:ml-24 text-lg text-slat-800 font-serif md:ml-24 mb-8">
                <li class="mb-4">
                    Previously, new drugs had to apply for marketing approval in
                    Japan within 30 days of filing to US or EU regulatory bodies
                    (<span class="font-mono font-bold text-sm text-sky-900">FDA</span> and <span class="font-mono font-bold text-sm text-sky-900">EMA</span> respectively) to be eligible for <span class="font-mono font-bold text-sm text-sky-900">Sakigake</span>, or
                    pioneer drug designation (see below) and the associated 10%-
                    20% premium. Now, sponsor companies have up to three
                    months from the date of their overseas filing to file a new drug
                    application (<span class="font-mono font-bold text-sm text-sky-900">NDA</span>) in Japan and still be eligible for <span class="font-mono font-bold text-sm text-sky-900">Sakigake</span>
                    designation.
                </li>
                <li class="mb-4">
                    Additionally, a new 'rapid introduction' premium, set at a rate
                    of 5%-10%, has been introduced for drugs launched in Japan
                    within six months of US or EU approval. Unlike the <span class="font-mono font-bold text-sm text-sky-900">Sakigake</span>
                    designation, there is no need for drugs to meet particular
                    conditions of innovativeness, efficacy or therapeutic area to be eligible for the premium.
                </li>
            </ul>

            <h5 class="text-sm font-bold text-sky-800 mb-4 md:ml-24">Revisions to Eligibility for Price Maintenance Premiums (PMPs)</h5>
            <ul class="list-disc pl-6 prose max-w-prose text-left md:ml-24 text-lg text-slate-800 font-serif md:ml-24 mb-8">
                <li class="mb-4">
                    <span class="font-mono font-bold text-sm text-sky-900">PMPs</span> have traditionally been awarded on the basis of a
                    company's level of R&D in Japan, effectively penalizing smaller
                    biotech companies and startups. This so-called 'company
                    index' method for awarding <span class="font-mono font-bold text-sm text-sky-900">PMPs</span> has now been abolished, to
                    ensure that all companies with <span class="font-mono font-bold text-sm text-sky-900">PMP</span>-designated products can
                    receive price protection, regardless of their size.
                </li>
                <li>
                    As well as relaxing <span class="font-mono font-bold text-sm text-sky-900">PMP</span> company criteria, <span class="font-mono font-bold text-sm text-sky-900">PMP</span> product criteria
                    have also been expanded, to allow pediatric and rare disease
                    drugs to benefit from price protection.
                </li>
            </ul>

            <h5 class="text-sm font-bold md:ml-24 text-sky-800 mb-4">Additional Premiums for Multiple Drug Indications</h5>
            <ul class="list-disc pl-6 prose max-w-prose text-left md:ml-24 text-lg text-slate-800 font-serif md:ml-24 mb-8">
                <li>
                    Previously, a drug could only qualify for a post-launch price
                    premium for one indication. This limited the incentives for
                    developers of drugs with multiple applications. Under the
                    2024 reform, drugs can now earn multiple premiums for each
                    different indication approved, allowing for price protection
                    across several therapeutic areas. This change incentivizes the
                    development of new uses for existing drugs.
                </li>
            </ul>

            <h5 class="text-sm font-bold text-sky-800 mb-4 md:ml-24">Post-listing Upward Price Adjustment for Imported Drugs</h5>
            <ul class="list-disc pl-6 prose max-w-prose text-left md:ml-24 text-lg text-slate-800 font-serif md:ml-24 mb-8">
                <li>
                    This measure has been introduced to shield imported drugs
                    from drastic price drops during Japan's annual price revisions,
                    and in doing so help make Japan a more attractive market
                    for foreign companies. Drugs whose active ingredients and
                    formulations are imported, and that did not receive a foreign
                    price adjustment when first listed, will now get a one-time
                    upward price adjustment based on the drug's average price in
                    other major markets.
                </li>
            </ul>

        </div>
           <h4 class="text-lg font-bold uppercase md:ml-24 text-sky-800">Flexible Clinical Trial Requirements</h4>
            <p class="prose max-w-prose text-left md:ml-24 text-lg text-slate-800 font-serif mt-8 mb-12">
                In late 2023, Japan's <span class="font-mono font-bold text-sm text-sky-900">Ministry of Health, Labor, and Welfare
                (MHLW)</span> announced that it was relaxing the requirement for
                early-phase clinical data from Japanese subjects before allowing
                Japanese patients to enter later stage, global multicenter trials <a href="#ref6" class="footnote font-mono underline text-2xs hover:text-blue-500 transition-colors" data-ref="ref6">6</a>.
                <br><br>
                The notification explained that if existing clinical data supports
                the safety and tolerability of dosages being used in late-stage
                trials, and shows the safety of an investigational product to be
                clinically acceptable for Japanese participants, a standalone phase
                I trial in Japan is no longer necessary.
                <br><br>
                By eliminating the additional costs and timelines of conducting
                separate Japanese phase I studies, this new reform removes a
                significant obstacle for non-Japanese companies wishing to
                incorporate Japan into their development plans, and also opens
                up the theoretical opportunity for simultaneous Japanese drug
                approval with the US and Europe.
            </p>

            <div class="section-divider"></div>

            <div class="flex flex-col md:ml-24">
            <h4 class="text-lg font-bold uppercase text-sky-800">Sakigake Designation for Breakthrough Drugs</h4>
            <p class="prose max-w-prose text-left text-lg text-slate-800 font-serif mt-8 mb-12">
                In an effort to counter drug lag, Japan's <span class="font-mono font-bold text-sm text-sky-900">MHLW</span> launched the
                <span class="font-mono font-bold text-sm text-sky-900">Sakigake</span> designation system in 2015 <a href="#ref7" class="footnote font-mono underline text-2xs hover:text-blue-500 transition-colors" data-ref="ref7">7</a>. Meaning 'pioneer' or
                'forerunner', the <span class="font-mono font-bold text-sm text-sky-900">Sakigake</span> program aims to fast-track the
                development and approval of innovative treatments for serious,
                unmet medical needs in Japan. It is similar to other accelerated
                pathways, such as the <span class="font-mono font-bold text-sm text-sky-900">Breakthrough Therapy Designation (BTD)</span>
                in the US and <span class="font-mono font-bold text-sm text-sky-900">Priority Medicines (PRIME)</span> in the EU.
                <br><br>
                </p>
            </div>  
                <div class="flex flex-col">
                <SakigakeBenefits />
                </div>

                <div class="flex flex-col md:ml-24">
                <p class="prose max-w-prose text-left text-lg text-slate-800 font-serif mt-8 mb-12">
                To qualify for <span class="font-mono font-bold text-sm text-sky-900">Sakigake</span> designation, a drug must demonstrate
                strong early clinical data in terms of safety and efficacy, be
                submitted for market approval first in Japan, or at least
                simultaneously with other markets, and be a novel therapy for a
                disease with high unmet need.
                <br><br>
                Companies whose innovative products gain the <span class="font-mono font-bold text-sm text-sky-900">Sakigake</span>
                designation are eligible for a range of advantages. Prioritized
                and comprehensive consultations with the <span class="font-mono font-bold text-sm text-sky-900">Pharmaceuticals and
                Medical Devices Agency (PMDA)</span> - Japan's regulatory agency -
                (within one month versus two months in the standard process)
                allow companies to receive guidance and submit materials to the
                agency for review before applications, with a <span class="font-mono font-bold text-sm text-sky-900">PMDA</span> manager
                even assigned as a 'concierge' during the process. An accelerated
                review process for <span class="font-mono font-bold text-sm text-sky-900">Sakigake</span>-designated products aims to shorten
                the approval timeline from 12 months to 6 months. If approved
                under the <span class="font-mono font-bold text-sm text-sky-900">Sakigake</span> designation, drugs may also qualify for higher
                price premiums, as well as extended market exclusivity, further
                rewarding companies for bringing new drugs to market in Japan.
            </p>            
            </div>
            <SakigakeWaffleChart />
            
            
            <div class="section-divider"></div>

            <div class="flex flex-col md:ml-24">    
            <h4 class="text-lg font-bold uppercase text-sky-800">Investing in Drug Discovery</h4>
            <p class="prose max-w-prose text-left text-lg text-slate-800 font-serif mt-8 mb-12">
                In addition to regulatory reforms to encourage more non-
                Japanese firms to develop and launch their products in Japan,
                the Japanese government and some pharmaceutical companies
                have implemented a number of financial incentives to boost the
                country's biotech 'engine'.
                <br><br>
                To encourage investments in Japan's biotech sector, the
                government offers subsidies, tax breaks, and startup funds. For
                example, the <span class="font-mono font-bold text-sm text-sky-900">'Strengthening Program for Pharmaceutical Startup
                Ecosystem'</span> provides up to $60 million per project, as well as
                collaboration with venture capital firms throughout the program
                to support startups during early stage drug development <a href="#ref8" class="footnote font-mono underline text-2xs hover:text-blue-500 transition-colors" data-ref="ref8">8</a>.
            </p>
            </div>
                
                <AMEDEcosystemFlow />
                
                <div class="flex flex-col md:ml-24">
                <p class="prose max-w-prose text-left text-lg text-slate-800 font-serif mt-8 mb-12">
                Japanese pharmaceutical companies have also created dedicated
                research funds to encourage partnerships and invest in new drug
                development. For instance, <span class="font-mono font-bold text-sm text-sky-900">Astellas</span>, <span class="font-mono font-bold text-sm text-sky-900">Shionogi</span>, and <span class="font-mono font-bold text-sm text-sky-900">Daiichi Sankyo</span>
                have all launched funds aimed at supporting innovative research
                both domestically and internationally <a href="#ref9" class="footnote font-mono underline text-2xs hover:text-blue-500 transition-colors" data-ref="ref9">9</a>.
                <br><br>
                Finally, with the long-term goal of building 'clusters' of biotech
                innovation in a similar style to the technology hubs of <span class="font-mono font-bold text-sm text-sky-900">Silicon
                Valley</span>, innovation centers such as the <span class="font-mono font-bold text-sm text-sky-900">Shonan iPark</span> - opened
                by <span class="font-mono font-bold text-sm text-sky-900">Takeda</span> in 2018 - and the <span class="font-mono font-bold text-sm text-sky-900">SakuLab-Tsukuba</span> - opened by
                <span class="font-mono font-bold text-sm text-sky-900">Astellas</span> in 2023 - have been set up to promote collaborations
                between academia, startups, and major pharmaceutical
                companies <a href="#ref10" class="footnote font-mono underline text-2xs hover:text-blue-500 transition-colors" data-ref="ref10">10</a>. Similarly, The <span class="font-mono font-bold text-sm text-sky-900">Greater Tokyo Biocommunity (GTB)</span>
                and <span class="font-mono font-bold text-sm text-sky-900">Biocommunity Kansai (BiocK)</span> are biotech hubs created
                to support Japan's <span class="font-mono font-bold text-sm text-sky-900">'2030 Bioeconomy Strategy'</span> by attracting
                significant private investment and encouraging collaboration
                across industry, academia, and international partners. The <span class="font-mono font-bold text-sm text-sky-900">GTB</span>
                alone has already attracted over $3.3 billion in investment <a href="#ref11" class="footnote font-mono underline text-2xs hover:text-blue-500 transition-colors" data-ref="ref11">11</a>.
            </p>
            </div>
            <GTBInvestmentChart />

            <div class="section-divider"></div>

            <div class="flex flex-col md:ml-24">
            <h4 class="text-lg font-bold uppercase text-sky-800">English Language Registration</h4>
            <p class="prose max-w-prose text-left text-lg text-slate-800 font-serif mt-8 mb-12">
                In another effort to ease the application process for non-Japanese
                firms seeking marketing approval for their products in Japan, the
                <span class="font-mono font-bold text-sm text-sky-900">MHLW</span> also announced in September 2024 that, under certain
                conditions, it would accept filing documents to be submitted in
                English. Provided that a drug contains a new active ingredient, is
                a new combination of (prescription) drugs, or has a new route
                of administration, and that its parent company has no offices in
                Japan, all documents for approval filing will be accepted in English.
                <br><br>
                It is hoped that by removing hurdles for more innovative foreign
                products to enter the Japanese market, this new measure will
                contribute to addressing the drug gap between Japan and the
                global market.
            </p>
            </div>
            <div class="section-divider"></div>

            <div class="flex flex-col md:ml-24">    
         <h3 class="section-header text-sky-800 mb-6">Impact of the Changes</h3>
            <p class="prose max-w-prose text-left text-lg text-slate-800 font-serif mt-8 mb-12">
                Foreign biotech companies are now taking advantage of the
                recent reforms, with a growing number of firms conducting drug
                development and launches in Japan in recent years.
                <br><br>
                For example, this year <span class="font-mono font-bold text-sm text-sky-900">Gossamer Bio</span>, a San Diego-based biotech
                company, was one of the first companies to take advantage of
                the changes allowing Japanese patients to enter global phase
                3 studies without the need for a bridging study in Japanese
                patients. This allowed <span class="font-mono font-bold text-sm text-sky-900">Gossamer</span> to include Japanese patients in
                its global phase 3 <span class="font-mono font-bold text-sm text-sky-900">PROSPERA</span> study of <span class="font-mono font-bold text-sm text-sky-900">seralutinib</span>, a treatment for
                pulmonary arterial hypertension.
                <br><br>
                Similarly, <span class="font-mono font-bold text-sm text-sky-900">Mannkind Corporation</span>, a biopharma company from the
                US, received clearance from the <span class="font-mono font-bold text-sm text-sky-900">PMDA</span> in September this year
                to include Japanese patients in their global phase 3 trial of their
                <span class="font-mono font-bold text-sm text-sky-900">Clofazimine Inhalation Suspension</span>, targeting nontuberculous
                mycobacteria (NTM) lung disease. This allows the company to
                move towards launching their product on the Japanese market
                despite having no previous data in Japanese patients.
                <br><br>
                Meanwhile <span class="font-mono font-bold text-sm text-sky-900">Belite Bio</span>'s efforts to bring its vision loss product
                <span class="font-mono font-bold text-sm text-sky-900">tinlarebent</span> to Japanese patients were boosted earlier this year
                following <span class="font-mono font-bold text-sm text-sky-900">Sakigake</span> designation and orphan drug designation for
                the product in Japan. These privileges mean <span class="font-mono font-bold text-sm text-sky-900">Belite Bio</span> will benefit
                from a streamlined registration process, as well as potential price
                premiums and price protection if <span class="font-mono font-bold text-sm text-sky-900">tinlarebent</span> is approved.
                <br><br>
                Another company that saw commercial success in Japan recently
                was the Swedish biotech firm <span class="font-mono font-bold text-sm text-sky-900">Calliditas</span>. It chose partnering as a
                route of entry to the Japanese market, teaming up with Japan's
                <span class="font-mono font-bold text-sm text-sky-900">Viatris</span> to bring <span class="font-mono font-bold text-sm text-sky-900">Nefecon</span>, a treatment for IgA nephropathy, to the
                Japanese market. The deal was successful, with <span class="font-mono font-bold text-sm text-sky-900">Nefecon</span> now in
                phase 3 trials. It also caught the eye of Japanese conglomerate
                <span class="font-mono font-bold text-sm text-sky-900">Asahi Kasei</span>, who acquired <span class="font-mono font-bold text-sm text-sky-900">Calliditas</span> for $1.1BN in June this year.
                <br><br>
                </p>
                </div>
                <div class="w-full md:px-2">
                    <JapanSuccessTimelineCards />
                </div>
                
                <div class="flex flex-col md:ml-24">
                <p class="text-left text-lg max-w-prose text-slate-800 font-serif mt-8 mb-12">
                Following the introduction of incentives to boost drug development in Japan such as <span class="font-mono font-bold text-sm text-sky-900">Sakigake</span> designation and <span class="font-mono font-bold text-sm text-sky-900">PMPs</span>, the average
                drug lag has also decreased by approximately three years since
                new reforms introduced <a href="#ref12" class="footnote font-mono underline text-2xs hover:text-blue-500 transition-colors" data-ref="ref12">12</a>.
                <br><br>
                Today, Japan's biotech market is growing, valued at $34BN in
                2020 and projected to reach a value of $100BN in 2030.
            </p>
            </div>
            <BiotechMarketGrowthChart />
          
            <div class="section-divider"></div>

            <div class="flex flex-col md:ml-24">
                <h3 class="section-header text-sky-800 mb-6">Conclusion</h3>   
                <p class="prose max-w-prose text-left text-lg text-slate-800 font-serif mt-8 mb-12">
                The Japanese government has clearly recognized the need to
                address the issues of drug lag and loss. For too long, patients have
                had to wait for, or simply gone without the latest drugs available
                in other markets.
                Recent reforms to the regulatory system have created new
                opportunities for non-Japanese companies to establish a foothold
                in the world's third largest pharmaceutical market.
                Many of the reforms specifically benefit companies developing
                innovative treatments for rare diseases and diseases with a
                high clinical need. That means these reforms can particularly
                help smaller and mid-sized companies from the biopharma
                sector, where many of the most innovative therapies are being
                developed nowadays.
                A number of US and Europe-based firms have already started to
                make use of the improved conditions, whether through enjoying
                an accelerated review process, more sustained price protections
                for their products in Japan, or simply by being able to include
                Japan in global registrational trials without having to conduct
                bridging studies in Japan.
                <br><br>
                Significant recent investment into life science innovation projects
also underline how serious Japan is about building drug discovery
infrastructure for the long term. The products of these initiatives
will also enable more access to the Japanese market for foreign
drug developers through partnerships and collaborations with
an invigorated domestic market.
A large and important market that was effectively isolating itself
from the rest of the world with restrictive regulatory barriers is
now opening its doors to foreign drug developers, easing access
and creating a more favorable environment for them.
This could bring significant rewards for companies that bring
their products to the Japanese market, and for Japanese patients.
            </p>
            </div>
            </div>
        </div>

<div class="section-divider"></div>



<!-- avapritinib Drawer -->
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

    .section-divider {
        width: 100%;
        height: 1px;
        background: #e2e8f0;
        margin: 3rem 0
    }

</style>