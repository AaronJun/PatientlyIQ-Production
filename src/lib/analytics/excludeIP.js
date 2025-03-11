/**
 * Google Analytics IP Exclusion Utility
 * 
 * This utility helps exclude specific IP addresses from Google Analytics tracking.
 * 
 * Instructions:
 * 1. Add this script to your site
 * 2. Call the excludeIPFromAnalytics function with your IP address
 * 3. Optionally, store the IP in localStorage to persist across sessions
 */

/**
 * Exclude a specific IP address from Google Analytics tracking
 * @param {string} ipAddress - IP address to exclude (e.g., "192.168.1.1")
 * @param {boolean} persistInStorage - Whether to save the IP in localStorage
 */
export function excludeIPFromAnalytics(ipAddress, persistInStorage = true) {
  if (!ipAddress) {
    console.error('No IP address provided for exclusion');
    return;
  }

  // Save IP to localStorage if requested
  if (persistInStorage) {
    localStorage.setItem('ga_excluded_ip', ipAddress);
  }

  // Create or update the window.gaExcludedIPs array
  window.gaExcludedIPs = window.gaExcludedIPs || [];
  
  // Add IP if it's not already in the array
  if (!window.gaExcludedIPs.includes(ipAddress)) {
    window.gaExcludedIPs.push(ipAddress);
  }

  console.log(`IP address ${ipAddress} will be excluded from Google Analytics tracking`);
}

/**
 * Check if tracking should be disabled based on stored exclusion
 * @returns {boolean} True if tracking should be disabled
 */
export function shouldDisableTracking() {
  const excludedIP = localStorage.getItem('ga_excluded_ip');
  
  if (excludedIP) {
    console.log(`Analytics disabled for excluded IP: ${excludedIP}`);
    return true;
  }
  
  // Add other conditions to disable tracking here if needed
  // For example: development environments
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Analytics disabled in development environment');
    return true;
  }
  
  return false;
}

/**
 * Remove IP exclusion
 */
export function removeIPExclusion() {
  localStorage.removeItem('ga_excluded_ip');
  window.gaExcludedIPs = [];
  console.log('IP exclusion has been removed. Analytics tracking will resume.');
}

// You can run this script in the browser console to exclude your IP:
// 
// 1. First, find your IP address by visiting https://whatismyipaddress.com/
// 2. Then run this in your browser console:
//    excludeIPFromAnalytics('your.ip.address.here');
//
// To remove exclusion later:
//    removeIPExclusion(); 