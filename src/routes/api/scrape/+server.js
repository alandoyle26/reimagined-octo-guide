import { json } from '@sveltejs/kit';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import https from 'https';

export async function GET() {
  try {
    const agent = new https.Agent({
      rejectUnauthorized: false,
      keepAlive: true
    });

      const response = await fetch('https://www.tesco.ie/groceries/en-IE/products/315848575', {
      agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      }
    });

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
    console.log('Found price container:', priceContainer.length > 0);
    console.log('Price text:', priceText);
    console.log('Title:', title);

    return json({
      price: priceText || 'Price not found',
      title: title || 'Title not found'
    });

  } catch (error) {
    console.error('Scraping error:', error.message);
    return json({
      error: 'Failed to fetch data',
      message: error.message
    }, { status: 500 });
  }
} 