<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
    import { ArrowRightIcon, AlignJustify, XIcon, Sun, Moon, ChevronDown } from 'lucide-svelte';

    import { fly } from 'svelte/transition';
    import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
    import { onMount } from 'svelte';
    
    let hamburgerMenuIsOpen = false;
    let isDarkMode = false;
    let isScrolled = false;
    let lastScrollTop = 0;
    let isScrollingUp = true;
    let scrollTimeout: NodeJS.Timeout;

	function scrollToSection(sectionId: string) {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
		if (hamburgerMenuIsOpen) {
			hamburgerMenuIsOpen = false;
		}
	}

    const toolsLinks = [
        { label: 'Patient Sentiment', href: '/sentiment' },
        { label: 'Patient Cards', href: '/cards' },
        { label: 'Rare Atlas', href: '/atlas' }
    ];

    onMount(() => {
        const handleScroll = () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            
            // Detect scroll direction
            isScrollingUp = currentScroll < lastScrollTop;
            lastScrollTop = currentScroll;
            
            // Set scrolled state when scrolling past threshold
            isScrolled = currentScroll > 50;

            // Clear existing timeout
            clearTimeout(scrollTimeout);

            // Set new timeout to revert to full size when scrolling stops
            scrollTimeout = setTimeout(() => {
                isScrolled = false;
            }, 150);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout) clearTimeout(scrollTimeout);
        };
    });

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
                html.classList.add('light');
            } else {
                html.classList.remove('dark');
            }
        }
    }

    $: if (typeof window !== 'undefined') {
        isDarkMode = window.matchMedia('(prefers-color-scheme: light)').matches;
    }
</script>

<header
    class="fixed w-full z-40 bg-slate-100/50 backdrop-blur-xl border-b transition-all duration-300 ease-in-out"
    class:py-2={isScrolled}
    class:py-4={!isScrolled}
>
    <div class="container mx-auto pl-12 flex items-center justify-between transition-all ease-linear duration-400" class:scale-y-0={isScrolled} class:scale-100={!isScrolled}>
        <div class="flex items-center transition-all duration-300">
            <img src={PIQLogo} alt="PIQ Logo" class="h-8 mr-1" />
            <a class="text-xs flex items-center justify-start" href="/">
                <span class="hidden sm:inline text-orange-500">Patiently IQ</span>
            </a>
        </div>

        <div class="flex h-full items-center">
            <!-- Mobile Menu Button -->
			<Button 
			on:click={() => scrollToSection('contactform')}
			class="-translate-y-2 animate-fade-in gap-1 rounded-full text-xs bg-[#ff5151] border-orange-400 text-white opacity-0 hover:bg-[#ff6b6b] [--animation-delay:600ms] dark:text-orange-100"
		>
			<span>Project Inquiries</span>
			<ArrowRightIcon class="ml-1 size-4 transition-transform duration-500 ease-in-out group-hover:translate-x-2" />
		</Button>
        </div>

        <!-- Mobile Tools Menu -->
        {#if hamburgerMenuIsOpen}
            <div
                class="absolute left-0 top-full w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 md:hidden"
                transition:fly={{ y: -20, duration: 200 }}
            >
                <nav class="container">
                    <div class="px-4 py-text-sm font-semibold text-gray-600 dark:text-gray-400">Tools</div>
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
    header {
        transform: translateY(0);
        will-change: transform, height, padding;
    }

    /* Optional: Add a subtle scale effect on dropdown items hover */
    .group:hover .group-hover\:scale-100 {
        transform: scale(1);
    }

    /* Smooth transitions for all changes */
    .transition-all {
        transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
    }
</style>