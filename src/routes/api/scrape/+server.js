import { json } from '@sveltejs/kit';
import got from 'got';
import * as cheerio from 'cheerio';

export const config = {
  runtime: 'edge',
  maxDuration: 60
};

export async function GET() {
  try {
    const response = await got('https://www.tesco.ie/groceries/en-IE/products/315848575', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      retry: {
        limit: 3,
        methods: ['GET'],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
        errorCodes: ['ETIMEDOUT', 'ECONNRESET', 'EADDRINUSE', 'ECONNREFUSED', 'EPIPE', 'ENOTFOUND', 'ENETUNREACH', 'EAI_AGAIN'],
        calculateDelay: ({ error, retryCount }) => {
          if (error?.code === 'ETIMEDOUT') {
            return Math.min(1000 * Math.pow(2, retryCount + 2), 20000);
          }
          return Math.min(1000 * Math.pow(2, retryCount), 10000);
        }
      },
      timeout: {
        request: 30000,
        response: 30000,
        lookup: 3000,
        connect: 5000,
        secureConnect: 5000,
        socket: 30000
      },
      decompress: true,
      followRedirect: true,
      https: {
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined
      },
      http2: false,
      dnsCache: true,
      keepAlive: true,
      enableUnixSockets: false
    });

    if (!response.ok && response.statusCode !== 200) {
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
    console.log('Response status:', response.statusCode);
    console.log('Found price container:', priceContainer.length > 0);
    console.log('Price text:', priceText);
    console.log('Title:', title);

    if (!priceText && !title) {
      throw new Error('No data found on the page');
    }

    return json({
      price: priceText || 'Price not found',
      title: title || 'Title not found',
      statusCode: response.statusCode
    });

  } catch (error) {
    console.error('Scraping error:', {
      message: error.message,
      code: error.code,
      statusCode: error.response?.statusCode,
      body: error.response?.body?.slice(0, 200),
      stack: error.stack
    });

    return json({
      error: 'Failed to fetch data',
      message: error.message,
      details: error.code || 'Unknown error',
      stack: error.stack
    }, { status: 500 });
  }
} 