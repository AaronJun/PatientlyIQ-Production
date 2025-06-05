<script lang="ts">
    const benefits = [
        {
            number: "01",
            title: "2x Acceleration in Regulatory Review",
            description: "Drugs with Sakigake designation benefit from a shortened approval timeline—reduced from 12 months to 6 months—enabling faster patient access and earlier market entry."
        },
        {
            number: "02", 
            title: "Streamlined Regulatory Support + Concierge Guidance",
            description: "Companies receive prioritized, streamlined interactions with the PMDA, including a dedicated regulatory concierge to guide them through the process and facilitate early submission of key materials."
        },
        {
            number: "03",
            title: "Potential Pricing Flexibility + Market Exclusivity", 
            description: "Approved drugs may receive higher price premiums and extended market exclusivity, enhancing the financial return for companies investing in innovative treatments for the Japanese market."
        }
    ];
</script>

<div class="sakigake-benefits-container flex flex-col md:align-start md:justify-center px-8 pb-32 pt-8 bg-slate-50 outline-1 outline-dashed outline-slate-200">
    <div class="align-middle text-left md:w-1/3 mb-8">
        <h5 class="text-sm font-semibold text-slate-700">
            Benefits of Sakigake Designation
        </h5>
    </div>
    <div class="flex flex-col benefits-grid justify-around">
        {#each benefits as benefit}
            <div class="benefit-card">
                <div class="benefit-number">
                    {benefit.number}
                </div>
                <div class="benefit-content pr-12">
                    <h4 class="benefit-title">{benefit.title}</h4>
                    <p class="benefit-description text-sm text-slate-600">{benefit.description}</p>
                </div>
            </div>
        {/each}
    </div>
</div>


<style>

    .benefits-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    @media (min-width: 768px) {
        .benefits-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
        }
    }

    .benefit-card {
        border-left: 3px solid #0c4a6e;
        padding-left: 1.5rem;
    }

    .benefit-number {
        font-size: 2rem;
        font-weight: 700;
        color: #0c4a6e;
        margin-bottom: 1rem;
        font-family: 'IBM Plex Mono', monospace;
    }

    .benefit-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 0.75rem;
        line-height: 1.4;
    }


    @media (max-width: 767px) {
        .sakigake-benefits-container {
            padding: 1rem;
        }
        
        .benefit-card {
            padding: 1.25rem;
        }
        
        .benefit-number {
            font-size: 1.75rem;
        }
    }
</style> 