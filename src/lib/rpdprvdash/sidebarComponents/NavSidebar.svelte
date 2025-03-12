<script lang="ts">
    import { Building, HealthCross, ArrowsHorizontal, ChartBubble } from 'carbon-icons-svelte';
    import { slide } from 'svelte/transition';
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
      { id: 'Program Overview', icon: ChartBubble, tooltip: 'Program analytics overview' }
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
  </script>
  
  <div 
    class="vertical-sidebar-containe z-50 fixed left-0 top-0 z-40 pt-20 h-full bg-slate-800 shadow-xl transition-all duration-300 ease-in-out"
    class:w-16={isCollapsed && !isHovered}
    class:w-64={!isCollapsed || isHovered}
    on:mouseenter={() => isHovered = true}
    on:mouseleave={() => isHovered = false}
  >
    <!-- Toggle button -->
    <button
      class="absolute -right-3 top-24 z-50 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full shadow-md transition-colors duration-200 border border-emerald-500"
      on:click={toggleSidebar}
      title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <svg
        class="w-4 h-4 transform transition-transform duration-200"
        class:rotate-180={!isCollapsed}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>
  
    <!-- Navigation items -->
    <nav class="flex flex-col gap-1 py-4">
      {#each tabs as tab}
        <button
          class="flex items-center gap-3 py-3 px-3 rounded-md transition-all duration-200 text-left relative"
          class:bg-slate-700={activeTab === tab.id}
          class:text-emerald-400={activeTab === tab.id}
          class:hover:bg-slate-700={activeTab !== tab.id}
          class:text-slate-300={activeTab !== tab.id}
          class:hover:text-white={activeTab !== tab.id}
          on:click={() => handleTabSelect(tab.id)}
          title={isCollapsed && !isHovered ? tab.tooltip : ''}
        >
          <!-- Icon -->
          <span class="text-center w-6 h-6 flex-shrink-0">
            <svelte:component this={tab.icon} size={24} />
          </span>
          
          <!-- Text label - only shown when expanded or hovered -->
          {#if !isCollapsed || isHovered}
            <span 
              class="whitespace-nowrap text-sm font-medium"
              transition:slide={{ duration: 200 }}
            >
              {tab.id}
            </span>
          {/if}
          
          <!-- Active indicator -->
          {#if activeTab === tab.id}
            <span class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-r-md"></span>
          {/if}
        </button>
      {/each}
    </nav>
  </div>
  
  <style>
    .vertical-sidebar-container {
      box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
    }
  </style>