import { json } from '@sveltejs/kit';
import * as cheerio from 'cheerio';

export const config = {
  runtime: 'edge',
  maxDuration: 60
};

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch('https://www.tesco.ie/groceries/en-IE/products/315848575', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      signal: controller.signal,
      cache: 'no-store'
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Find the price container and extract the price text
    const priceContainer = $('[class*="priceContainerNarrow"]');
    const priceText = priceContainer.find('p[class*="_priceText"]').text().trim();

    // Get the product title from h1
    const title = $('h1').first().text().trim();

    // Log for debugging
    console.log('Response status:', response.status);
    console.log('Found price container:', priceContainer.length > 0);
    console.log('Price text:', priceText);
    console.log('Title:', title);

    if (!priceText && !title) {
      throw new Error('No data found on the page');
    }

    return json({
      price: priceText || 'Price not found',
      title: title || 'Title not found',
      statusCode: response.status
    });

  } catch (error) {
    console.error('Scraping error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    // Special handling for timeout errors
    if (error.name === 'AbortError') {
      return json({
        error: 'Request timeout',
        message: 'The request took too long to complete',
        details: 'TIMEOUT'
      }, { status: 504 });
    }

    return json({
      error: 'Failed to fetch data',
      message: error.message,
      details: error.name || 'Unknown error'
    }, { status: 500 });
  }
} 