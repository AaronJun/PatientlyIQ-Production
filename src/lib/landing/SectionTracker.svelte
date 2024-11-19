<script lang="ts">
	import { fly } from 'svelte/transition';
	
	export let activeSection: string;
	export let hamburgerMenuIsOpen: boolean = false;
	export let onSectionClick: (sectionId: string) => void;
	
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
</script>

<div class="fixed left-0 top-14 z-30 w-full bg-white/80 backdrop-blur-xl dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
	<!-- Desktop Navigation -->
	<div class="hidden md:block container h-12">
		<nav class="h-full">
			<ul class="flex items-center space-x-8 h-full">
				{#each sections as section}
					<li>
						<button
							on:click={() => onSectionClick(section.id)}
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

	<!-- Mobile Navigation -->
	{#if hamburgerMenuIsOpen}
		<div
			class="absolute left-0 w-full bg-white dark:bg-gray-700 md:hidden"
			transition:fly={{ y: -20, duration: 200 }}
		>
			<nav class="container py-4">
				{#each sections as section}
					<button
						on:click={() => onSectionClick(section.id)}
						class="w-full text-left py-2 px-4 text-sm font-mono transition-colors duration-300 {activeSection === section.id ? 'text-[#ff5151]' : 'text-gray-500 hover:text-[#ff5151]'}"
					>
						<span class="mr-2">{section.number}</span>
						{section.label}
					</button>
				{/each}
			</nav>
		</div>
	{/if}
</div>

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
		background-color: rgba(0, 0, 0, 0.0);
	}
</style>