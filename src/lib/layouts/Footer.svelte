<script>
	import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';

	const footerNavs = [
		{
			label: 'Product',
			items: [
				{
					href: '/',
					name: 'Email Collection'
				},
				{
					href: '/pricing',
					name: 'Pricing'
				},
				{
					href: '/faq',
					name: 'FAQ'
				}
			]
		},

		{
			label: 'Community',
			items: [
				{
					href: '/',
					name: 'Discord'
				},
				{
					href: '/',
					name: 'Twitter'
				},
				{
					href: 'mailto:hello@chatcollect.com',
					name: 'Email'
				}
			]
		},
		{
			label: 'Legal',
			items: [
				{
					href: '/terms',
					name: 'Terms'
				},

				{
					href: '/privacy',
					name: 'Privacy'
				}
			]
		}
	];

	const footerSocials = [
		{
			href: '',
			name: 'PIQ',
			icon: PIQLogo
		},
	];
</script>

<footer>
	
		<div
			class="flex flex-col gap-2 rounded-md border-neutral-700/20 px-8 py-4 sm:flex sm:flex-row sm:items-center sm:justify-between"
		>
			<div class="grid ml-10">
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
			<span class="text-xs text-gray-500 dark:text-gray-400 sm:text-left mr-20">
				© {new Date().getFullYear()}
				
				<br class="hidden md:block" />
				<br class="hidden md:block" />
				<a href="/" class="cursor-pointer">
				Patiently Studio</a> 		
				<br class="hidden md:block" />
				All rights reserved
			</span>
		</div>
	<!-- Site Banner -->
</footer>

<style>
	.flex {
		display: flex;
		min-height: 45vh;
		background-color: #13131b;
		border-top: .25px dotted #ff1a1a;
	}
</style>
