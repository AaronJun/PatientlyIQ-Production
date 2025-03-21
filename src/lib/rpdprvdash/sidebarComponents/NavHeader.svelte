<script lang="ts">
    import { Building, Network_4, HealthCross, ArrowsHorizontal, ChartBubble, Information, DashboardReference } from 'carbon-icons-svelte';
    import { Separator } from 'bits-ui';
    import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
    import { fade, slide } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
  
    // Props
    export let activeTab: string;
    export let isCollapsed: boolean = false;
    
    // Local state
    let isHovered: boolean = false;
    
    // Create dispatcher for events
    const dispatch = createEventDispatcher();
    
    // Define tabs with their icons
    const overviewTab = { id: 'Program Overview', icon: ChartBubble, tooltip: 'Program analytics overview' };
    const tabs = [
      { id: 'By Sponsor', icon: Building, tooltip: 'View by sponsor companies' },
      { id: 'By Therapeutic Area', icon: HealthCross, tooltip: 'View by therapeutic areas' },
      { id: 'By Transactions', icon: ArrowsHorizontal, tooltip: 'View PRV transactions' },
    ];
    
    // Handle tab selection
    function handleTabSelect(tab: string) {
      dispatch('tabSelect', tab);
    }
    
    // Handle how to navigate button click
    function handleHowToNavigateClick() {
      dispatch('howToNavigate');
    }
    
    // Handle dashboard button click
    function handleDashboardClick() {
      dispatch('dashboard');
    }
  </script>
  
  
  <div 
    class="horizontal-sidebar-container max-h-fit fixed left-0 bottom-0 md:top-0 w-full z-40 
           flex flex-row items-center justify-between md:justify-between 
           bg-slate-900 shadow-xl 
           px-4 md:px-8 pb-2 md:py-3
           transition-all duration-300 ease-in-out"
    class:bg-slate-800={isHovered}
    role="navigation"
    aria-label="Main navigation sidebar"
  >
  
  <!-- Logo container -->
    <div class="flex items-center align-middle h-0 w-0 md:h-8 md:w-8">
      <img src={PIQLogo} alt="PIQ Logo" style="filter: saturate(0.625)" />
    </div>

    <!-- Navigation items -->
    <nav class="flex flex-row items-center gap-2">

        <!-- Overview Tab -->
        <button
          class="flex flex-col lg:flex-row items-center align-middle gap-1 pt-1 px-2 transition-all duration-200 text-center relative"
          class:text-emerald-400={activeTab === overviewTab.id}
          class:text-slate-500={activeTab !== overviewTab.id}
          class:hover:text-emerald-100={activeTab !== overviewTab.id}
          on:click={() => handleTabSelect(overviewTab.id)}
          title={isCollapsed && !isHovered ? overviewTab.tooltip : ''}
        >
          <!-- Icon -->
          <span class="text-center w-4 h-4 flex-shrink-0">
            <svelte:component this={overviewTab.icon} size={16} />
          </span>
          
          <!-- Text label - only shown when expanded or hovered -->
            <span 
              class="w-10 md:w-fit text-[8.725px] md:text-sm md:font-normal leading-none tracking-wide font-medium"
              transition:fade={{ duration: 200 }}
            >
              {overviewTab.id}
            </span>
         
        </button>
        <Separator.Root
        orientation="vertical"
        class="bg-border my-4 shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px]"
      />  
      {#each tabs as tab}
      <button
     class="flex flex-col lg:flex-row items-center align-middle gap-1 pt-2 px-2 transition-all duration-200 text-[8.725px] md:text-sm md:font-normal leading-none text-center relative text-slate-500"
     class:text-emerald-300={activeTab == tab.id}
          class:hover:text-slate-200={activeTab !== tab.id}
          on:click={() => handleTabSelect(tab.id)}
          title={isCollapsed && !isHovered ? tab.tooltip : ''}
        >
          <!-- Icon -->
          <span class="text-center w-4 h-4 flex-shrink-0">
            <svelte:component this={tab.icon} size={16} />
          </span>
          
          <!-- Text label - only shown when expanded or hovered -->
            <span 
              class="w-16 text-center md:w-fit text-[8.725px] md:text-sm md:font-normal tracking-wide font-medium"
              transition:slide={{ duration: 200 }}
            >
              {tab.id}
            </span>
          
        </button>
      {/each}
      
      <Separator.Root
      orientation="vertical"
      class="bg-border my-4 shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px]"
    />
      
    <nav class="flex flex-row gap-1">
      <!-- Dashboard button -->
      <button
     class="flex flex-col lg:flex-row items-center align-middle gap-1 pt-2 px-2 transition-all duration-200 text-[8.725px] md:text-sm md:font-normal leading-none text-center relative text-slate-500"
        on:click={handleDashboardClick}
        class:bg-slate-700={activeTab === 'Dashboard'}
        class:text-emerald-400={activeTab === 'Dashboard'}
        class:text-slate-500={activeTab !== 'Dashboard'}
        class:hover:text-slate-100={activeTab !== 'Dashboard'}
      >
        <!-- Icon -->
        <span class="text-center w-4 h-4 flex-shrink-0">
          <DashboardReference size={16} />
      </span>
        
        <!-- Text label - only shown when expanded or hovered -->
          <span 
            class=" text-[8.725px] md:text-sm md:font-normal tracking-wide font-medium"
            transition:slide={{ duration: 200 }}
          >
            Dashboard
          </span>
      </button>
      </nav>
    </nav>
  </div>
  
  <style>
    .horizontal-sidebar-container {
      z-index: 99;
      box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease-in-out;
    }
  </style>