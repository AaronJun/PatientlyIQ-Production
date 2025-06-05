/** @type {import('./$types').PageLoad} */
export async function load({ params, data }) {
  // This function runs on the client when the page is loaded
  // You can perform client-side operations here
  
  return {
    // Merge data from server with any client-side data
    ...data
  };
} 