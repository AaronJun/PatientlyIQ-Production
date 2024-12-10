<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { ArrowLeft } from 'carbon-icons-svelte';
    import { marked } from 'marked';
    import { Card, CardHeader, CardTitle, CardContent } from '../../lib/ui/card/';
  
    export let isOpen: boolean = false;
    export let onClose: () => void;
    export let content: any;  // Can be either JSON or Markdown string
    export let contentType: 'json' | 'markdown' = 'json';
    export let color: string = '#37587e';
  
    const ANIMATION_DURATION = 525;
    const TEXT_ANIMATION_DURATION = 300;
  
    let parsedContent: any;
    let sections: any[] = [];
    let title: string = '';
  
    $: {
      if (contentType === 'json') {
        parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
        title = parsedContent.title || 'Document';
        sections = parsedContent.sections || [];
      } else {
        // For markdown, parse the content and create sections based on headers
        const htmlContent = marked(content);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Extract the title from H1 and remove it from the content
        const h1Element = tempDiv.querySelector('h1');
        title = h1Element?.textContent || 'Document';
        if (h1Element) {
          h1Element.remove();
        }
        
        // Group remaining content between headers into sections
        sections = [];
        let currentSection = { title: '', content: '' };
        
        Array.from(tempDiv.children).forEach((element) => {
          if (element.tagName.match(/^H[2-6]$/)) {
            if (currentSection.content) {
              sections.push({ ...currentSection });
            }
            currentSection = {
              title: element.textContent || '',
              content: ''
            };
          } else {
            currentSection.content += element.outerHTML;
          }
        });
        
        // Add the last section if it has content
        if (currentSection.content) {
          sections.push(currentSection);
        }
        
        parsedContent = { title, sections };
      }
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
  
    function handleDrawerClick(event: MouseEvent) {
      event.stopPropagation();
    }
  
    function handleBackdropClick(event: MouseEvent) {
      if (event.target === event.currentTarget) {
        onClose();
      }
    }

  </script>
  
  <svelte:window on:keydown={handleKeydown}/>
  
  <div 
    class="fixed inset-0 w-full h-full bg-black/60 z-[1000] flex justify-end cursor-pointer"
    on:click={handleBackdropClick}
    transition:fly={{duration: ANIMATION_DURATION}}
  >
    <div 
      class="relative w-[62.25vw] h-full bg-white shadow-lg z-[1000] overflow-y-auto border-l-[10px] pl-2 pr-2 py-1 cursor-default"
      on:click={handleDrawerClick}
      style="border-color: {color}"
    >
      <div class="drawer-content">
        <div class="header grid grid-cols-2 justify-stretch gap-4 pb-4 mr-6">
          <button 
            class="flex gap-1 py-1 pr-3 pl-2 items-center justify-self-start bg-[#37587e] col-span-2 rounded-full text-xs font-semibold text-gray-100 hover:bg-green-800"
            on:click={onClose}
            in:fade={{duration: TEXT_ANIMATION_DURATION}}
          >
            <ArrowLeft /> Close
          </button>
  
          <div class="col-span-2">
            <h2 class="text-3xl mt-8 pb-4 font-light text-sky-800" 
                in:fly={{duration: TEXT_ANIMATION_DURATION}}>
              {parsedContent.title}
            </h2>
          </div>
        </div>
  
        {#each parsedContent.sections as section}
          <Card class="mt-8">
            <CardHeader>
              <CardTitle class="text-lg font-base text-sky-800">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {#if contentType === 'json'}
                <div class="prose max-w-none">
                  {section.content}
                </div>
              {:else}
                <div class="prose max-w-none">
                  {@html section.content}
                </div>
              {/if}
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  </div>
  
  <style>
    .drawer-content {
      padding: 2rem;
    }
  
    .header {
      border-bottom: .525px solid #377e6b;
    }
  
    :global(.prose) {
      color: #292F58;
      font-size: 0.875rem;
      line-height: 1.5;
    }
  
    :global(.prose h1) {
      color: #ff1515;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
  
    :global(.prose h2) {
      color: #37587e;
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
    }
  
    :global(.prose p) {
      margin-bottom: 1rem;
    }
  
    :global(.prose ul, .prose ol) {
      margin-left: 1.5rem;
      margin-bottom: 1rem;
    }
  
    :global(.prose li) {
      margin-bottom: 0.5rem;
    }
  
    @media (max-width: 1024px) {
      .drawer-content {
        padding: 1.5rem;
      }
  
      :global(.prose) {
        font-size: 0.8125rem;
      }
    }
  
    @media (max-width: 768px) {
      .drawer-content {
        padding: 1rem;
      }
  
      :global(.prose) {
        font-size: 0.75rem;
      }
    }
  </style>