// src/app/api/stock/route.ts
import { NextResponse } from 'next/server'; // Importing NextResponse
import axios from 'axios';

export async function GET(req: Request) {  // Specifying the Request type
  // Parse the query parameters from the URL
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Stock symbol is required' }, { status: 400 });
  }

  const apiKey = process.env.ALPHAVANTAGE_API_KEY; // Fetch API key from environment variables
  
  const options = {
    method: 'GET',
    url: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v3/get-historical-data',
    params: {
      symbol: symbol,
      region: 'US'
    },
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
}