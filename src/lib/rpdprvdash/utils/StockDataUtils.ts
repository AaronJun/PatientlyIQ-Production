// utils/StockDataUtils.ts

/**
 * Process raw stock data into a format grouped by company
 * @param rawStockData The raw stock data array
 * @returns An object with company names as keys and arrays of their stock data as values
 */
export function processStockData(rawStockData: any[]): Record<string, any[]> {
	if (!rawStockData || !Array.isArray(rawStockData)) {
	  return {};
	}
  
	const stockDataByCompany: Record<string, any[]> = {};
  
	// Group stock data by company
	rawStockData.forEach(item => {
	  if (!item.Company) return;
  
	  if (!stockDataByCompany[item.Company]) {
		stockDataByCompany[item.Company] = [];
	  }
  
	  stockDataByCompany[item.Company].push(item);
	});
  
	// Sort each company's data by date
	Object.keys(stockDataByCompany).forEach(company => {
	  stockDataByCompany[company].sort((a, b) => {
		const dateA = new Date(`${a.StockPriceYear}-${a.StockPriceMonth.padStart(2, '0')}-01`);
		const dateB = new Date(`${b.StockPriceYear}-${b.StockPriceMonth.padStart(2, '0')}-01`);
		return dateA.getTime() - dateB.getTime();
	  });
	});
  
	return stockDataByCompany;
  }
  
  /**
   * Generate mock stock data for a company when real data isn't available
   * @param company The company name
   * @param events Milestone events for the company
   * @returns An array of mock stock data points
   */
  export function generateMockStockData(company: string, events: any[] = []): any[] {
	const mockData = [];
	const startYear = 2015;
	const endYear = new Date().getFullYear();
	
	// Generate a base price that's somewhat unique to the company name
	const companySum = company.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
	let currentPrice = 20 + (companySum % 100); // Price between $20-$120
	
	// Extract significant event dates
	const eventDates = events
	  .filter(e => e["RPDD Year"] || e["PRV Issue Year"] || (e.Purchased === "Y" && e["Purchase Year"]))
	  .map(e => {
		const dates = [];
		if (e["RPDD Year"] && e["RPDD Month"]) {
		  dates.push(new Date(`${e["RPDD Year"]}-${e["RPDD Month"].padStart(2, '0')}-01`));
		}
		if (e["PRV Issue Year"] && e["PRV Issue Month"]) {
		  dates.push(new Date(`${e["PRV Issue Year"]}-${e["PRV Issue Month"].padStart(2, '0')}-01`));
		}
		if (e.Purchased === "Y" && e["Purchase Year"] && e["Purchase Month"]) {
		  dates.push(new Date(`${e["Purchase Year"]}-${e["Purchase Month"].padStart(2, '0')}-01`));
		}
		return dates;
	  })
	  .flat()
	  .sort((a, b) => a.getTime() - b.getTime());
	  
	// Generate monthly data points
	for (let year = startYear; year <= endYear; year++) {
	  for (let month = 1; month <= 12; month++) {
		// Stop if we're past the current month/year
		const now = new Date();
		if (year === endYear && month > now.getMonth() + 1) {
		  break;
		}
		
		const date = new Date(year, month - 1, 1); // Month is 0-indexed in JavaScript
		
		// Check if this date is near an event
		const isNearEvent = eventDates.some(eventDate => {
		  const eventMonth = eventDate.getMonth();
		  const eventYear = eventDate.getFullYear();
		  return month === eventMonth + 1 && year === eventYear;
		});
		
		// Generate monthly change with potential jumps near events
		let monthlyChange;
		if (isNearEvent) {
		  // Bigger movement near events, more likely to be positive
		  const direction = Math.random() > 0.3 ? 1 : -1;
		  monthlyChange = direction * (Math.random() * 15 + 5); // 5-20% change
		} else {
		  // Normal monthly fluctuation
		  monthlyChange = (Math.random() - 0.48) * 8; // -3.84% to +4.16% change with slight upward bias
		}
		
		// Apply the change
		currentPrice = Math.max(1, currentPrice * (1 + monthlyChange/100));
		
		mockData.push({
		  Company: company,
		  StockPriceMonth: month.toString(),
		  StockPriceYear: year.toString(),
		  "Close/Price": currentPrice.toFixed(2)
		});
	  }
	}
	
	return mockData;
  }