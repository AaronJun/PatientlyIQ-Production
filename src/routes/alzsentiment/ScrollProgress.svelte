<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import "carbon-components-svelte/css/all.css";
    
    // State
    let isHovered = false;
    let isMobileMenuOpen = false;
    let scrollProgress = 0;
    let activeSection = '';
    let sections: { id: string; position: number }[] = [];
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;
    
    onMount(() => {
      // Find all section divs and collect their IDs and positions
      const updateSectionPositions = () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        
        const sectionElements = document.querySelectorAll('[id]');
        sections = Array.from(sectionElements)
          .filter(el => el.id && el.id.match(/^\d+\./))
          .map(el => {
            const rect = el.getBoundingClientRect();
            const scrollTop = window.scrollY;
            const elementTop = rect.top + scrollTop;
            // Calculate position as percentage of document
            const position = (elementTop / documentHeight) * 100;
            return { 
              id: el.id, 
              position: Math.min(Math.max(position, 0), 100) // Clamp between 0-100
            };
          })
          .sort((a, b) => {
            const aNum = parseInt(a.id.split('.')[0]);
            const bNum = parseInt(b.id.split('.')[0]);
            return aNum - bNum;
          });
      };
  
      // Set initial active section
      if (sections.length > 0) {
        activeSection = sections[0].id;
      }
  
      // Scroll handler
      const handleScroll = () => {
        isScrolling = true;
        clearTimeout(scrollTimeout);
        
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.scrollY;
        const progress = (scrollTop / documentHeight) * 100;
        
        scrollProgress = progress;

        // Reset isScrolling after delay
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
        }, 525);
  
        // Update active section
        const scrollPosition = window.scrollY + windowHeight * 0.5;
        for (const section of sections) {
          const element = document.getElementById(section.id);
          if (element) {
            const { top, bottom } = element.getBoundingClientRect();
            if (top <= scrollPosition && bottom >= scrollPosition) {
              activeSection = section.id;
              break;
            }
          }
        }
      };
  
      // Initial setup
      updateSectionPositions();
      handleScroll();
  
      // Add event listeners
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', updateSectionPositions);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', updateSectionPositions);
      };
    });
  
    // Smooth scroll function
    const scrollToSection = (sectionId: string) => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        isMobileMenuOpen = false;
      }
    };
  </script>
  
  <div class="fixed top-20 right-10 z-50">
    <!-- Mobile Toggle -->
    <button 
      on:click={() => isMobileMenuOpen = !isMobileMenuOpen}
      class="lg:hidden text-gray-600 font-medium text-sm"
    >
      {activeSection}
    </button>
  
    <!-- Desktop Navigation -->
    <div 
      class="hidden lg:flex flex-col items-end"
      on:mouseenter={() => isHovered = true}
      on:mouseleave={() => isHovered = false}
    >
      <div class="text-orange-600 text-right justify-end font-serif font-semibold text-sm italic mb-2">
        {activeSection}
      </div>
      
      <div class="relative h-96 flex items-center">
        <!-- Background Track -->
        <div class="h-full mt-20 rounded-sm transition-all duration-300 ease-in-out relative"
             class:w-[7.825px]={isHovered}
             class:w-[3px]={!isHovered}
             style="background-color: rgb(203, 213, 225)">
          <!-- Progress Indicator -->
          <div 
            id="progress-indicator"
            class="absolute top-0 left-0 w-full bg-orange-500 rounded-sm transition-all duration-300 ease-in-out"
            style="height: {scrollProgress}%; opacity: {isScrolling ? '1' : '0.1'}"
          />
        </div>
  
        <!-- Section Labels -->
        <div class="absolute top-16 right-8 h-full w-24"
             class:opacity-100={isHovered}
             class:opacity-0={!isHovered}>
          {#each sections as section}
            <div 
              class="absolute text-right text-[10px] cursor-pointer transition-colors duration-200 transform -translate-y-1/2"
              class:text-orange-500={activeSection === section.id}
              class:font-bold={activeSection === section.id}
              class:text-gray-500={activeSection !== section.id}
              style="top: {section.position}%; right: 0;"
              on:click={() => scrollToSection(section.id)}
            >
              {section.id}
            </div>
          {/each}
        </div>
      </div>
    </div>
  
    <!-- Mobile Menu -->
    {#if isMobileMenuOpen}
      <div 
        class="lg:hidden fixed right-0 top-16 bg-white shadow-lg rounded-l-lg p-4 transition-transform duration-300"
        class:translate-x-0={isMobileMenuOpen}
        class:translate-x-full={!isMobileMenuOpen}
      >
        {#each sections as section}
          <div
            class="py-2 px-4 cursor-pointer"
            class:text-orange-500={activeSection === section.id}
            class:text-gray-600={activeSection !== section.id}
            on:click={() => scrollToSection(section.id)}
          >
            {section.id}
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
  <style>
    :global(.translate-x-0) {
      transform: translateX(0);
    }
    
    :global(.translate-x-full) {
      transform: translateX(100%);
    }
  </style>