<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import "carbon-components-svelte/css/all.css";
    import {
        Dropdown,
        Button,
        Column
    } from "carbon-components-svelte";
    import Shuffle from "carbon-icons-svelte/lib/Shuffle.svelte";
    import Reset from "carbon-icons-svelte/lib/Reset.svelte";

    export let constellationData: any[];
    export let timelineComponent: any;

    // Add blank entry at the beginning of each list
    $: therapeuticAreas = [
        { id: "", text: "---" },
        ...[...new Set(constellationData.map(d => d.name))]
            .sort()
            .map((area, index) => ({
                id: (index + 1).toString(),
                text: area
            }))
    ];

    $: sponsors = [
        { id: "", text: "---" },
        ...[...new Set(constellationData.map(d => d.Sponsor))]
            .sort()
            .map((sponsor, index) => ({
                id: (index + 1).toString(),
                text: sponsor
            }))
    ];

    $: treatmentTypes = [
        { id: "", text: "---" },
        ...[...new Set(constellationData.map(d => d["Treatment Type"]))]
            .sort()
            .map((type, index) => ({
                id: (index + 1).toString(),
                text: type
            }))
    ];

    let selectedArea = "";
    let selectedSponsor = "";
    let selectedTreatment = "";

    const dispatch = createEventDispatcher();

    // Helper function to get relevant entries based on a filter
    function getRelevantEntries(filterType: 'area' | 'sponsor' | 'treatment') {
        let filteredData = constellationData;
        
        if (filterType !== 'area' && selectedArea) {
            const areaText = therapeuticAreas.find(a => a.id === selectedArea)?.text;
            filteredData = filteredData.filter(d => d.name === areaText);
        }
        
        if (filterType !== 'sponsor' && selectedSponsor) {
            const sponsorText = sponsors.find(s => s.id === selectedSponsor)?.text;
            filteredData = filteredData.filter(d => d.Sponsor === sponsorText);
        }
        
        if (filterType !== 'treatment' && selectedTreatment) {
            const treatmentText = treatmentTypes.find(t => t.id === selectedTreatment)?.text;
            filteredData = filteredData.filter(d => d["Treatment Type"] === treatmentText);
        }
        
        return filteredData;
    }

    // Computed properties for filtered options
    $: relevantSponsors = new Set(getRelevantEntries('sponsor').map(d => d.Sponsor));
    $: relevantAreas = new Set(getRelevantEntries('area').map(d => d.name));
    $: relevantTreatments = new Set(getRelevantEntries('treatment').map(d => d["Treatment Type"]));

    // Filter the data based on selections
    $: filteredData = constellationData.filter(entry => {
        const areaMatch = !selectedArea || entry.name === therapeuticAreas.find(a => a.id === selectedArea)?.text;
        const sponsorMatch = !selectedSponsor || entry.Sponsor === sponsors.find(s => s.id === selectedSponsor)?.text;
        const treatmentMatch = !selectedTreatment || entry["Treatment Type"] === treatmentTypes.find(t => t.id === selectedTreatment)?.text;
        return areaMatch && sponsorMatch && treatmentMatch;
    });

    // Update the visualization when filters change
    $: {
        const filteredIds = filteredData.map(entry => entry.id);
        
        if (timelineComponent && timelineComponent.updateHighlightedEntries) {
            timelineComponent.updateHighlightedEntries(
                selectedArea || selectedSponsor || selectedTreatment ? filteredIds : []
            );
        }

        dispatch('filterUpdate', {
            filteredEntries: filteredIds,
            filters: {
                therapeuticArea: therapeuticAreas.find(a => a.id === selectedArea)?.text || null,
                sponsor: sponsors.find(s => s.id === selectedSponsor)?.text || null,
                treatmentType: treatmentTypes.find(t => t.id === selectedTreatment)?.text || null
            }
        });
    }

    function resetFilters() {
        selectedArea = "";
        selectedSponsor = "";
        selectedTreatment = "";
    }

    function randomizeFilters() {
        resetFilters();
        const filterType = Math.floor(Math.random() * 3);
        
        switch (filterType) {
            case 0:
                selectedArea = therapeuticAreas[Math.floor(Math.random() * (therapeuticAreas.length - 1)) + 1].id;
                break;
            case 1:
                selectedSponsor = sponsors[Math.floor(Math.random() * (sponsors.length - 1)) + 1].id;
                break;
            case 2:
                selectedTreatment = treatmentTypes[Math.floor(Math.random() * (treatmentTypes.length - 1)) + 1].id;
                break;
        }
    }
</script>

<div class="filters-container">
    <div class="filter-row">
        <span class="filter-label">Show entries for</span>
        
        <Dropdown
            light
            size="sm"
            titleText="Therapeutic Area"
            selectedId={selectedArea}
            bind:selectedId={selectedArea}
            items={therapeuticAreas.map(area => ({
                ...area,
                disabled: area.id !== "" && !relevantAreas.has(area.text),
                className: area.id !== "" && !relevantAreas.has(area.text) ? 'disabled-option' : ''
            }))}
        />

        <span class="filter-label">developed by</span>

        <Dropdown
            light
            size="sm"
            titleText="Sponsor"
            selectedId={selectedSponsor}
            bind:selectedId={selectedSponsor}
            items={sponsors.map(sponsor => ({
                ...sponsor,
                disabled: sponsor.id !== "" && !relevantSponsors.has(sponsor.text),
                className: sponsor.id !== "" && !relevantSponsors.has(sponsor.text) ? 'disabled-option' : ''
            }))}
        />

        <span class="filter-label">using</span>

        <Dropdown
            light
            size="sm"
            titleText="Treatment Type"
            selectedId={selectedTreatment}
            bind:selectedId={selectedTreatment}
            items={treatmentTypes.map(type => ({
                ...type,
                disabled: type.id !== "" && !relevantTreatments.has(type.text),
                className: type.id !== "" && !relevantTreatments.has(type.text) ? 'disabled-option' : ''
            }))}
        />

        <Column padding>
            <Button 
                kind="secondary"
                icon={Shuffle}
                on:click={randomizeFilters}
                tooltipText="Randomize filters"
            />
            <Button 
                kind="ghost"
                icon={Reset}
                on:click={resetFilters}
                tooltipText="Reset all filters"
            />
        </Column>
    </div>

    {#if filteredData.length > 0}
        <div class="filter-summary">
            Showing {filteredData.length} entries
            {#if selectedArea || selectedSponsor || selectedTreatment}
                matching:
                {#if selectedArea}
                    <span class="filter-tag">
                        {therapeuticAreas.find(a => a.id === selectedArea)?.text}
                    </span>
                {/if}
                {#if selectedSponsor}
                    <span class="filter-tag">
                        {sponsors.find(s => s.id === selectedSponsor)?.text}
                    </span>
                {/if}
                {#if selectedTreatment}
                    <span class="filter-tag">
                        {treatmentTypes.find(t => t.id === selectedTreatment)?.text}
                    </span>
                {/if}
            {/if}
        </div>
    {:else}
        <div class="no-results">
            No entries match the selected filters
        </div>
    {/if}
</div>


<style>
    .filters-container {
        padding: 1rem;
        background-color: #fff;
        border-bottom: 1px solid #e0e0e0;
    }

    .filter-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
    }

    .filter-label {
        font-size: 14px;
        font-weight: 400;
        color: #525252;
    }

    .filter-summary {
        margin-top: 1rem;
        font-size: 14px;
        color: #525252;
        text-align: center;
    }

    .filter-tag {
        background-color: #e0e0e0;
        padding: 2px 8px;
        border-radius: 12px;
        margin: 0 4px;
        font-size: 12px;
        font-weight: 500;
    }

    .no-results {
        margin-top: 1rem;
        text-align: center;
        color: #da1e28;
        font-size: 14px;
    }
    :global(.disabled-option) {
        color: #8d8d8d !important;
        opacity: 0.6;
    }

    :global(.bx--dropdown-item:hover .disabled-option) {
        background-color: transparent;
        cursor: not-allowed;
    }

    /* Update dropdown styles to handle disabled items */
    :global(.bx--dropdown-item[disabled]) {
        cursor: not-allowed;
    }

    :global(.bx--dropdown-item[disabled]:hover) {
        background-color: transparent;
    }
</style>