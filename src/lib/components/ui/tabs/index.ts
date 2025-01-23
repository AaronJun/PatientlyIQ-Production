import { Tabs as TabsPrimitive } from "bits-ui";
import Content from "./AlzTabsContent.svelte";
import List from "./AlzTabsList.svelte";
import Trigger from "./AlzTabsTrigger.svelte";

const Root = TabsPrimitive.Root;

export {
	Root,
	Content,
	List,
	Trigger,
	//
	Root as Tabs,
	Content as TabsContent,
	List as TabsList,
	Trigger as TabsTrigger,
};
