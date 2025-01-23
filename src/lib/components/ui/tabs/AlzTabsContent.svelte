<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from "$lib/utils.ts";
  
	export let value: string;
	let className: string = undefined;
	export { className as class };
  
	const { selectedValue } = getContext('tabs');
  </script>
  
  {#if $selectedValue === value}
	<div
	  class={cn(
		"mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
		className
	  )}
	  {...$$restProps}
	>
	  <slot />
	</div>
  {/if}