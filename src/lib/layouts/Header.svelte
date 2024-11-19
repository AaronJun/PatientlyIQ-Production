<script lang="ts">
	import Button from '$lib/ui/button/button.svelte';
	import { AlignJustify, XIcon, Sun, Moon } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
	import { onMount } from 'svelte';
	
	const sections = [
		{
			id: 'hero',
			number: '01',
			label: 'PatientlyIQ'
		},
		{
			id: 'data-sources',
			number: '02',
			label: 'Comprehesive Data'
		},
		{
			id: 'use-cases',
			number: '03',
			label: 'Use Cases'
		},
		{
			id: 'analysis',
			number: '04',
			label: 'Capabilities'
		}
	];

	let activeSection = 'hero';
	let hamburgerMenuIsOpen = false;
	let isDarkMode = false;

	function toggleOverflowHidden(node: HTMLElement) {
		node.addEventListener('click', () => {
			hamburgerMenuIsOpen = !hamburgerMenuIsOpen;
			const html = document.querySelector('html');
			if (html) {
				if (hamburgerMenuIsOpen) {
					html.classList.add('overflow-hidden');
				} else {
					html.classList.remove('overflow-hidden');
				}
			}
		});
	}

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		const html = document.querySelector('html');
		if (html) {
			if (isDarkMode) {
				html.classList.add('dark');
			} else {
				html.classList.remove('dark');
			}
		}
	}

	onMount(() => {
		const options = {
			root: null,
			rootMargin: '-50% 0px',
			threshold: 0
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					activeSection = entry.target.id;
				}
			});
		}, options);

		sections.forEach((section) => {
			const element = document.getElementById(section.id);
			if (element) observer.observe(element);
		});

		return () => observer.disconnect();
	});

	function scrollToSection(sectionId: string) {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}

	$: if (typeof window !== 'undefined') {
		isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
	}

	let innerWidth = 0;
</script>

<svelte:window bind:innerWidth />
<header
	class="fixed left-0 top-0 z-40 w-full -translate-y-4 animate-fade-in border-b opacity-0 backdrop-blur-xl"
>
	<!-- Top Row -->
	<div class="container flex h-14 w-full items-center justify-between border-b border-gray-200 dark:border-gray-800">
		<a class="text-xs flex items-center" href="/">
			<img src={PIQLogo} alt="PIQ Logo" class="h-10 mr-0" />
			<span class="hidden sm:inline">Patiently IQ</span>
		</a>
	
		<div class="ml-auto flex h-full items-center">
			<button
				on:click={toggleDarkMode}
				class="mr-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
				aria-label="Toggle dark mode"
			>
				{#if isDarkMode}
					<Sun strokeWidth={1.2} class="w-5 h-5 text-gray-400" />
				{:else}
					<Moon strokeWidth={1.2} class="w-5 h-5 text-gray-800" />
				{/if}
			</button>
			<a class="mr-6 text-xs hidden sm:inline" href="/"> Log in </a>
			<Button class="text-xs ante-fade-in gap-1 rounded-lg bg-[#ff5151] text-white opacity-0 hover:bg-[#ff6b6b] [--animation-delay:600ms] dark:text-white">Contact</Button>
		</div>
		<button class="ml-6 md:hidden" use:toggleOverflowHidden>
			<span class="sr-only">Toggle menu</span>
			{#if hamburgerMenuIsOpen}
				<XIcon strokeWidth={1.4} class='text-gray-300'/>
			{:else}
				<AlignJustify strokeWidth={1.4} class='text-gray-300' />
			{/if}
		</button>
	</div>

	<!-- Bottom Row - Navigation -->
	<div class="hidden md:block container h-12">
		<nav class="h-full">
			<ul class="flex items-center space-x-8 h-full">
				{#each sections as section}
					<li>
						<button
							on:click={() => scrollToSection(section.id)}
							class="group flex items-center space-x-2 text-xs transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 px-2 py-1 rounded-md"
						>
							<span class="font-mono transition-colors duration-300 {activeSection === section.id ? 'text-[#ff5151]' : 'text-gray-500 group-hover:text-[#ff5151]'}">
								{section.number}
							</span>
							<span class="font-mono transition-colors duration-300 {activeSection === section.id ? 'text-[#ff5151]' : 'text-gray-500 group-hover:text-[#ff5151]'}">
								{section.label}
							</span>
						</button>
					</li>
				{/each}
			</ul>
		</nav>
	</div>

	<!-- Mobile Menu -->
	{#if hamburgerMenuIsOpen}
		<div
			class="absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 md:hidden"
			transition:fly={{ y: -20, duration: 200 }}
		>
			<nav class="container py-4">
				{#each sections as section}
					<button
						on:click={() => {
							scrollToSection(section.id);
							hamburgerMenuIsOpen = false;
						}}
						class="w-full text-left py-2 px-4 text-sm font-mono transition-colors duration-300 {activeSection === section.id ? 'text-[#ff5151]' : 'text-gray-500 hover:text-[#ff5151]'}"
					>
						<span class="mr-2">{section.number}</span>
						{section.label}
					</button>
				{/each}
			</nav>
		</div>
	{/if}
</header>

<style>
	/* Smooth transitions for color changes */
	.text-gray-500 {
		transition: color 0.3s ease-in-out;
	}

	/* Add smooth transition for mobile menu */
	nav button {
		transition: all 0.3s ease-in-out;
	}

	/* Subtle hover effect for navigation items */
	nav button:hover {
		background-color: rgba(0, 0, 0, 0.02);
	}
</style>