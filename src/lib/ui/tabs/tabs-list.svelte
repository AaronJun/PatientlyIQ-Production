<script lang="ts">
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	type $$Props = TabsPrimitive.ListProps;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<TabsPrimitive.List
	class={cn(
		"flex flex-row items-center justify-center align-middle w-fit px-8 gap-2 bg-slate-100 p-2 hover:bg-slate-200 transition-all duration-300 rounded-full",
		className
	)}
	{...$$restProps}
>
	<slot />
</TabsPrimitive.List>
