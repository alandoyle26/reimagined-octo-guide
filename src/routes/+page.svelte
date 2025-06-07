<script>
  export let data;
  const { productData } = data;
</script>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: white;
  }

  .container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .product-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
  }

  .product-table th,
  .product-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  .product-table th {
    background: #f8f9fa;
    font-weight: 600;
    color: #333;
    text-transform: capitalize;
  }

  .product-table tr:last-child td {
    border-bottom: none;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error {
    background: #fff3f3;
    color: #dc3545;
    padding: 1.5rem;
    border-radius: 8px;
    margin: 2rem 0;
    border: 1px solid #ffcdd2;
  }

  .error-message {
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .error-details {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #ffcdd2;
    font-size: 0.9rem;
    color: #666;
  }

  .retry-button {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    text-decoration: none;
    font-size: 0.9rem;
  }

  .retry-button:hover {
    background: #c82333;
  }
</style>

<div class="container">
  {#if productData}
    {#if productData.error}
      <div class="error">
        <div class="error-message">{productData.error}</div>
        {#if productData.message}
          <div class="error-details">{productData.message}</div>
        {/if}
        <a href="/" class="retry-button">Try Again</a>
      </div>
    {:else}
      <table class="product-table">
        <tbody>
          {#each Object.entries(productData) as [key, value]}
            {#if value && value !== 'Not available'}
              <tr>
                <th>{key.split(/(?=[A-Z])/).join(' ')}</th>
                <td>{value}</td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    {/if}
  {:else}
    <div class="loading">
      <div class="spinner"></div>
      <div>Loading product information...</div>
    </div>
  {/if}
</div>
