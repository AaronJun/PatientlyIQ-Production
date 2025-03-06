/**
 * Utility functions for handling regulatory timeline data
 */

/**
 * Process drug data into timeline events
 * @param {Object} data - Drug data object
 * @param {Object} eventColors - Mapping of event types to colors
 * @returns {Array} Array of formatted timeline events
 */
export function processTimelineData(data, eventColors = defaultEventColors) {
    if (!data) return [];
    
    let events = [];
    
    // Add regulatory milestone events
    const milestones = {
      "ODD granted": data["ODD granted"],
      "IND submission": data["IND submission "],
      "FTD granted": data["FTD granted"],
      "RPDD granted": data["RPDD granted"],
      "BLA submission": data["BLA submission"]
    };
  
    // Add all milestone events that have dates
    Object.entries(milestones).forEach(([label, date]) => {
      if (date && date.trim() !== "" && date !== "#N/A") {
        // Get color for the event
        const color = eventColors[label] || "#37587e";
        
        // Parse different date formats
        let formattedDate = date;
        if (date.includes('/')) {
          // Handle formats like "9/5/08"
          let [month, day, year] = date.split('/');
          
          // Add century prefix to 2-digit year if needed
          if (year && year.length === 2) {
            year = year < '50' ? `20${year}` : `19${year}`;
          }
          
          formattedDate = `${month}-${day}-${year}`;
        }
        
        events.push({
          label,
          date: formattedDate,
          color
        });
      }
    });
  
    // Add RPDD Month-Date-Year if provided
    if (data["RPDD Month"] && data["RPDD Year"]) {
      const rpddDate = `${data["RPDD Month"]}-${data["RPDD Date"] || "1"}-${data["RPDD Year"]}`;
      events.push({
        label: "RPDD Date",
        date: rpddDate,
        color: eventColors["RPDD Date"]
      });
    }
  
    // Add PRV Month-Date-Year if provided
    if (data["PRV Month"] && data["PRV Year"]) {
      const prvDate = `${data["PRV Month"]}-${data["Date"] || "1"}-${data["PRV Year"]}`;
      events.push({
        label: "PRV Awarded",
        date: prvDate,
        color: eventColors["PRV Awarded"]
      });
    }
  
    // Add PRV Transaction if available
    if (data["Purchase Month"] && data["Purchase Year"]) {
      const transactionDate = `${data["Purchase Month"]}-${data["Purchase Date"] || "1"}-${data["Purchase Year"]}`;
      events.push({
        label: "PRV Transaction",
        date: transactionDate,
        color: eventColors["PRV Transaction"]
      });
    }
  
    // Format dates and sort chronologically
    return events
      .filter(event => event.date && event.date.trim() !== "" && event.date !== "#N/A")
      .map(event => {
        try {
          const [month, day, year] = event.date.split("-").map(part => part.trim());
          
          // Handle 2-digit years
          let fullYear = year;
          if (year && year.length === 2) {
            fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
          }
          
          const dateObj = new Date(`${month}/${day}/${fullYear}`);
          
          if (isNaN(dateObj.getTime())) {
            console.warn(`Invalid date for ${event.label}: ${event.date}`);
            return null;
          }
          
          return {
            ...event,
            dateObj,
            formattedDate: `${month}/${day}/${fullYear}`,
            rawDate: event.date
          };
        } catch (e) {
          console.warn(`Error parsing date for ${event.label}: ${event.date}`, e);
          return null;
        }
      })
      .filter(event => event !== null)
      .sort((a, b) => a.dateObj - b.dateObj);
  }
  
  /**
   * Format a date string to a more readable format
   * @param {string} dateStr - Date string in format "MM-DD-YYYY"
   * @returns {string} Formatted date
   */
  export function formatDateString(dateStr) {
    if (!dateStr) return '';
    
    try {
      const [month, day, year] = dateStr.split('-').map(part => part.trim());
      const date = new Date(`${month}/${day}/${year}`);
      
      if (isNaN(date.getTime())) {
        return dateStr; // Return original if parsing fails
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr; // Return original on error
    }
  }
  
  /**
   * Default event colors for regulatory timeline
   */
  export const defaultEventColors = {
    "ODD granted": "#4285F4",      // Blue
    "IND submission": "#34A853",   // Green
    "FTD granted": "#FBBC05",      // Yellow
    "RPDD granted": "#EA4335",     // Red
    "RPDD Date": "#EA4335",        // Red
    "PRV Date": "#9C27B0",         // Purple
    "PRV Awarded": "#9C27B0",      // Purple
    "BLA submission": "#FF6D00",   // Orange
    "PRV Transaction": "#1CD819"   // Green
  };