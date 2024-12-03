<script lang="ts">
    import { fade } from 'svelte/transition';
    import { Money } from 'carbon-icons-svelte';
  
    export let displayData: any;
    export let showSaleBenchmarks: () => void;
    export let handleClick: (fn: Function) => void;
    export let TEXT_ANIMATION_DURATION: number;
  
    function formatDate(month: string, date: string, year: string): string {
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      const monthIndex = monthNames.indexOf(month);
      if (monthIndex === -1) return `${date}, ${year}`;
      return `${monthNames[monthIndex]} ${date}, ${year}`;
    }
  
    function formatSalePrice(price: string): string {
      if (!price || price === "NA") return 'N/A';
      const numPrice = parseFloat(price.replace(/[^0-9.-]+/g,""));
      return numPrice ? `$${numPrice.toFixed(2)} million` : 'N/A';
    }
  </script>
  
  <div class="table-container">
    <h3 in:fade={{duration: TEXT_ANIMATION_DURATION}}
        on:click={() => handleClick(showSaleBenchmarks)}
        tabindex="0">
      Voucher Transaction
    </h3>
    <table>
      <tbody>
        {#each ['Purchased', 'Purchaser', 'Sale Price', 'Purchase Date'] as field}
          <tr>
            <th class="label">
              <Money size={12} /> {field}
            </th>
            <td in:fade={{duration: TEXT_ANIMATION_DURATION}}>
              {#if field === 'Purchased'}
                {displayData.Purchased || 'N/A'}
              {:else if field === 'Purchaser'}
                {displayData.Purchaser || 'N/A'}
              {:else if field === 'Sale Price'}
                {formatSalePrice(displayData["Sale  Price (USD, Millions)"])}
              {:else if field === 'Purchase Date'}
                {displayData["Purchase Month"] && displayData["Purchase Date"] && displayData["Purchase Year"] 
                  ? formatDate(displayData["Purchase Month"], displayData["Purchase Date"], displayData["Purchase Year"]) 
                  : 'N/A'}
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  
  <style>
    .table-container {
      overflow-y: auto;
      max-width: 95%;
      margin: 1.25rem 0 2.25rem 0;
    }
  
    h3 {
      font-weight: 800;
      cursor: pointer;
      font-size: .725rem;
      text-transform: capitalize;
      font-family: 'IBM Plex Mono', monospace;
      color: #d95656;
      margin-bottom: .5rem;
    }
  
    table {
      width: 100%;
      border-collapse: collapse;
    }
  
    .label {
      display: flex;
      gap: 0.525rem;
      font-size: .65rem;
      color: #292F58;
      font-family: "IBM Plex Mono", monospace;
      font-weight: 400;
    }
  
    tr {
      display: flex;
      flex-direction: row;
      border-bottom: .5px dotted #292F58;
      justify-content: space-between;
      align-items: left;
      gap: 2rem;
    }
  
    td {
      padding-top: .5rem;
      padding-bottom: .5rem;
      text-transform: capitalize;
      padding-right: .25rem;
      font-size: .75rem;
      padding-right: 1rem;
      line-height: 1rem;
      text-align: left;
    }
  
    tr:hover {
      background-color: #b7e0fe;
      cursor: pointer;
      border: 1px dotted #737dc0;
    }
  </style>