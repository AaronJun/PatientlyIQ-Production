<script>
  import Marquee from "$lib/magicui/components/Marquee/Marquee.svelte";
  import { cn } from "$lib/utils";
  const files = [
    {
      name: "Audree",
      body: "When I was diagnosed, it felt like a weight lifted from my shoulders.",
    },
    {
      name: "Nick",
      body: "It never even occured to me to look for a clinicla trial.",
    },
    {
      name: "Sara",
      body: "I was so relieved to find a trial that was right for me.",
    },
    {
      name: "Jeffery",
      body: "Even though I found multiple trials that I could join, the distance was never close enough to travel.",
    },
  ];
</script>

<Marquee
  pauseOnHover
  class="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
>
  {#each files as f, i}
    <figure
      id={`item-${i}`}
      class={cn(
        "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
        "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
      )}
    >
      <div class="flex flex-row items-center gap-2">
        <div class="flex flex-col">
          <figcaption class="text-sm font-medium dark:text-white ">
            {f.name}
          </figcaption>
        </div>
      </div>
      <blockquote class="mt-2 text-xs">{f.body}</blockquote>
    </figure>
  {/each}
</Marquee>
