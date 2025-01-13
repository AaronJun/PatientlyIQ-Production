<script>
	import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
	import ContactForm from './ContactForm.svelte';
	import { Button } from '../components/ui/button';

	let isContactFormOpen = false;

	const footerSocials = [
		{
			href: '',
			name: 'PIQ',
			icon: PIQLogo
		},
	];

	function openContactForm() {
		isContactFormOpen = true;
	}

	function closeContactForm() {
		isContactFormOpen = false;
	}
</script>

<footer>
	<div class="flex flex-col gap-2 border-neutral-700/20 px-8 pt-12 sm:flex sm:flex-row sm:items-center sm:justify-between flex-grow">
		<div class="grid ml-24">
			{#each footerSocials as social}
				<a
					href={social.href}
					class="fill-gray-500 text-gray-500 hover:fill-gray-900 hover:text-gray-900 dark:hover:fill-gray-600 dark:hover:text-gray-600"
				>
					<img src={social.icon} class="size-11" alt={social.name} />
					<span class="sr-only">{social.name}</span>
				</a>
			{/each}
		</div>
		<div class="flex items-center space-x-4 mr-20">
			<!-- <Button variant="outline" on:click={openContactForm}>Contact Us</Button> -->
			<span class="text-xs text-gray-500 dark:text-gray-400 sm:text-left">
				© {new Date().getFullYear()}
				<br class="hidden md:block" />
				<br class="hidden md:block" />
				<a href="/" class="cursor-pointer">
					Patiently Studio
				</a>
				<br class="hidden md:block" />
				All rights reserved
			</span>
		</div>
	</div>
</footer>

<style>
	.flex {
		display: flex;
		min-height: 65vh;
		background-color: #13131b;
		border-top: .25px dotted #ff1a1a;
	}
</style>