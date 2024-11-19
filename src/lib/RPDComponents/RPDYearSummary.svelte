<script lang="ts">
  import { fly } from 'svelte/transition';
    import { onMount, createEventDispatcher } from 'svelte';
    import { 
        ArrowRight,
        Building, 
        DocumentAdd,
        Medication,
        Stethoscope,
        WhitePaper,
        Money
    } from 'carbon-icons-svelte';
    import "carbon-components-svelte/css/all.css";

    export let constellationData: any[];
    export let currentYear: string;
    export let hoveredPetalData: any = null;
    export let isDrawerOpen: boolean = false;
    export let selectedData: any = null;

    const dispatch = createEventDispatcher();
  
    $: yearData = constellationData
      .filter(d => d.Year === currentYear)
      .sort((a, b) => {
        const dateA = new Date(`${a.Year}-${a.Month}-${a.Date}`);
        const dateB = new Date(`${b.Year}-${b.Month}-${b.Date}`);
        return dateA.getTime() - dateB.getTime();
      });

    $: groupedYearData = groupByTherapeuticArea(yearData);

    $: topSponsors = getTopSponsors(constellationData, 5);
    $: topPurchasers = getTopPurchasers(constellationData, 5);

    function groupByTherapeuticArea(data) {
        return data.reduce((acc, entry) => {
            if (!acc[entry.name]) {
                acc[entry.name] = [];
            }
            acc[entry.name].push(entry);
            return acc;
        }, {});
    }

    function getTopSponsors(data, count) {
        const sponsorCounts = data.reduce((acc, entry) => {
            acc[entry.Sponsor] = (acc[entry.Sponsor] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(sponsorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(([sponsor, count]) => ({ sponsor, count }));
    }

    function getTopPurchasers(data, count) {
        const purchaserCounts = data.reduce((acc, entry) => {
            if (entry.Purchased === "Y") {
                acc[entry.Sponsor] = (acc[entry.Sponsor] || 0) + 1;
            }
            return acc;
        }, {});

        return Object.entries(purchaserCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(([sponsor, count]) => ({ sponsor, count }));
    }

    const therapeuticAreaColors = {
        "Gastroenterology": "#39FF14",
        "Neurology": "#4D4DFF",
        "Ophthalmology": "#E79028",
        "Immunology": "#EA38A5",
        "Metabolic": "#133B11",
        "Dermatology": "#559368",
        "Hematology": "#CF3630",
        "Orthopedics": "#441780",
        "Pulmonology": "#CBC09F",
        "Nephrology": "#ACA3DB",
        "Oncology": "#FF84DE",
        "Genetic": "#4D4DFF",
        "Hepatology": "#FF00D4",
    };

    function getColor(name: string): string {
        return therapeuticAreaColors[name] || "#000000";
    }
  
    function formatDate(month: string, date: string, year: string): string {
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      const monthIndex = monthNames.indexOf(month);
      if (monthIndex === -1) {
        console.log(`Invalid month: ${month}`);
        return `${date}, ${year}`;
      }
      return `${monthNames[monthIndex]} ${date}, ${year}`;
    }
  
    let mounted = false;
  
    onMount(() => {
      mounted = true;
      console.log('YearlySummary component mounted');
    });

    function handleOverviewTileClick(data) {
        dispatch('overviewTileClick', { data });
    }

    function handleRowClick(entry) {
        dispatch('clusterElementClick', { entry, color: getColor(entry.name) });
    }

    function handleSponsorClick(sponsor) {
      const sponsorData = constellationData.filter(d => d.Sponsor === sponsor);
      const sponsorTransactions = constellationData.filter(d => 
        (d.Sponsor === sponsor && d.Purchased === "Y") || d.Purchaser === sponsor
      );
      dispatch('sponsorClick', { 
        sponsor, 
        sponsorData, 
        sponsorTransactions, 
        fromOverview: currentYear === "Overview" 
      });
    }  

    function isRowHighlighted(entry) {
        if (isDrawerOpen && selectedData) {
            return entry.id === selectedData.id;
        }
        return hoveredPetalData && hoveredPetalData.id === entry.id;
    }
</script>
  
{#if mounted}

<div class="year-summary">
  {#if currentYear === "Overview"}
      <div class="table-container">
        <h3>Most Active Sponsors</h3>
          <table>
              <tbody>
                  {#each topSponsors as { sponsor, count }}
                      <tr class="sponsor-row clickable-row-2" 
                          on:click={() => handleSponsorClick(sponsor)}
                          transition:fly={{ duration: 400 }}>
                          <div class="entry-details">
                          <div class="main-info">
                              <Building size="12" />
                              <span class="sponsor">{sponsor}</span>
                          </div>
                          <div class="entry-bottom-2">
                            <WhitePaper size="10" />
                              <span class="count">{count} vouchers awarded</span>
                              <span class="arrow">
                                  <ArrowRight size="10" />
                              </span>
                          </div>
                          </div>
                      </tr>
                  {/each}
              </tbody>
          </table>
      </div>

      <div class="table-container">
        <h3>Most Active Transactors</h3>
          <table>
              <tbody>
                  {#each topPurchasers as { sponsor, count }}
                  
                      <tr class="sponsor-row clickable-row-2" 
                          on:click={() => handleSponsorClick(sponsor)}
                          transition:fly={{ duration: 400 }}>
                          <div class = "entry-details">
                          <div class="main-info">
                              <Building size="12" />
                              <span class="sponsor">{sponsor}</span>
                          </div>
                          <div class="entry-bottom-2">
                            <Money size="10" />
                              <span class="count">{count} vouchers sold</span>
                              <span class="arrow">
                                  <ArrowRight size="10" />
                              </span>
                          </div>
                          </div>
                      </tr>
                  {/each}
              </tbody>
          </table>
      </div>
    {:else}
        <h3>Vouchers Awarded in {currentYear}</h3>
        <div class="table-container">
            {#each Object.entries(groupedYearData) as [therapeuticArea, entries]}
                <div class="therapeutic-area-group">
                    <h4 style="background-color: {getColor(therapeuticArea)}">{therapeuticArea}</h4>
                    <table>
                        <tbody>
                            {#each entries as entry (entry["Drug Name"])}
                            <tr class="clickable-row"
                            class:highlighted={isRowHighlighted(entry)}
                            on:click={() => handleRowClick(entry)}
                            on:mouseenter={() => dispatch('rowHover', { entry })}
                            on:mouseleave={() => dispatch('rowLeave')}
                        >
                                    <td>
                                        <div class="entry-details"
                                            style="border-top: 4px solid {getColor(entry.name)}">
                                            <div class="main-info">
                                                <Building size="12" />
                                                <span class="sponsor">{entry.Sponsor}</span> 
                                            </div>        
                                            
                                            <div class="main-info">
                                                <Medication size="12" />
                                                <span class="drug-name">{entry["Drug Name"]}</span>
                                            </div>
                                    
                                            <div class="entry-bottom">
                                                <Stethoscope size="12" />
                                                <span class="indication">{entry.id}</span>                                     
                                                <span class="arrow">
                                                    <ArrowRight size="10" />
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/each}
        </div>
    {/if}
</div>
{/if}
  
<style>
  h3 {
    font-weight: 800;
    text-transform: uppercase;
    font-size: 0.75rem;
    color: #C9623F;
    margin-bottom: .425rem;
    letter-spacing: 0.025em;
  }

  h4 {
    font-weight: 800;
    font-size: 0.625rem;
    margin-bottom: .325rem;
    letter-spacing: 1px;
    border-radius: 200px;
    text-transform: uppercase;
    max-width: fit-content;
    font-family: 'IBM Plex Mono', monospace;
    padding: 0.25rem 0.425rem 0.25rem 0.425rem;
    color: #f0f0f0;
    margin-top: .625rem;
  }

  .table-container {
    max-height: 60vh;
    margin-top: .725rem;
    overflow-y: scroll;
    scrollbar-width: thin;
    scrollbar-color: #C9623F #f0f0f0;
  }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }

  td {
    padding: 0.5rem 0 0.25rem 0;
    text-align: left;
  }

  .entry-details {
    display: flex;
    flex-direction: column;
    padding: 1rem .5rem 1rem .725rem;
    border: .5px solid #6f6f6f;
  }

  .entry-details:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: cubic-bezier(0.075, 0.82, 0.165, 1);
  }


  .entry-bottom {
    display: grid;
    grid-template-columns: .125fr 1fr .025fr;
    align-items: bottom;
    justify-content: left;
  }

  .entry-bottom-2 {
    display: grid;
    grid-template-columns: .125fr 1fr .025fr;
    align-items: left;
    justify-content: space-between;
  }

  .main-info {
    display: grid;
    grid-template-columns: .125fr 1fr;
    align-items: bottom;
    justify-content: left;
    margin-bottom: 0.5rem;
  }

  .sponsor, .sponsor-count {
    font-weight: 800;
    font-size: 1rem;
    color: #161616;
  }

  .drug-name {
    font-size: .8725rem;
    font-weight: 00;
    color: #555;
  }

  .therapeutic-area {
    font-size: 0.6725rem;
    line-height: .825rem;
    max-width: 100%;
    text-transform: capitalize;
    font-weight: 800;
    color: #6f6f6f;
  }

  .indication {
    font-size: 0.725rem;
    font-weight: 800;
    color: #6f6f6f;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: capitalize;
    max-width: 80ch;
  }
  
  .indication:hover {
    max-width: 100%;
    overflow: auto;
    flex-direction: column-reverse;
  }

  tr {
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s ease;
  }

  .clickable-row {
    transition: all 0.2s ease;
  }

  .clickable-row:hover, .clickable-row.highlighted {
    cursor: pointer;
    transition: background-color 0.2s ease;
    transform: translateX(0px);
  }

  .clickable-row-2 {
    display: flex;
    padding: .25rem .125rem .25rem 0;
    margin-bottom: 0.25rem;
    flex-direction: column;
    transition: all 0.2s ease;
  }

  .clickable-row-2:hover, .clickable-row.highlighted {
    cursor: pointer;
    transition: background-color 0.2s ease;
    transform: translateX(0px);
  }n  

  .arrow {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.25rem;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .clickable-row:hover .arrow {
    opacity: 1;
  }
  .clickable-row-2:hover .arrow {
    opacity: 1;
  }

  .therapeutic-area-group {
    margin-bottom: 1rem;
  }

  .count {
        font-size: 0.825rem;
        color: #6f6f6f;
        justify-content: left;
    }


</style>