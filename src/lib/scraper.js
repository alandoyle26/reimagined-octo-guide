import { chromium } from 'playwright';

export async function scrapeProductHunt() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('https://www.producthunt.com/');
    
    // Wait for the content to load
    await page.waitForSelector('[data-test="homepage-section-0"]');
    
    // Get the content from the first section
    const content = await page.evaluate(() => {
      const section = document.querySelector('[data-test="homepage-section-0"]');
      return section ? section.textContent : null;
    });
    
    await browser.close();
    return content;
    
  } catch (error) {
    console.error('Error scraping Product Hunt:', error);
    await browser.close();
    return null;
  }
}

export async function scrapeTescoProduct() {
  const browser = await chromium.launch({
    proxy: {
      server: 'http://proxy.scrapingbee.com:8886',
      username: 'free',
      password: 'trial'
    }
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      }
    });

    const page = await context.newPage();
    
    // Enable request interception
    await page.route('**/*', route => {
      const request = route.request();
      // Block unnecessary resources
      if (['image', 'stylesheet', 'font', 'media'].includes(request.resourceType())) {
        route.abort();
      } else {
        route.continue();
      }
    });

    console.log('Attempting to fetch product page...');
    
    const response = await page.goto('https://www.tesco.ie/groceries/en-IE/products/315964892', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    if (!response.ok()) {
      throw new Error(`HTTP error! status: ${response.status()}`);
    }

    // Wait for specific content to be available
    try {
      await page.waitForSelector('h1', { timeout: 10000 });
    } catch (error) {
      throw new Error('Product title not found - page may be blocked or structured differently');
    }

    const productData = await page.evaluate(() => {
      const getData = (selector, defaultValue = 'Not available') => {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : defaultValue;
      };

      return {
        title: getData('h1'),
        price: getData('[data-auto="price-value"]'),
        description: getData('[data-auto="product-description"]'),
        details: Array.from(document.querySelectorAll('[data-auto="product-details"] li'))
          .map(item => item.textContent.trim())
          .filter(Boolean)
          .join(', ') || 'Not available'
      };
    });

    await browser.close();
    return productData;

  } catch (error) {
    console.error('Detailed error:', error);
    await browser.close();
    return {
      error: 'Unable to access the product information.',
      details: `${error.message}. This might be due to website restrictions or the product being unavailable.`,
      technicalError: error.stack
    };
  }
} 