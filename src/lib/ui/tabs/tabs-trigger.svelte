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
    "inline-flex items-center rounded-full justify-center whitespace-nowrap px-3 py-1.5 mb-0 text-md font-medium outline-none hover:cursor-pointer hover:border-2 hover:border-primary transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50  data-[state=active]:text-foreground data-[state=active]:border-2 data-[state=active]:bg-sky-300 data-[state=active]:border-sky-600 border-2 border-transparent",
    className
  )}
  {value}
  {...$$restProps}
  on:click
>
  <slot />
</TabsPrimitive.Trigger>
