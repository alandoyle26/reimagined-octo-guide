export async function load({ fetch }) {
  try {
    const response = await fetch('/api/scrape');
    const data = await response.json();
    
    return {
      productData: data
    };
  } catch (error) {
    return {
      productData: {
        error: 'Failed to fetch product data',
        details: error.message
      }
    };
  }
} 