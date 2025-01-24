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
        { label: 'Priority Voucher Database', href: '/rpd' },
    ];

    onMount(() => {
        const handleScroll = () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            isScrollingUp = currentScroll < lastScrollTop;
            lastScrollTop = currentScroll;
            isScrolled = currentScroll > 50;
            clearTimeout(scrollTimeout);
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

    function toggleMenu() {
        hamburgerMenuIsOpen = !hamburgerMenuIsOpen;
        document.documentElement.classList.toggle('overflow-hidden', hamburgerMenuIsOpen);
    }

</script>

<header
    class="absolute w-full z-40 bg-slate-100/50 backdrop-blur-xl border-b transition-all duration-300 ease-in-out"
    class:py-2={isScrolled}
    class:py-4={!isScrolled}
>
    <div class="container mx-auto px-4 flex items-center justify-between">
        <div class="flex items-center transition-all duration-300">
            <img src={PIQLogo} alt="PIQ Logo" class="h-8 mr-1" />
            <a class="text-xs flex items-center justify-start" href="/">
                <span class="hidden sm:inline text-orange-500">Patiently IQ</span>
            </a>
        </div>

        <div class="flex items-center space-x-4">
            <!-- Desktop Navigation -->
            <nav class="hidden md:flex items-center space-x-6">
             
            </nav>

            <!-- Mobile Menu Button -->
            <button
                class="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
                on:click={toggleMenu}
            >
                {#if hamburgerMenuIsOpen}
                    <XIcon class="w-5 h-5" />
                {:else}
                    <AlignJustify class="w-5 h-5" />
                {/if}
            </button>

            <Button 
                on:click={() => scrollToSection('contactform')}
                class="hidden md:flex -translate-y-2 animate-fade-in gap-1 rounded-full text-xs bg-[#ff5151] border-orange-400 text-white hover:bg-[#ff6b6b] dark:text-orange-100"
            >
                <span>Project Inquiries</span>
                <ArrowRightIcon class="ml-1 size-4 transition-transform duration-500 ease-in-out group-hover:translate-x-2" />
            </Button>
        </div>
    </div>

    <!-- Mobile Menu -->
    {#if hamburgerMenuIsOpen}
        <div
            class="z-99 absolute pb-12 left-0 top-full w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 md:hidden"
            transition:fly={{ x: 20, duration: 500 }}
        >
            <nav class="container py-4 z-99">
                {#each toolsLinks as link}
                    <a 
                        href={link.href}
                        class="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors duration-150"
                    >
                        {link.label}
                    </a>
                {/each}
                <div class="px-4 pt-4">
                    <Button 
                        on:click={() => scrollToSection('contactform')}
                        class="w-full justify-center gap-1 rounded-full text-xs bg-[#ff5151] border-orange-400 text-white hover:bg-[#ff6b6b] dark:text-orange-100"
                    >
                        <span>Project Inquiries</span>
                        <ArrowRightIcon class="ml-1 size-4" />
                    </Button>
                </div>
            </nav>
        </div>
    {/if}
</header>

<style>
    header {
        transform: translateY(0);
        will-change: transform, height, padding;
    }

    .transition-all {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
</style>