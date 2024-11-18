<script lang="ts">
    import { onDestroy } from "svelte";
    import { Motion, AnimatePresence } from "svelte-motion";
    import { inview } from 'svelte-inview';
    import type { ObserverEventDetails } from 'svelte-inview';

    let inView = false;
    
    const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
        inView = detail.inView;
    };

    type Testimonial = {
        quote: string;
        name: string;
        designation: string;
        company: string;
        src: string;
    };

    
    const testimonials: Testimonial[] = [
        {
            quote: "PatientlyIQ's insights have transformed how we approach patient engagement. The depth of understanding we now have about patient experiences has enabled us to design more effective support programs.",
            name: "Dr. Sarah Chen",
            designation: "Head of Clinical Operations",
            company: "BioGen Therapeutics",
            src: "" // Empty src to demonstrate fallback
        },
        {
            quote: "The real-time patient insights and social listening capabilities have given us unprecedented visibility into patient needs. This platform has become essential to our patient-centric approach.",
            name: "Michael Rodriguez",
            designation: "Patient Advocacy Director",
            company: "Global Health Initiative",
            src: "" // Empty src to demonstrate fallback
        },
        {
            quote: "Using PatientlyIQ has significantly improved our ability to understand and respond to patient needs. The AI-powered analytics have revealed patterns we would have otherwise missed.",
            name: "Dr. Emily Watson",
            designation: "Medical Affairs Lead",
            company: "Innovative Pharma",
            src: "" // Empty src to demonstrate fallback
        },
        {
            quote: "The platform's ability to synthesize data from multiple sources has revolutionized our market research capabilities. We're now able to make decisions based on comprehensive patient insights.",
            name: "James Parker",
            designation: "Commercial Strategy Director",
            company: "NextGen Pharmaceuticals",
            src: "" // Empty src to demonstrate fallback
        }
    ];

    let active = 0;
    const handleNext = () => {
        active = (active + 1) % testimonials.length;
    };
    
    const handlePrev = () => {
        active = (active - 1 + testimonials.length) % testimonials.length;
    };

    const isActive = (index: number) => {
        return index === active;
    };
    
    const randomRotateY = () => {
        return Math.floor(Math.random() * 21) - 10;
    };

    let interval: NodeJS.Timeout;
    
    $: {
        if (inView) {
            interval = setInterval(handleNext, 5000);
        } else {
            clearInterval(interval);
        }
    }

    onDestroy(() => {
        clearInterval(interval);
    });
</script>
<div class="divide-y divide-dashed divide-orange-500"></div>

<section class="relative mx-auto mt-2 max-w-7xl px-2 md:px-2" id="testimonials">
    <div class="text-left mb-16">
        
        <section class="relative mx-auto mt-32 max-w-7xl px-6 md:px-8">
            <div class="text-left mb-16">
                <div class="mb-4 flex items-left gap-2">
                    <span class="font-mono text-xs text-gray-500">05</span>
                    <span class="font-mono text-xs text-gray-500">Testimonials</span>
                </div>
                
            </div>
            <h2 class="animate-fade-in text-balance mb-24 bg-gradient-to-br from-gray-800 from-30% to-gray-500 bg-clip-text mr-2 sm:mr-0 text-5xl font-normal [--animation-delay:200ms] dark:from-white/60 dark:to-white">
                Hear from <span class="font-serif pr-2 italic text-[#ff5151]">satisfied </span> customers
            </h2>
        </section>
    </div>

    <div
        use:inview={{ unobserveOnEnter: true, rootMargin: '-100px' }}
        on:inview_change={handleChange}
        class="max-w-lg md:max-w-4xl mx-auto px-4 md:px-4 lg:px-4 py-20"
    >
     
<div class="relative grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
           
<div class="relative h-[400px] w-[400px]"> <!-- Fixed dimensions -->
    <AnimatePresence let:item list={[{ key: active }]}>
        {#each testimonials as testimonial, index}
            <Motion
                initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: randomRotateY(),
                }}
                animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? -20 : -100,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index) ? 999 : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                }}
                exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: -10,
                    rotate: randomRotateY(),
                }}
                transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                }}
                let:motion
            >
                <div 
                    use:motion 
                    class="absolute inset-0 origin-bottom rounded-3xl shadow-xl overflow-hidden mr-24"
                >
                    {#if testimonial.src}
                        <img
                            src={testimonial.src}
                            alt={testimonial.name}
                            width={400}
                            height={400}
                            draggable={false}
                            class="h-full w-full object-cover"
                        />
                    {:else}
                        <div class="h-full w-full bg-gradient-to-br from-[#ff5151] to-[#ff8151] flex items-center justify-center text-white">
                            <span class="text-4xl font-serif">
                                {testimonial.name.split(' ').map(n => n[0]).join('')}
                            </span>
                        </div>
                    {/if}
                </div>
            </Motion>
        {/each}
    </AnimatePresence>
</div>

            </div>

            <div class="flex justify-between flex-col py-4">
                <Motion
                    initial={{
                        y: 20,
                        opacity: 0,
                    }}
                    animate={{
                        y: 0,
                        opacity: 1,
                    }}
                    exit={{
                        y: -20,
                        opacity: 0,
                    }}
                    transition={{
                        duration: 0.2,
                        ease: "easeInOut",
                    }}
                    let:motion
                >
                    <div use:motion>
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                            {testimonials[active].name}
                        </h3>
                        <div class="space-y-1">
                            <p class="text-sm text-[#ff5151]">
                                {testimonials[active].designation}
                            </p>
                            <p class="text-sm text-gray-500 dark:text-neutral-400">
                                {testimonials[active].company}
                            </p>
                        </div>
                        {#key active}
                            <p class="text-sm text-gray-600 mt-4 dark:text-neutral-300">
                                {#each testimonials[active].quote.split(" ") as word, index}
                                    <Motion
                                        initial={{
                                            filter: "blur(10px)",
                                            opacity: 0,
                                            y: 5,
                                        }}
                                        animate={{
                                            filter: "blur(0px)",
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        transition={{
                                            duration: 0.2,
                                            ease: "easeInOut",
                                            delay: 0.02 * index,
                                        }}
                                        let:motion
                                    >
                                        <span use:motion class="inline-block">
                                            {word}&nbsp;
                                        </span>
                                    </Motion>
                                {/each}
                            </p>
                        {/key}
                    </div>
                </Motion>

                <div class="flex gap-4 pt-12 md:pt-0">
                    <button
                        on:click={handlePrev}
                        class="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 dark:hover:bg-[#ff5151]  flex items-center justify-center group/button hover:bg-[#ff5151] hover:text-white transition-all duration-300"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="h-5 w-5 group-hover/button:rotate-12 transition-transform duration-300"
                        >
                            <path d="m12 19-7-7 7-7" />
                            <path d="M19 12H5" />
                        </svg>
                    </button>
                    <button
                        on:click={handleNext}
                        class="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 dark:hover:bg-[#ff5151] flex items-center justify-center group/button hover:bg-[#ff5151] hover:text-white transition-all duration-300"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            class="h-5 w-5 group-hover/button:-rotate-12 transition-transform duration-300"
                            stroke-linejoin="round"
                        >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</section>

<style>

:global(.divide-y) 
{
    margin-top: 10rem;
    border-top: .25px;
    border-style: dotted;
    border-color: #ff8151;
    border-top-style: dashed;
}

</style>