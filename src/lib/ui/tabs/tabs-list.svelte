<script lang="ts">
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	type $$Props = TabsPrimitive.ListProps;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<TabsPrimitive.List
	class={cn(
		"flex flex-row items-center md:justify-center align-middle gap-2 w-full md:ring-1 md:ring-slate-300 p-2 hover:border-indigo-300 hover:bg-slate-50 transition-all duration-300 rounded-full overflow-x-auto scrollbar-hide",
		className
	)}
	{...$$restProps}
>
	<slot />
</TabsPrimitive.List>

<style>
	/* Hide scrollbar for WebKit browsers */
	:global(.scrollbar-hide) {
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* Internet Explorer 10+ */
	}
	
	:global(.scrollbar-hide::-webkit-scrollbar) {
		display: none; /* WebKit */
	}
</style>
