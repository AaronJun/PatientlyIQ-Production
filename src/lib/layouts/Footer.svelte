<script>
	import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
	import ContactForm from './ContactForm.svelte';
	import { Button } from '../components/ui/button';

	let isContactFormOpen = false;

	const footerSocials = [
		{
			href: '/',
			name: 'PIQ',
			logo: PIQLogo
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
	<div class="flex flex-col md:flex-row align-middle items-center md:justify-around bg-slate-900 min-h-[45vh]">

		<div class="flex items-left mix-blend-color-dodge">	
			<img src={PIQLogo} class="size-24" alt="PIQ Logo" />
		</div>


		<div class="flex flex-col md:col-span-5">	
			<!-- <Button variant="outline" on:click={openContactForm}>Contact Us</Button> -->
			

				<div class="flex flex-col md:flex-row font-mono">
					<p class="text-xs text-slate-300 dark:text-slate-400 sm:text-left italic">PIQ by</p>
					<a link="https://patiently.studio" class="cursor-pointer text-slate-300 underline text-xs pl-1">Patiently Studio
				</a>		
			</div>
			<div class="flex flex-col mt-8">
				<span class="text-xs text-slate-500 dark:text-slate-400 sm:text-left">
					© {new Date().getFullYear()}		</span>
				<span class="text-xs text-slate-500 dark:text-slate-400 sm:text-left">All rights reserved</span>
			</div>
		</div>
	</div>
</footer>

<style>
</style>