'use client';
import p5 from 'p5';
import 'p5/lib/addons/p5.sound';

interface StockEntry {
    date: string; // Formatted date as a string
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
}

interface ApiResponse {
    prices: {
        date: number; // Unix timestamp
        open?: number;
        close?: number;
        high?: number;
        low?: number;
        volume?: number;
    }[];
}

export const MySketch = () => (p: p5) => {
    const width = p.windowWidth;
    const height = p.windowHeight;
    let stockTickerInput: p5.Element;
    let isTickerInputClicked = false;
    let button: p5.Element;
    let rawData: any = {}; // Store the fetched data (all stock information)
    let processedData: any = {};
    let currentIndex: number; // Index for cycling through dates
    let loading = false;

    p.setup = () => {
        // Set up the canvas and UI elements
        p.createCanvas(width, height);
        p.frameRate(5);

        stockTickerInput = p.createInput();
        stockTickerInput.value('Stock Ticker');
        stockTickerInput.position(0, 400);
        stockTickerInput.style('color', 'white');
        stockTickerInput.style('background-color', 'black');
        stockTickerInput.style('border', '1px solid white');
        stockTickerInput.mousePressed(() => {
            if (!isTickerInputClicked) {
                stockTickerInput.value('');
                isTickerInputClicked = false;
            }
        });
        stockTickerInput.elt.onblur = () => {
            const inputValue = String(stockTickerInput.value());
            if (inputValue.trim() === '') {
                stockTickerInput.value('Stock Ticker');
                isTickerInputClicked = false;
            }
        };

        button = p.createButton('Submit');
        button.position(0, 600);
        button.mousePressed(() => {
            fetchStockPrice(String(stockTickerInput.value()));
        });
    };

    p.draw = () => {
        p.background(0);
        p.fill(255);

        if (loading) {
            p.text("Loading data...", p.width/2, p.height/2);
            return;
        }

        const radiusMax = 200;
        let radius = 0;

        // prix = radius
        // length = 

        if (currentIndex >= 0) {
            // Get the current data point
            const dataPoint = processedData[currentIndex];
      
            // Display the data
            p.text(`Date: ${dataPoint.date}`, p.width / 2, p.height / 2 - 160);
            p.text(`Open: ${dataPoint.open}`, p.width / 2, p.height / 2 - 140);
            p.text(`Close: ${dataPoint.close}`, p.width / 2, p.height / 2 - 120);

            radius = dataPoint.close;
      
            // Move to the next data point for the next second
            currentIndex--;
          } else if (processedData.length === 0) {
            p.text('No data available.', p.width / 2, p.height / 2 - 160);
          } else {
            // If we've displayed all data, reset or stop
            p.text("End of Data", p.width / 2, p.height / 2 - 160);
        }
        
        p.push();
        p.fill(0, 255, 0);
        p.circle(p.width/2, p.height/2, radiusMax);
        p.pop();

        p.push();
        p.fill(255, 0, 0);
        p.circle(p.width/2, p.height/2, radius);
        p.pop();
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    async function fetchStockPrice(stockTicker: string) {
        loading = true;
        try {
            const response = await fetch(`/api/stock?symbol=${stockTicker}`);
            rawData = await response.json();

            // Process the raw data
            processedData = rawData.prices
                .filter((entry: { open?: number; close?: number }) => 
                    entry.open !== undefined && entry.close !== undefined
                )
                .map((entry: { date: number; open: number; close: number; high?: number; low?: number; volume?: number }) => ({
                    date: new Date(entry.date * 1000).toLocaleDateString(),
                    open: entry.open as number,
                    close: entry.close as number,
                    high: entry.high as number,
                    low: entry.low as number,
                    volume: entry.volume as number,
                }))
                .sort((a: StockEntry, b: StockEntry) => new Date(b.date).getTime() - new Date(a.date).getTime());

            // Reset the index for drawing
            currentIndex = processedData.length - 1;
        } catch (error) {
            console.error('Error fetching stock price:', error);
        } finally {
            loading = false;
        }
    }
};

