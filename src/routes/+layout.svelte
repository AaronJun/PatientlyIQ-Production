<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  import { dev } from '$app/environment';

  import { injectAnalytics } from '@vercel/analytics/sveltekit'
  import { shouldDisableTracking } from '$lib/analytics/excludeIP.js';
  
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
  
  // Check if current route is the RPDPRVDash page
  $: isRPDPRVDashRoute = routeID[1] === "rpdprvdash";

  import { resetMode, setMode } from "mode-watcher";
  import Header from '$lib/layouts/Header.svelte';
  import Footer from "$lib/layouts/Footer.svelte";
    setMode("light");
  import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

injectSpeedInsights();
  let pageWidth = 0;

  $: metadata = {
    ...defaultMetadata,
    ...$page.data.metadata
  };
  
  injectAnalytics({ mode: dev ? 'development' : 'production' });
  injectSpeedInsights();

</script>

<svelte:head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-S4WC261VK3"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
  
    // Initialize Google Analytics with IP anonymization
    gtag('config', 'G-S4WC261VK3', {
      'anonymize_ip': true,
      'send_page_view': false // We'll manually send page views for better control
    });
    
    // Add function to exclude internal traffic
    window.excludeInternalTraffic = function() {
      // Create custom tracker function that checks conditions before sending to GA
      window.trackEvent = function(eventName, params) {
        // Skip tracking if exclusion conditions are met
        if (typeof shouldDisableTracking === 'function' && shouldDisableTracking()) {
          console.log('Analytics tracking disabled - event not sent:', eventName, params);
          return;
        }
        
        // Check if we're in local development environment
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') {
          console.log('Local development - analytics event not sent:', eventName, params);
          return;
        }
        
        // Check if this IP is specifically excluded
        if (window.gaExcludedIPs && window.gaExcludedIPs.length > 0) {
          console.log('IP excluded - analytics event not sent:', eventName, params);
          return;
        }
        
        // Send the event to Google Analytics
        if (typeof gtag === 'function') {
          gtag('event', eventName, params);
        }
      };
      
      // Send initial page view (will be filtered by conditions above)
      window.trackEvent('page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    };
    
    // Call the function to configure tracking
    window.excludeInternalTraffic();
  </script>  
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

<!-- Only render the Header if not on the RPDPRVDash route -->
{#if !isRPDPRVDashRoute}
  <Header />
{/if}

<div>
  <slot />
</div>

<!-- Conditionally render Footer based on route if needed -->
{#if !isRPDPRVDashRoute}
  <Footer />
{/if}