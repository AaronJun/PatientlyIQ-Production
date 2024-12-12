<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { ArrowLeft, Email, LogoLinkedin, LogoInstagram, ArrowUpRight } from 'carbon-icons-svelte';
    import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
  
    export let isOpen: boolean = false;
    export let onClose: () => void;
  
    const ANIMATION_DURATION = 525;
    const TEXT_ANIMATION_DURATION = 300;
  
    // Share content
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = "The FDA's Rare Disease Research Garden is Blooming";
  const shareText = "The FDA's Priority Review Voucher Program has planted the seeds for 55 new rare disease treatments, with 41 first-ever therapies blooming where none existed before. 2024 is our most fruitful year yet—help us keep this garden growing.";
  const callToAction = "Explore the data and learn how to advocate for the program renewal.";
  const previewImage = "/rpd-program-preview.png";

  
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
  
    async function copyToClipboard() {
      try {
        // Get the absolute URL for the preview image
        const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const absoluteImageUrl = `${siteUrl}${previewImage}`;
        
        const fullMessage = `${shareTitle}\n\n${shareText}\n\n${callToAction}\n${pageUrl}\n\nTake action: https://everylifefoundation.org/prv/\n\nPreview image: ${absoluteImageUrl}`;
        await navigator.clipboard.writeText(fullMessage);
        alert('Message, links, and image URL copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  
    function shareEmail() {
      const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const absoluteImageUrl = `${siteUrl}${previewImage}`;
      const emailBody = `${shareText}\n\n${callToAction}\n${pageUrl}\n\nTake action: https://everylifefoundation.org/prv/\n\nView the preview image: ${absoluteImageUrl}`;
      const mailtoLink = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(emailBody)}`;
      window.open(mailtoLink);
    }
  
    function shareLinkedIn() {
      const linkedInText = `${shareText}\n\n${callToAction}`;
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(shareTitle)}&summary=${encodeURIComponent(linkedInText)}`;
      window.open(linkedInUrl, '_blank', 'width=600,height=600');
    }
  
    function shareInstagram() {
      const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const absoluteImageUrl = `${siteUrl}${previewImage}`;
      alert(`To share on Instagram Stories:\n\n1. Download the preview image: ${absoluteImageUrl}\n\n2. Share this message:\n${shareText}\n\nDon't forget to include the action link: https://everylifefoundation.org/prv/`);
    }
  </script>
  
  <svelte:window on:keydown={handleKeydown}/>
  
<div 
class="fixed inset-0 w-full h-full bg-black/60 z-[1000] flex justify-end cursor-pointer"
on:click={handleBackdropClick}
transition:fly={{duration: ANIMATION_DURATION}}
>
<div 
  class="relative w-[55.125vw] h-full bg-white z-[1000] overflow-y-auto border-l-[10px] pl-2 pr-2 py-1 cursor-default"
  on:click={handleDrawerClick}
  style="border-color: #C9623F"
>
  <div class="drawer-content">
    <!-- Header -->
    <div class="header grid grid-cols-2 justify-stretch gap-4 pb-4 px-2 pt-4 mr-6">
      <button 
        class="flex gap-1 py-1 pr-3 pl-2 items-center justify-self-start bg-[#37587e] col-span-2 rounded-full text-xs font-semibold text-gray-100 hover:bg-green-800"
        on:click={onClose}
        in:fade={{duration: TEXT_ANIMATION_DURATION}}
      >
        <ArrowLeft /> Close
      </button>

      <div class="col-span-2">
        <h2 class="text-3xl mt-8 pb-4 font-light text-sky-800">
          Take Action & Share
        </h2>
      </div>
    </div>

    <!-- Action Card -->
    <Card class="mt-8 border-2 border-orange-600">
      <CardHeader>
        <CardTitle class="text-xl font-medium text-[#ff1515]">
          <span class="font-bold">Advocate</span> for Program Renewal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-base text-gray-600 mb-4">
          The EveryLife Foundation for Rare Diseases is leading the charge to renew and strengthen the RPD Priority Review Voucher Program. Their advocacy has been instrumental in creating opportunities for rare disease treatments.
        </p>
        <a 
          href="https://everylifefoundation.org/prv/"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full flex gap-4 max-w-fit pr-3 pl-4 py-3 mt-12 items-center justify-start rounded-full text-sm font-semibold text-white relative overflow-hidden group bg-[#ff1515] hover:bg-sky-700 transition-colors"
        >
          Support Program Renewal 
          <ArrowUpRight size={16} />
        </a>
      </CardContent>
    </Card>

    <!-- Share Preview Card -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-lg font-base text-sky-800">
          Share the Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="p-4 rounded-sm bg-gray-50 mb-6">
          <img 
            src={previewImage} 
            alt="RPD Program Analysis Preview" 
            class="w-full h-auto rounded-sm mb-4 shadow-sm"
          />
          <p class="text-sm font-medium text-gray-900 mb-2">{shareTitle}</p>
          <p class="text-sm text-gray-600 mb-2">{shareText}</p>
          <p class="text-sm text-gray-600">{callToAction}</p>
        </div>
        
        <div class="flex flex-col gap-4">
          <button 
            class="flex items-center gap-4 p-4 rounded-sm border border-gray-200 hover:bg-sky-100  transition-colors"
            on:click={copyToClipboard}
          >
            <div class="p-2 rounded-full bg-gray-100">
              <ArrowLeft class="transform rotate-45" />
            </div>
            <span class="text-sm">Copy message, links, and image</span>
          </button>

          <button 
            class="flex items-center gap-4 p-4 rounded-sm border border-gray-200 hover:bg-sky-100  transition-colors"
            on:click={shareEmail}
          >
            <div class="p-2 rounded-full bg-gray-100">
              <Email />
            </div>
            <span class="text-sm">Share via Email</span>
          </button>

          <button 
            class="flex items-center gap-4 p-4 rounded-sm border border-gray-200 hover:bg-sky-100  transition-colors"
            on:click={shareLinkedIn}
          >
            <div class="p-2 rounded-full bg-gray-100">
              <LogoLinkedin />
            </div>
            <span class="text-sm">Share on LinkedIn</span>
          </button>
        </div>
      </CardContent>
    </Card>
  </div>
</div>
</div>
  
  <style>
    .drawer-content {
    }
  
    .header {
      border-bottom: .525px solid #377e6b;
    }
  </style>