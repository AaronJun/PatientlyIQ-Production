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
    "inline-flex items-center justify-center px-1.5 md:px-2 py-1 font-medium rounded-full hover:cursor-pointer text-slate-500 hover:text-gray-700 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:bg-slate-100 flex-shrink-0 min-w-fit text-2xs md:text-base transition-all", 
    className
  )}
  {value}
  {...$$restProps}
  on:click
>
  <slot />
</TabsPrimitive.Trigger>
