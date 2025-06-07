import { json } from '@sveltejs/kit';
import got from 'got';
import * as cheerio from 'cheerio';

export async function GET() {
  try {
    const response = await got('https://www.tesco.ie/groceries/en-IE/products/315848575', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      retry: {
        limit: 3,
        methods: ['GET'],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
        errorCodes: ['ETIMEDOUT', 'ECONNRESET', 'EADDRINUSE', 'ECONNREFUSED', 'EPIPE', 'ENOTFOUND', 'ENETUNREACH', 'EAI_AGAIN'],
      },
      timeout: {
        request: 30000
      },
      http2: true,
      throwHttpErrors: false
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.statusCode}`);
    }

    const html = response.body;
    const $ = cheerio.load(html);

    // Find the price container and extract the price text
    const priceContainer = $('[class*="priceContainerNarrow"]');
    const priceText = priceContainer.find('p[class*="_priceText"]').text().trim();

    // Get the product title from h1
    const title = $('h1').first().text().trim();

    // Log for debugging
    console.log('Found price container:', priceContainer.length > 0);
    console.log('Price text:', priceText);
    console.log('Title:', title);

    if (!priceText && !title) {
      throw new Error('No data found on the page');
    }

    return json({
      price: priceText || 'Price not found',
      title: title || 'Title not found'
    });

  } catch (error) {
    console.error('Scraping error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.statusCode);
      console.error('Response headers:', error.response.headers);
    }
    return json({
      error: 'Failed to fetch data',
      message: error.message
    }, { status: 500 });
  }
} 