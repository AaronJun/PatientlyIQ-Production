<script lang="ts">
    import { fade } from 'svelte/transition';
    import { ArrowUpRight } from 'carbon-icons-svelte';
  
    export let items: Array<{
      label: string;
      icon: any;
      value: string;
      onClick?: () => void;
    }>;
    export let TEXT_ANIMATION_DURATION: number;
  </script>
  
  <table>
    <tbody>
      {#each items as { label, icon, value, onClick }}
        <tr class="h-12">
          <div class="flex gap-2 items-center">
            <svelte:component this={icon} size={16} />
            <p class="text-xs text-gray-600 font-medium">{label}</p>
          </div>
          
          <div class="flex flex-initial w-96 justify-end">
            <p class="text-ellipsis text-sm capitalize leading-4 overflow-hidden">
              {value}
            </p>
          </div>
          
          <div class="flex flex-initial w-1 justify-end">
            {#if onClick && value !== 'N/A'}
              <button 
                class="action-button"
                on:click|stopPropagation={onClick}
              >
                All <ArrowUpRight size={16} />
              </button>
            {/if}
          </div>
        </tr>
      {/each}
    </tbody>
  </table>
  
  <style>
    tr {
      display: flex;
      flex-direction: row;
      border-bottom: .5px dotted #292F58;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      min-height: 3rem;
      padding: 0.5rem 0;
    }
  
    .action-button {
      @apply flex gap-4 pr-3 pl-3 py-1 items-center bg-[#37587e] rounded-full text-xs font-semibold text-gray-100 hover:bg-green-800;
    }
  </style>