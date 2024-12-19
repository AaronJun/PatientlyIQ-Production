<script>
  export let id = 'G-S4WC261VK3'; // Your GTM ID (e.g., 'GTM-XXXXXX')
  
  // Add GTM script to head
  if (typeof window !== 'undefined') {
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${id}');
    `;
    document.head.appendChild(script);
  }
</script>

<!-- GTM noscript fallback -->
{#if typeof window !== 'undefined'}
  <noscript>
    <iframe 
      src="https://www.googletagmanager.com/ns.html?id={id}"
      height="0" 
      width="0" 
      style="display:none;visibility:hidden"
    ></iframe>
  </noscript>
{/if}
