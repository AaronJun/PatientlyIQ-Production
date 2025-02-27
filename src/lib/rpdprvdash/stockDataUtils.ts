// stockDataUtils.ts

/**
 * Cleans a numeric string by removing '$', commas, and spaces
 * @param str The string to clean
 * @returns Parsed numeric value
 */
export function cleanNumericString(str: string): number {
    if (typeof str === 'number') return str;
    return parseFloat(str.replace(/[$,\s]/g, ''));
  }
  
  /**
   * Parses a date string in MM/DD/YY or MM/DD/YYYY format
   * @param dateStr The date string to parse
   * @returns JavaScript Date object
   */
  export function parseStockDateString(dateStr: string): Date {
    // Split the date string by '/'
    const parts = dateStr.split('/');
    
    if (parts.length !== 3) {
      throw new Error(`Invalid date format: ${dateStr}. Expected MM/DD/YY or MM/DD/YYYY`);
    }
    
    const month = parseInt(parts[0]) - 1; // JavaScript months are 0-indexed
    const day = parseInt(parts[1]);
    let year = parseInt(parts[2]);
    
    // Handle 2-digit years
    if (year < 100) {
      // Assume 20xx for years less than 50, 19xx for years 50+
      year = year < 50 ? 2000 + year : 1900 + year;
    }
    
    return new Date(year, month, day);
  }
  
  /**
   * Formats a stock price object from the API format to the chart-friendly format
   * @param stockData Array of stock price objects from API
   * @param companyName Name of the company to filter by
   * @returns Array of formatted stock price objects
   */
  export function formatStockData(stockData: any[], companyName: string): { date: Date, price: number }[] {
    return stockData
      .filter(item => item.Company === companyName)
      .map(item => ({
        date: parseStockDateString(item.Date),
        price: cleanNumericString(item["Close/Last"])
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  /**
   * Groups stock data by month for reduced data points
   * @param stockData Array of daily stock data
   * @returns Array of monthly averaged stock data
   */
  export function aggregateStockDataByMonth(stockData: { date: Date, price: number }[]): { date: Date, price: number }[] {
    const monthlyData = new Map<string, { sum: number, count: number, firstDate: Date }>();
    
    // Group by year and month
    stockData.forEach(item => {
      const year = item.date.getFullYear();
      const month = item.date.getMonth();
      const key = `${year}-${month}`;
      
      if (!monthlyData.has(key)) {
        monthlyData.set(key, { sum: 0, count: 0, firstDate: new Date(item.date) });
      }
      
      const entry = monthlyData.get(key);
      entry.sum += item.price;
      entry.count += 1;
    });
    
    // Calculate monthly averages
    return Array.from(monthlyData.entries()).map(([key, data]) => ({
      date: data.firstDate, // Use the first date of the month
      price: data.sum / data.count // Average price for the month
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  /**
   * Finds key statistics about stock data (min, max, avg)
   * @param stockData Array of stock price objects
   * @returns Statistics object
   */
  export function calculateStockStats(stockData: { date: Date, price: number }[]): {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    periodReturn: number;
    volatility: number;
  } {
    if (!stockData || stockData.length === 0) {
      return { minPrice: 0, maxPrice: 0, avgPrice: 0, periodReturn: 0, volatility: 0 };
    }
    
    const prices = stockData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    // Calculate period return (first to last)
    const firstPrice = stockData[0].price;
    const lastPrice = stockData[stockData.length - 1].price;
    const periodReturn = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    // Calculate volatility (standard deviation)
    const squaredDiffs = prices.map(price => Math.pow(price - avgPrice, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / prices.length;
    const volatility = Math.sqrt(variance);
    
    return {
      minPrice,
      maxPrice,
      avgPrice,
      periodReturn,
      volatility
    };
  }
  
  /**
   * Finds closest stock price to a target date
   * @param stockData Array of stock price objects
   * @param targetDate Target date to find closest stock price for
   * @returns Closest stock price object or null if no data
   */
  export function findClosestStockPrice(stockData: { date: Date, price: number }[], targetDate: Date): 
    { date: Date, price: number } | null {
    if (!stockData || stockData.length === 0) return null;
    
    const sortedByDateDiff = [...stockData].sort((a, b) => {
      const diffA = Math.abs(a.date.getTime() - targetDate.getTime());
      const diffB = Math.abs(b.date.getTime() - targetDate.getTime());
      return diffA - diffB;
    });
    
    return sortedByDateDiff[0];
  }