<script lang="ts">
	import Button from '$lib/ui/button/button.svelte'
	import { AlignJustify, XIcon, Sun, Moon, ChevronDown } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
	
	let hamburgerMenuIsOpen = false;
	let isDarkMode = false;

	const toolsLinks = [
		{ label: 'Patient Sentiment', href: '/sentiment' },
		{ label: 'Patient Cards', href: '/cards' },
		{ label: 'Rare Atlas', href: '/atlas' }
	];

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

	$: if (typeof window !== 'undefined') {
		isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
	}
</script>

<header
	class="fixed left-0 top-0 z-40 w-full -translate-y-4 animate-fade-in border-b opacity-0 backdrop-blur-xl"
>
	<div class="container flex-grow w-full flex h-14 w-full items-baseline justify-around">
		<div class="flex items-center space-x-8">
			<a class="text-xs flex items-center" href="/">
				<img src={PIQLogo} alt="PIQ Logo" class="h-10 mr-0" />
				<span class="hidden sm:inline">Patiently IQ</span>
			</a>
		</div>
	
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

		<!-- Mobile Menu Button -->
		<button class="ml-6 md:hidden" use:toggleOverflowHidden>
			<span class="sr-only">Toggle menu</span>
			{#if hamburgerMenuIsOpen}
				<XIcon strokeWidth={1.4} class='text-gray-300'/>
			{:else}
			<AlignJustify strokeWidth={1.4} class='text-gray-300' />
			{/if}
		</button>

		<!-- Mobile Tools Menu -->
		{#if hamburgerMenuIsOpen}
			<div
				class="absolute left-0 top-full w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 md:hidden"
				transition:fly={{ y: -20, duration: 200 }}
			>
				<nav class="container py-4">
					<div class="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Tools</div>
					{#each toolsLinks as link}
						<a 
							href={link.href}
							class="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors duration-150"
						>
							{link.label}
						</a>
					{/each}
				</nav>
			</div>
		{/if}
	</div>
</header>

<style>
	/* Optional: Add a subtle scale effect on dropdown items hover */
	.group:hover .group-hover\:scale-100 {
		transform: scale(1);
	}
</style>