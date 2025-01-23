<script lang="ts">
  import { getContext } from 'svelte';
  import { cn } from "$lib/utils";

  export let value: string;
  let className: string = undefined;
  export { className as class };

  const { selectedValue, register } = getContext('tabs');
  const { isSelected } = register(value);

  function handleClick() {
    selectedValue.set(value);
  }
</script>

<button
  class={cn(
    "inline-flex items-center justify-center whitespace-nowrap px-4 py-4 text-md font-medium rounded-full outline-none transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:bg-muted",
    $isSelected ? "bg-primary text-primary-foreground" : "text-muted-foreground",
    className
  )}
  on:click={handleClick}
  {...$$restProps}
>
  <slot />
</button>