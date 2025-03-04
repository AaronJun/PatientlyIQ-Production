// Data processing utilities for regulatory timeline

/**
 * Process raw data into formatted timeline events
 * @param {Object} data - Raw drug candidate data
 * @param {Object} eventColors - Color mapping for event types
 * @returns {Array} Formatted and sorted timeline events
 */
export function processTimelineData(data, eventColors) {
    const events = [];
    
    // Add regulatory milestone events
    const milestones = {
      "ODD": { label: "ODD granted", date: data["ODD granted"] },
      "IND": { label: "IND submission", date: data["IND submission "] },
      "FTD": { label: "FTD granted", date: data["FTD granted"] },
      "RPDD": { label: "RPDD granted", date: data["RPDD granted"] },
      "BLA": { label: "BLA submission", date: data["BLA submission"] }
    };
  
    // Add all milestone events that have dates
    Object.entries(milestones).forEach(([id, info]) => {
      if (info.date && info.date.trim() !== "") {
        events.push({
          id,
          label: info.label,
          date: info.date,
          color: eventColors[id]
        });
      }
    });
  
    // Add RPDD Month-Date-Year if provided
    if (data["RPDD Month"] && data["RPDD Date"] && data["RPDD Year"]) {
      const rpddDate = `${data["RPDD Month"]}-${data["RPDD Date"]}-${data["RPDD Year"]}`;
      events.push({
        id: "RPDD_MDY",
        label: "RPDD Month-Date-Year",
        date: rpddDate,
        color: eventColors["RPDD_MDY"]
      });
    }
  
    // Add PRV Month-Date-Year if provided
    if (data["PRV Month"] && data["Date"] && data["PRV Year"]) {
      const prvDate = `${data["PRV Month"]}-${data["Date"]}-${data["PRV Year"]}`;
      events.push({
        id: "PRV_MDY",
        label: "PRV Month-Date-Year",
        date: prvDate,
        color: eventColors["PRV_MDY"]
      });
    }
  
    // Format dates and sort chronologically
    return events
      .filter(event => event.date && event.date.trim() !== "")
      .map(event => {
        const [month, day, year] = event.date.split("-").map(part => part.trim());
        const dateObj = new Date(`${month}/${day}/${year}`);
        return {
          ...event,
          dateObj,
          formattedDate: `${month}/${day}/${year}`
        };
      })
      .sort((a, b) => a.dateObj - b.dateObj);
  }
  
  /**
   * Format a date string for display
   * @param {string} dateStr - Date string in "M-D-YYYY" format
   * @returns {string} Formatted date string
   */
  export function formatDate(dateStr) {
    if (!dateStr) return '';
    
    const [month, day, year] = dateStr.split("-").map(part => part.trim());
    return `${month}/${day}/${year}`;
  }
  
  /**
   * Calculate time span between first and last events in days
   * @param {Array} events - Sorted timeline events
   * @returns {number} Time span in days
   */
  export function calculateTimeSpan(events) {
    if (!events || events.length < 2) return 0;
    
    const firstDate = events[0].dateObj;
    const lastDate = events[events.length - 1].dateObj;
    return Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Default color scheme for regulatory events
   */
  export const defaultEventColors = {
    ODD: "#4285F4",     // Blue
    IND: "#34A853",     // Green
    FTD: "#FBBC05",     // Yellow
    RPDD: "#EA4335",    // Red
    RPDD_MDY: "#EA4335", // Red
    PRV_MDY: "#9C27B0", // Purple
    BLA: "#FF6D00"      // Orange
  };