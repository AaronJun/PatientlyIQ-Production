/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  // This function runs on the server when the page is requested
  // You can fetch data or perform server-side operations here
  
  return {
    // You can return data that will be available to the page component
    // For now, we're not returning any data as we're using the legacy HTML directly
  };
} 