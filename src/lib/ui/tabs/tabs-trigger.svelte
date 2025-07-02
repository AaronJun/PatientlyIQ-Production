<script lang="ts">
  import { Tabs as TabsPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";

  type $$Props = TabsPrimitive.TriggerProps;
  type $$Events = TabsPrimitive.TriggerEvents;

  let className: $$Props["class"] = undefined;
  export let value: $$Props["value"];
  export { className as class };
</script>

<TabsPrimitive.Trigger
  class={cn(
    "inline-flex items-center rounded-full justify-center whitespace-nowrap px-1.5 md:px-3 py-1.5 mb-0 font-medium outline-none hover:cursor-pointer hover:border-indigo-300 transition-all border-slate-300 text-slate-500 hover:text-gray-700 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:border-1 data-[state=active]:border-slate-600 data-[state=active]:font-semibold border-1 flex-shrink-0 min-w-fit text-2xs md:text-base", 
    className
  )}
  {value}
  {...$$restProps}
  on:click
>
  <slot />
</TabsPrimitive.Trigger>
