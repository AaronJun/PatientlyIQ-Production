<script>
    import { CollapsibleCard } from 'svelte-collapsible'
		
		let cards = [
			{
				header: 'header 1',
				body: 'This is the description of my first item',
				open: true
			},
			{
				header: 'header 2',
				body: 'This is the description of my second item',
				open: true
			},
			{
				header: 'header 3',
				body: 'This is the description of my third item',
				open: true
			}
		]
		
		function openAll() {
			cards = cards.map(c => Object.assign({}, c, { open: true }))
		}
	
		function closeAll() {
			cards = cards.map(c => Object.assign({}, c, { open: false }))
		}
	
		function toggleAll() {
			cards = cards.map(c => Object.assign({}, c, { open: !c.open }))
		}
		
</script>

<button on:click={openAll}>Open All Cards</button>
<button on:click={closeAll}>Close All Cards</button>
<button on:click={toggleAll}>Toggle All Cards</button>

{ #each cards as card }
	<CollapsibleCard bind:open={card.open}>
			<h2 slot='header' class='header'>{ card.header }</h2>
			<p slot='body' class='body'>{ card.body }</p>
	</CollapsibleCard>
{ /each }

<style>
	:global(.card) {
		border: 1px solid black;
	}
</style>