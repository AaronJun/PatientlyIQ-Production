<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  
  const defaultMetadata = {
    title: "PatientlyIQ",
    description: "PatientlyIQ is a comprehensive database built to elevate the patient and caregiver voice.",
    image: "https://patientlyiq.com/static/rpd-program-preview.png", // Add a default social image
    url: "https://patientlyiq.com",
    siteName: "PatientlyIQ"
  };

  import "../app.css";
  import { ModeWatcher } from "mode-watcher";
  $: routeID = $page.url.pathname.split("/");

  import { resetMode, setMode } from "mode-watcher";
    import Header from '$lib/layouts/Header.svelte';
  import Footer from "$lib/layouts/Footer.svelte";
    setMode("light");
  let pageWidth = 0;

  $: metadata = {
    ...defaultMetadata,
    ...$page.data.metadata
  };
</script>

<svelte:head>
  <!-- Basic Meta Tags -->
  <title>{metadata.title}</title>
  <meta name="description" content={metadata.description} />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={metadata.url} />
  <meta property="og:title" content={metadata.title} />
  <meta property="og:description" content={metadata.description} />
  <meta property="og:image" content={metadata.image} />
  <meta property="og:site_name" content={metadata.siteName} />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={metadata.url} />
  <meta name="twitter:title" content={metadata.title} />
  <meta name="twitter:description" content={metadata.description} />
  <meta name="twitter:image" content={metadata.image} />
</svelte:head>

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