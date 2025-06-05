<script lang="ts">
	import { ArrowRightIcon } from 'lucide-svelte';
	import BorderBeam from '$lib/magicui/SpecialEffects/BorderBeam/BorderBeam.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { ObserverEventDetails } from 'svelte-inview';
	import { inview } from 'svelte-inview';
	import HeroVideo from '$lib/assets/imgs/PIQDemoHero1080p.mp4';
  
	let inView = false;
	
	const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
	  inView = detail.inView;
	};
  
	function scrollToSection(sectionId: string) {
	  const element = document.getElementById(sectionId);
	  if (element) {
		element.scrollIntoView({ behavior: 'smooth' });
	  }
	  if (hamburgerMenuIsOpen) {
		hamburgerMenuIsOpen = false;
	  }
	}
  </script>
  
  <section id="hero" class="relative mx-auto mt-16 sm:mt-24 md:mt-32 max-w-7xl px-4 sm:px-6 md:px-8">
	<!-- Header Section -->
	<div class="space-y-8 md:space-y-12">
	  <!-- Section Label -->
	  <div class="border-t border-[#ff5151] pt-2">
		<div class="flex items-center gap-5">
		  <span class="font-mono text-xs capitalize sm:text-xs font-bold text-gray-500">01</span>
		  <span class="font-mono text-xs capitalize sm:text-xs text-gray-500 dark:text-gray-400 capitalize">
			Comprehensive patient insights
		  </span>
		</div>
	  </div>
  
	  <!-- Main Content -->
	  <div class="space-y-6 md:space-y-8">
		<!-- Headline -->
		<h1 class="animate-fade-in max-w-3xl text-4xl md:text-6xl lg:text-7xl font-extralight bg-gradient-to-br from-gray-800 from-30% to-gray-500 bg-clip-text">
		  Data that amplifies 
		  <span class="font-serif italic text-[#ff5151]">patient stories</span> 
		  until they are undeniable.
		</h1>
  
		<!-- Subheading -->
		<p class="animate-fade-in text-lg sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
		  <span class="font-semibold text-[#ff5151]">PatientlyIQ</span> is a data tool built to amplify the patient voice, and designed to support critical communications with unprecedented levels of patient insight.
		</p>
  
		<!-- CTA Buttons -->
		<div class="flex flex-col sm:flex-row gap-4 sm:gap-6">
		  <Button 
			on:click={() => scrollToSection('contactform')}
			class="animate-fade-in rounded-full text-sm bg-[#ff5151] text-white hover:bg-[#ff6b6b] w-full sm:w-auto"
		  >
			<span>Project Inquiries</span>
			<ArrowRightIcon class="ml-1 size-4 transition-transform group-hover:translate-x-1" />
		  </Button>
		  
		  <Button 
			on:click={() => scrollToSection('data-sources')}
			variant="outline" 
			class="animate-fade-in rounded-full text-sm border-[#ff5151] text-[#ff5151] hover:bg-orange-200 w-full sm:w-auto"
		  >
			<span>Learn More</span>
		  </Button>
		</div>
	  </div>
	</div>
  
	<!-- Video Section -->
	<div
	  use:inview={{
		unobserveOnEnter: true,
		rootMargin: '-100px'
	  }}
	  on:inview_change={handleChange}
	  class="relative mt-16 sm:mt-24 md:mt-32 animate-fade-up [perspective:2000px]"
	>
	  <div class="border border-orange-900 rounded-sm bg-white overflow-hidden relative">
		<BorderBeam
		  size={600}
		  duration={10}
		  delay={0} 
		  colorFrom="var(--color-one)"
		  colorTo="var(--color-two)"
		/>
		
		<video
		  src={HeroVideo}
		  autoplay
		  loop
		  muted
		  playsinline
		  class="w-full h-auto rounded-[inherit] object-cover"
		/>
		
		<div class="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none" />
	  </div>
	</div>
  </section>
  
  <style>
	:global(.serif-italic) {
	  font-family: 'IBM Plex Serif', serif;
	  font-weight: 300;
	  font-style: italic;
	  color: #ff5151;
	}
  </style>