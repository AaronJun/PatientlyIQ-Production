<script lang="ts">
	import { ArrowRightIcon } from 'lucide-svelte';
	import BorderBeam from '$lib/magicui/SpecialEffects/BorderBeam/BorderBeam.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { ObserverEventDetails } from 'svelte-inview';
	import { inview } from 'svelte-inview';

	// Video
	import HeroVideo from '$lib/assets/imgs/PIQDemoHero1080p.mp4';
	let inView = false;
	const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
		inView = detail.inView;
	};
</script>

<section id="hero" class="relative mx-auto mt-32 max-w-7xl px-6 md:px-8">
<div class="text-left mb-16">
        <section class="relative mx-auto">
            <div class="text-left mb-16">
                <div class="mb-4 flex items-left gap-5">
                    <span class="font-mono text-xs font-bold text-gray-500">01</span>
                    <span class="font-mono text-xs text-gray-500 dark:text-gray-400">
						Comprehensive patient insights
					</span>
                </div>
            </div>			
</div>
		
	<h1 class="-translate-y-4 animate-fade-in antialiased text-balance bg-gradient-to-br from-gray-800 from-30% to-gray-500 bg-clip-text py-6 text-4xl font-extralight opacity-0 [--animation-delay:200ms] dark:from-white/80 dark:to-white/70 sm:text-5xl md:text-7xl lg:text-7xl">
	
	<br class="hidden md:block" />
	Unique data 
	<span class="font-serif subpixel-antialiased italic text-[#ff5151]">
	differentiates
	<br class="hidden md:block" />
	</span> patient engagement strategies.

	</h1>
	<br class="hidden md:block" />
	<p class="mb-12 -translate-y-4 animate-fade-in text-balance text-base text-gray-800 opacity-0 [--animation-delay:400ms] dark:text-gray-400 md:text-sm lg:text-base lg:w-5/6">
		<span class="tracking-normal text-base font-semibold text-[#ff5151]">PatientlyIQ</span> is a data tool built to amplify the patient voice, and 
		designed to support critical communications with unprecedented levels of patient insight.
	</p>
	<br class="hidden md:block" />

	<div class="flex justify-left gap-4">
		<Button class="-translate-y-4 animate-fade-in gap-1 rounded-full text-xs bg-[#ff5151] border-orange-400 text-white opacity-0 hover:bg-[#ff6b6b] [--animation-delay:600ms] dark:text-orange-100">
			<span>Request Demo</span>
			<ArrowRightIcon class="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
			
		</Button>
		<Button variant="outline" class="-translate-y-4 animate-fade-in gap-1 text-xs rounded-full border-[#ff5151] text-[#ff5151] opacity-0 hover:bg-orange-200 [--animation-delay:600ms] dark:border-gray-700 dark:text-gray-300 dark:hover:bg-orange-200 dark:hover:text-black dark:hover:border-orange-100">
			<span>Learn More</span>
		</Button>
	</div>

	<div
		use:inview={{
			unobserveOnEnter: true,
			rootMargin: '-100px'
		}}
		on:inview_change={handleChange}
		class="relative mt-32 animate-fade-up opacity-0 [--animation-delay:200ms] [perspective:2000px] after:absolute after:inset-0 after:z-50 after:[background:linear-gradient(to_top,hsl(var(--background))_10%,transparent)]"
	>
		<div class="border border-orange-900 rounded-sm bg-white}">
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
				class="relative size-full rounded-[inherit] border object-contain"
			/>
		</div>
	</div>
</section>

<style>
  
	.mb-4 {
		border-top: .25px solid #ff5151;
		padding-top: .525rem;
	}

	:global(.serif-italic) {
		font-family: 'IBM Plex Serif', serif;
		font-weight: 300;
		font-style: italic;
		color: #ff5151;
	}
</style>