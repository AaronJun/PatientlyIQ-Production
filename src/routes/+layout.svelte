<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import "../app.css";
  import { ModeWatcher } from "mode-watcher";
  $: routeID = $page.url.pathname.split("/");

  import { resetMode, setMode } from "mode-watcher";
    import Header from '$lib/layouts/Header.svelte';
  import Footer from "$lib/layouts/Footer.svelte";
    setMode("light");
  let pageWidth = 0;
</script>

<svelte:window bind:innerWidth={pageWidth} />

<!-- {#if pageWidth > 1023 && routeID[1] === "examples"}
  <Navbar />  
{:else if routeID[1] === ""}
  <Navbar />
{/if} -->
<Header />
<div>
  <slot />
</div>
<Footer />