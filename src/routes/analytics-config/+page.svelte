<script lang="ts">
  import { onMount } from 'svelte';
  import { excludeIPFromAnalytics, removeIPExclusion } from '$lib/analytics/excludeIP.js';
  
  let currentIP = '';
  let excludedIP = '';
  let status = '';
  let isLoading = true;
  
  async function fetchCurrentIP() {
    try {
      isLoading = true;
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      currentIP = data.ip;
      status = 'IP address detected';
    } catch (error) {
      console.error('Error fetching IP:', error);
      status = 'Error fetching IP address';
      currentIP = 'Unable to detect';
    } finally {
      isLoading = false;
    }
  }
  
  function checkExcludedStatus() {
    excludedIP = localStorage.getItem('ga_excluded_ip') || '';
    if (excludedIP) {
      status = `IP ${excludedIP} is currently excluded from tracking`;
    } else {
      status = 'No IP exclusion set';
    }
  }
  
  function handleExcludeIP() {
    const ipToExclude = currentIP || excludedIP;
    if (ipToExclude) {
      excludeIPFromAnalytics(ipToExclude);
      excludedIP = ipToExclude;
      status = `IP ${ipToExclude} has been excluded from Google Analytics tracking`;
    } else {
      status = 'No IP address to exclude';
    }
  }
  
  function handleRemoveExclusion() {
    removeIPExclusion();
    excludedIP = '';
    status = 'IP exclusion has been removed. Analytics tracking will resume.';
  }
  
  onMount(() => {
    fetchCurrentIP();
    checkExcludedStatus();
  });
</script>

<div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Google Analytics Configuration</h1>
      <p class="text-gray-600">Manage your analytics preferences for this site</p>
    </div>
    
    <div class="mb-8 p-4 border border-gray-200 rounded-lg">
      <h2 class="text-lg font-semibold mb-4">Your IP Address</h2>
      <div class="flex items-center justify-between mb-4">
        <span>{isLoading ? 'Detecting IP...' : currentIP}</span>
        <button 
          class="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm"
          on:click={fetchCurrentIP}
          disabled={isLoading}
        >
          Refresh
        </button>
      </div>
      <p class="text-sm text-gray-500">This is the IP address that will be detected by analytics services.</p>
    </div>
    
    <div class="mb-8 p-4 border border-gray-200 rounded-lg">
      <h2 class="text-lg font-semibold mb-4">IP Exclusion Status</h2>
      <div class="mb-4">
        <p class="font-medium">{status}</p>
        {#if excludedIP}
          <p class="text-sm text-gray-600 mt-1">Excluded IP: {excludedIP}</p>
        {/if}
      </div>
    </div>
    
    <div class="flex flex-col space-y-4">
      <button 
        class="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm"
        on:click={handleExcludeIP}
      >
        Exclude My IP from Analytics
      </button>
      
      <button 
        class="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm"
        on:click={handleRemoveExclusion}
        disabled={!excludedIP}
      >
        Remove IP Exclusion
      </button>
      
      <a 
        href="/"
        class="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-md shadow-sm text-center"
      >
        Return to Homepage
      </a>
    </div>
    
    <div class="mt-8 text-xs text-gray-500">
      <h3 class="font-semibold mb-1">How This Works</h3>
      <p>When you exclude your IP address, it is stored locally in your browser. Google Analytics will not track your activity on this site from this browser.</p>
      <p class="mt-2">This exclusion is device and browser specific. If you use a different browser or device, you'll need to exclude your IP there as well.</p>
    </div>
  </div>
</div> 