<script lang="ts">
    import { Building, Network_4, HealthCross, ArrowsHorizontal, ChartBubble, Information, DashboardReference } from 'carbon-icons-svelte';
    import { Separator } from 'bits-ui';
    import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
    import { fade } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
  
    // Props
    export let activeTab: string;
    export let isCollapsed: boolean = false;
    
    // Local state
    let isHovered: boolean = false;
    
    // Create dispatcher for events
    const dispatch = createEventDispatcher();
    
    // Define all navigation items including overview and dashboard
    const navItems = [
      { id: 'Program Overview', icon: ChartBubble, tooltip: 'Program analytics overview' },
      { id: 'By Sponsor', icon: Building, tooltip: 'View by sponsor companies' },
      { id: 'By Therapeutic Area', icon: HealthCross, tooltip: 'View by therapeutic areas' },
      { id: 'By Transactions', icon: ArrowsHorizontal, tooltip: 'View PRV transactions' },
      { id: 'Dashboard', icon: DashboardReference, tooltip: 'View dashboard', isDashboard: true }
    ];
    
    // Handle navigation item selection
    function handleNavSelect(itemId: string) {
      if (itemId === 'Dashboard') {
        dispatch('dashboard');
      } else {
        dispatch('tabSelect', itemId);
      }
    }
    
    // Handle how to navigate button click
    function handleHowToNavigateClick() {
      dispatch('howToNavigate');
    }
</script>

<div 
  class="horizontal-sidebar-container flex flex-row max-h-fit fixed bg-slate-700 left-0 bottom-0 md:top-0 w-full z-40 
         items-center justify-center md:justify-between shadow-xl md:px-8 pb-1 md:py-5
         transition-all duration-300 ease-in-out"
  role="navigation"
  aria-label="Main navigation sidebar"
>
  <div class="items-center h-full hidden md:block">
    <img src={PIQLogo} alt="PIQ Logo" class="w-8 h-8" style="filter: saturate(0.625)" />
  </div>

  <nav class="flex flex-row items-center md:justify-between justify-center">
    {#each navItems as item}
      <button
      class="nav-button flex flex-col lg:flex-row items-center md:align-middle w-fit mx-2 md:w-fit md:gap-2 px-1 pt-2  
               transition-all duration-200 relative {item.isDashboard ? 'border-l-2 border-slate-600 pl-2' : ''}"
        class:text-emerald-400={activeTab === item.id}
        class:text-slate-500={activeTab !== item.id}
        class:hover:text-emerald-100={activeTab !== item.id}
        on:click={() => handleNavSelect(item.id)}
        title={isCollapsed && !isHovered ? item.tooltip : ''}
      >
        <span class="text-center w-4 h-4 md:w-8 md:h-8 md:p-1 flex-shrink-0">
          <svelte:component this={item.icon} class="w-full h-full"/>
        </span>
        
        <span 
          class="nav-text text-2xs md:text-sm align-middle md:w-fit text-center md:text-left"
          transition:fade={{ duration: 200 }}
        >
          {item.id}
        </span>
      </button>
    {/each}
  </nav>
</div>

<style>
  .horizontal-sidebar-container {
    z-index: 99;
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease-in-out;
  }

  .nav-text {
    font-family: 'IBM Plex Sans Condensed', sans-serif;
  }
</style>