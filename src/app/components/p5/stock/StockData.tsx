// components/StockData.js
import { useState, useEffect } from 'react';

const StockData = ({ symbol = 'IBM' }) => {
  const [stockData, setStockData] = useState(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch(`/api/stock?symbol=${symbol}`);
        const data = await response.json();
        setStockData(data);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchStockData();
  }, [symbol]); // Re-fetch data if the symbol prop changes

  return (
    <div>
      <h1>Stock Data for {symbol}</h1>
      {stockData ? (
        <pre>{JSON.stringify(stockData, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default StockData;
