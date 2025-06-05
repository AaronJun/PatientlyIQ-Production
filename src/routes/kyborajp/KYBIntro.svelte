<script lang="ts">
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import MarketSizeChart from '$lib/components/MarketSizeChart.svelte';
    import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
    import JPMap from '/static/profiles/JP.svg';
    import "carbon-components-svelte/css/all.css";

    onMount(() => {
        const footnotes = document.querySelectorAll('.footnote');
        
        footnotes.forEach(footnote => {
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

<div class="flex flex-col align-baseline">
    <div class="bg-slate-800 px-32 flex flex-col justify-around relative">
        <div class="text-left py-16 relative z-10">
        <img src={PIQLogo} alt="PIQ Logo" class="h-8 w-8 mb-12" />
    
        <h1 class="text-4xl font-serif text-slate-100 mb"><span class="italic">Emerging from Drug Loss:</span> <br>
            <span class="text-2xl font-bold">A New Dawn for Biotech in Japan</span></h1>
        </div>
        <div class="text-left py-16">
                <h2 class="text-lg font-base text-slate-50 max-w-prose text-left">
                Recent reforms to pharmaceutical and medical device regulations
                in Japan are creating greater opportunities for foreign drug
                developers to market their products in Japan, and deliver the
                latest medicines to Japanese patients.
            </h2>
            
            
        </div>
    </div>
</div>

<style>
    .section-header {
        font-family: 'IBM Plex Sans', sans-serif;
    }
    
    .footnote {
        text-decoration: none;
        color: inherit;
    }
    
    .footnote:hover {
        text-decoration: underline;
    }

    @media (min-width: 1024px) {
        .sticky {
            position: sticky;
            top: 2rem;
        }
    }

    /* Remove the old hover styles since we're handling it with JavaScript */
    [data-ref="ref1"]:hover,
    [data-ref="ref2"]:hover {
        background-color: #f1f5f9;
        color: #FF1010;
    }
</style>