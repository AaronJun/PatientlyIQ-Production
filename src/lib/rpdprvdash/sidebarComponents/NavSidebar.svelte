<script lang="ts">
    import { Building, Network_4, HealthCross, ArrowsHorizontal, ChartBubble, Information, DashboardReference } from 'carbon-icons-svelte';
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
    const tabs = [
      { id: 'By Sponsor', icon: Building, tooltip: 'View by sponsor companies' },
      { id: 'By Therapeutic Area', icon: HealthCross, tooltip: 'View by therapeutic areas' },
      { id: 'By Transactions', icon: ArrowsHorizontal, tooltip: 'View PRV transactions' },
      { id: 'Program Overview', icon: ChartBubble, tooltip: 'Program analytics overview' },
    ];
    
    // Handle tab selection
    function handleTabSelect(tab: string) {
      dispatch('tabSelect', tab);
    }
    
    // Toggle sidebar collapsed state
    function toggleSidebar() {
      isCollapsed = !isCollapsed;
      dispatch('toggleCollapse', isCollapsed);
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
    class="vertical-sidebar-container fixed left-0 top-0 z-50 h-full bg-slate-700 shadow-xl transition-all duration-300 ease-in-out"
    class:w-10={isCollapsed && !isHovered}
    class:w-52={!isCollapsed || isHovered}
    on:mouseenter={() => isHovered = true}
    on:mouseleave={() => isHovered = false}
    role="navigation"
    aria-label="Main navigation sidebar"
  >
  

    <!-- Navigation items -->
    <nav class="flex flex-col gap-1 pt-20">


      {#each tabs as tab}
        <button
          class="flex items-center align-middle gap-3 py-3 px-2 transition-all duration-200 text-left relative"
          class:bg-slate-700={activeTab === tab.id}
          class:text-emerald-400={activeTab === tab.id}
          class:hover:bg-emerald-300={activeTab !== tab.id}
          class:text-slate-300={activeTab !== tab.id}
          class:hover:text-slate-800={activeTab !== tab.id}
          on:click={() => handleTabSelect(tab.id)}
          title={isCollapsed && !isHovered ? tab.tooltip : ''}
        >
          <!-- Icon -->
          <span class="text-center w-4 h-4 flex-shrink-0">
            <svelte:component this={tab.icon} size={16} />
          </span>
          
          <!-- Text label - only shown when expanded or hovered -->
          {#if !isCollapsed || isHovered}
            <span 
              class="whitespace-nowrap text-xs font-medium"
              transition:slide={{ duration: 200 }}
            >
              {tab.id}
            </span>
          {/if}
          
          <!-- Active indicator -->
          {#if activeTab === tab.id}
            <span class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-sm"></span>
          {/if}
        </button>
      {/each}
      
      <!-- Divider -->
      <div class="divider" />
      
      <!-- How to Navigate button -->
      
      <button
        class="flex items-center align-middle gap-3 py-3 px-3 transition-all duration-200 text-left relative text-slate-300 hover:bg-emerald-300 hover:text-slate-800"
        on:click={handleHowToNavigateClick}
        title={isCollapsed && !isHovered ? "How to Navigate" : ''}
      >
        <!-- Icon -->
        <span class="text-center w-4 h-4 flex-shrink-0">
          <Information size={16} />
        </span>
        
        <!-- Text label - only shown when expanded or hovered -->
        {#if !isCollapsed || isHovered}
          <span 
            class="whitespace-nowrap text-xs font-medium"
            transition:slide={{ duration: 200 }}
          >
            How to Navigate
          </span>
        {/if}
      </button>

    <nav class="flex flex-col gap-1">
      <!-- Dashboard button -->
      <button
    class="flex items-center align-middle gap-3 py-3 px-3 transition-all duration-200 text-left relative text-slate-300 hover:bg-emerald-300 hover:text-slate-800"  
        on:click={handleDashboardClick}
        title={isCollapsed && !isHovered ? "Dashboard" : ''}
      >
        <!-- Icon -->
        <span class="text-center w-4 h-4 flex-shrink-0">
          <DashboardReference size={16} />
        </span>
        
        <!-- Text label - only shown when expanded or hovered -->
        {#if !isCollapsed || isHovered}
          <span 
            class="whitespace-nowrap text-xs font-medium"
            transition:slide={{ duration: 200 }}
          >
            Dashboard
          </span>
        {/if}
      </button>
      </nav>
    </nav>
  </div>
  
  <style>
    .vertical-sidebar-container {
      z-index: 99;
      box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
    }

    .divider {
      border-top: .5425px solid #e2e8f0;
      margin: 0.5rem 0;
    }
  </style>