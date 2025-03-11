<!-- RPDPRVSearch.svelte -->
<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { Search, Building, Medication } from 'carbon-icons-svelte';
    import { clickOutside } from '../click-outside';

    export let data: any[] = [];
    export let onShowDrugDetail: (detail: any) => void;
    export let onShowCompanyDetail: (detail: any) => void;

    let searchTerm = "";
    let isOpen = false;
    let searchResults: {
        companies: { name: string; count: number }[];
        drugs: { name: string; company: string; therapeuticArea: string }[];
    } = {
        companies: [],
        drugs: []
    };

    $: if (searchTerm.length > 0) {
        isOpen = true;
        const term = searchTerm.toLowerCase();
        
        // Find matching companies
        const matchingCompanies = [...new Set(
            data.filter(d => 
                d.Company.toLowerCase().includes(term)
            ).map(d => d.Company)
        )];

        // Get company counts
        searchResults.companies = matchingCompanies.map(company => ({
            name: company,
            count: data.filter(d => d.Company === company).length
        }));

        // Find matching drugs
        searchResults.drugs = data
            .filter(d => 
                d.Candidate.toLowerCase().includes(term)
            )
            .map(d => ({
                name: d.Candidate,
                company: d.Company,
                therapeuticArea: d.TherapeuticArea1
            }));
    } else {
        isOpen = false;
        searchResults = { companies: [], drugs: [] };
    }

    function handleClickOutside() {
        isOpen = false;
    }

    function handleCompanyClick(company: string) {
        const companyEntries = data.filter(d => d.Company === company);
        onShowCompanyDetail({
            Company: company,
            entries: companyEntries,
            color: '#37587e',
            companyUrl: companyEntries[0]?.["Link to CrunchBase"] || ""
        });
        isOpen = false;
        searchTerm = "";
    }

    function handleDrugClick(drugName: string) {
        const drugEntry = data.find(d => d.Candidate === drugName);
        if (drugEntry) {
            onShowDrugDetail({
                drugName: drugEntry.Candidate,
                year: drugEntry["RPDD Year"],
                Company: drugEntry.Company,
                therapeuticArea: drugEntry.TherapeuticArea1,
                entries: data.filter(d => d.TherapeuticArea1 === drugEntry.TherapeuticArea1),
                color: '#37587e',
                currentStage: drugEntry["Current Development Stage"],
                indication: drugEntry.Indication,
                rpddAwardDate: drugEntry["RPDD Year"],
                voucherAwardDate: drugEntry["PRV Issue Year"] || "",
                treatmentClass: drugEntry.Class1,
                mechanismOfAction: drugEntry.MOA,
                companyUrl: drugEntry["Link to CrunchBase"] || ""
            });
        }
        isOpen = false;
        searchTerm = "";
    }
</script>

<div class="relative w-full max-w-lg" use:clickOutside on:click_outside={handleClickOutside}>
    <div class="relative">
        <Search size={20} class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <input
            type="text"
            bind:value={searchTerm}
            placeholder="Company/Drug Search"
            class="w-full pl-10 pr-4 py-2 border border-slate-200 focus:outline-none focus:border-slate-400 text-xs"
        />
    </div>

    {#if isOpen && (searchResults.companies.length > 0 || searchResults.drugs.length > 0)}
        <div 
            class="absolute top-full mt-1 w-full bg-slate-50 rounded shadow-lg border border-slate-200 overflow-hidden z-50"
            transition:fly={{y: -5, duration: 200}}
        >
            {#if searchResults.companies.length > 0}
                <div class="border-b border-slate-100">
                    <div class="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-50">
                        Companies
                    </div>
                    {#each searchResults.companies as company}
                        <button
                            class="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                            on:click={() => handleCompanyClick(company.name)}
                        >
                            <Building size={16} class="text-slate-400" />
                            <div class="flex-1 text-left">
                                <div class="text-sm font-medium text-slate-900">{company.name}</div>
                                <div class="text-xs text-slate-500">{company.count} RPDDs</div>
                            </div>
                        </button>
                    {/each}
                </div>
            {/if}

            {#if searchResults.drugs.length > 0}
                <div>
                    <div class="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-50">
                        Drug Candidates
                    </div>
                    {#each searchResults.drugs as drug}
                        <button
                            class="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                            on:click={() => handleDrugClick(drug.name)}
                        >
                            <Medication size={16} class="text-slate-400" />
                            <div class="flex-1 text-left">
                                <div class="text-sm font-medium text-slate-900">{drug.name}</div>
                                <div class="text-xs text-slate-500">
                                    {drug.company} · {drug.therapeuticArea}
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>