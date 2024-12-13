<script lang="ts">
    import { onMount } from 'svelte';
    import "carbon-components-svelte/css/all.css";
    import {Tablet, TabletLandscape, Laptop, MailReply} from 'carbon-icons-svelte';
    import {Button} from 'carbon-components-svelte';
  
    let isMobile = false;
    const MOBILE_BREAKPOINT = 768; // You can adjust this value as needed
  
    function checkMobile() {
      isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    }
  
    onMount(() => {
      checkMobile();
      window.addEventListener('resize', checkMobile);
  
      return () => {
        window.removeEventListener('resize', checkMobile);
      };
    });
  </script>
  
  {#if isMobile}
    <div class="mobile-warning">
      <div class="warning-content">
        <div class="flex flex-row gap-4 pb-8 align-middle items-center justify-center">
            <Tablet class="text-[#ff1515]" size="32"/>
            <TabletLandscape class="text-[#ff1515]" size="32"/>
            <Laptop class="text-[#ff1515]" size="32"/>
        </div>
        <h2 class="text-[#ff1515] font-medium pb-4"> Designed for tablets and desktops</h2>
        <p>At the moment, this application is designed for larger screens.</p>
        <p>Make it easy to remember to come back by clicking below to share the link to your inbox.</p>
        <div class="button-container">
          <Button kind="primary" icon={MailReply} href="mailto:?subject=Check%20out%20this%20app&body=I%20found%20this%20app%20and%20thought%20you%20might%20like%20it.%20Visit%20it%20here:%20https://rpd-prv-flowers-v1.onrender.com/">Share</Button>
        </div>
    </div>

    </div>

  {/if}
  
  <style>
    .mobile-warning {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.725);
      display: flex;
      justify-content: center;
      align-content: left;
      align-items: center;
      z-index: 9999;
    }
  
    .warning-content {
      background-color: rgb(229, 229, 229);
      border-top: 10px solid #c93f3f;
      padding: 2rem;
      text-align: center;
      max-width: 80%;
    }
  
    h2 {
      font-size: 1.425rem;
      line-height: 1.5rem;
      text-align: center;

      margin-top: 1rem;
      margin-bottom: 1rem;
    }
  
    p {
      margin-bottom: 0.5rem;
      text-align: center;
      font-size: .8725rem;
      width: 100%;
    }

    .button-container {
    align-content: left;
    justify-content: left;
    align-items: left;
    margin-top: 2.725rem;
    margin-bottom: 1.25rem;
    }
  </style>