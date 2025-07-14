<script lang="ts">
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	type Variant = "default" | "underline" | "pills" | "bordered";
	
	interface Props extends TabsPrimitive.ListProps {
		variant?: Variant;
	}

	type $$Props = Props;

	let className: $$Props["class"] = undefined;
	export let variant: Variant = "default";
	export { className as class };

	const variants = {
		default: "flex flex-row items-center md:justify-center align-middle gap-2 w-full p-2 hover:border-indigo-300 hover:bg-slate-50 transition-all duration-300 rounded-full overflow-x-auto scrollbar-hide",
		underline: "flex flex-row items-center justify-between border-b border-slate-200 overflow-x-auto scrollbar-hide",
		pills: "flex flex-row items-center gap-2 w-full p-1 rounded-lg bg-slate-100 overflow-x-auto scrollbar-hide",
		bordered: "flex flex-row items-center gap-2 w-full p-1 border-2 border-slate-200 rounded-lg overflow-x-auto scrollbar-hide"
	};
</script>

<TabsPrimitive.List
	class={cn(variants[variant], className)}
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
