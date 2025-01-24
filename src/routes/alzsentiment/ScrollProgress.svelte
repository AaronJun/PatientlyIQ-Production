<!-- ScrollProgress.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import "carbon-components-svelte/css/all.css";
  
  let isHovered = false;
  let isMobileMenuOpen = false;
  let scrollProgress = 0;
  let activeSection = '';
  let sections: { id: string; position: number }[] = [];
  let isScrolling = false;
  let scrollTimeout: NodeJS.Timeout;
  
  onMount(() => {
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
          const position = (elementTop / documentHeight) * 100;
          return { 
            id: el.id, 
            position: Math.min(Math.max(position, 0), 100)
          };
        })
        .sort((a, b) => {
          const aNum = parseInt(a.id.split('.')[0]);
          const bNum = parseInt(b.id.split('.')[0]);
          return aNum - bNum;
        });
    };

    if (sections.length > 0) {
      activeSection = sections[0].id;
    }

    const handleScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      scrollProgress = (scrollTop / documentHeight) * 100;

      // Improved section detection using IntersectionObserver concepts
      let currentSection = activeSection;
      let maxVisibility = 0;

      sections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementHeight = rect.height;
          const visibleHeight = Math.min(windowHeight, rect.bottom) - Math.max(0, rect.top);
          const visibilityRatio = visibleHeight / elementHeight;

          if (visibilityRatio > maxVisibility && visibilityRatio > 0.3) {
            maxVisibility = visibilityRatio;
            currentSection = section.id;
          }
        }
      });

      if (currentSection !== activeSection) {
        activeSection = currentSection;
      }

      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 525);
    };

    updateSectionPositions();
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateSectionPositions);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateSectionPositions);
    };
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      isMobileMenuOpen = false;
    }
  };
</script>

<div class="fixed top- right-10 z-50">
  <!-- Mobile Toggle -->
  <button 
    on:click={() => isMobileMenuOpen = !isMobileMenuOpen}
    class="mob-button font-serif italic lg:hidden bg-slate-100 px-4 py-2 text-orange-600 font-medium text-sm"
  >
    {activeSection} <span class="ml-2 text-[8px]">▼</span>
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
          class="absolute top-0 left-0 w-full bg-orange-500 rounded-sm transition-all duration-300 ease-in-out"
          style="height: {scrollProgress}%; opacity: {isScrolling ? '1' : '0.1'}"
        />
      </div>

      <!-- Section Labels -->
      <div class="absolute top-16 right-8 h-full w-24 transition-opacity duration-300"
           class:opacity-100={isHovered}
           class:opacity-0={!isHovered}>
        {#each sections as section}
          <div 
            class="absolute text-right text-[10px] cursor-pointer transition-colors duration-200 transform -translate-y-1/2 my-2"
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
      class="mob-menu lg:hidden fixed right-10 top-26 bg-slate-50 px-4 pt-6 pb-12 transition-transform duration-300 z-50"
      class:translate-x-0={isMobileMenuOpen}
      class:translate-x-full={!isMobileMenuOpen}
    >
      {#each sections as section}
        <div
          class="py-2 px-4 font-serif cursor-pointer hover:bg-orange-50 rounded transition-colors duration-200"
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

  .mob-button {
    border: .5px solid #ff5151;
    
  }
</style>