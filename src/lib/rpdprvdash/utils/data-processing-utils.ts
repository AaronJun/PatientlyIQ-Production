// Add a Set to track unique PRV entries
const processedPRVEntries = new Set<string>();

/**
 * Checks if an entry has a PRV award
 * @param entry The data entry to check
 * @returns True if the entry has a PRV award, false otherwise
 */
export function hasPRVAward(entry: any): boolean {
    if (!entry) return false;
    
    // Check if PRV Year is set to a specific year (not empty)
    const hasPRVYear = entry["PRV Year"] && entry["PRV Year"].trim() !== "";
    
    // Check if PRV Status is set to "PRV Awarded"
    const hasPRVStatus = entry["PRV Status"] === "PRV Awarded";
    
    // Return true only if BOTH conditions are met: PRV Status is "PRV Awarded" AND PRV Year is not empty
    return hasPRVStatus && hasPRVYear;
}

/**
 * Checks if an entry has a terminated or liquidated PRV status
 * @param entry The data entry to check
 * @returns True if the entry's PRV Status is "Terminated" or "Liquidated", false otherwise
 */
export function isPRVTerminatedOrLiquidated(entry: any): boolean {
    if (!entry) return false;
    
    // Check if PRV Status is set to "Terminated" or "Liquidated"
    return entry["PRV Status"] === "Terminated" || entry["PRV Status"] === "Liquidated";
}

/**
 * Determines the stage code from an entry
 */
export function getStage(entry: any): string {
    if (!entry) return "PRE";

    const entryId = `${entry.Company}-${entry.Candidate}`;
    let assignedStage = "PRE"; // Default stage

    // Only place in PRV stage if both PRV Status is "PRV Awarded" AND PRV Year is not empty
    if (entry["PRV Status"] === "PRV Awarded" && entry["PRV Year"] && entry["PRV Year"].trim() !== "") {
        // Log for debugging
        if (!processedPRVEntries.has(entryId)) {
            processedPRVEntries.add(entryId);
            console.log("PRV Awarded Entry:", {
                id: entryId,
                candidate: entry["Candidate"],
                company: entry["Company"],
                currentStage: entry["Current Development Stage"],
                prvYear: entry["PRV Year"],
                rpddYear: entry["RPDD Year"]
            });
        }
        return "PRV";
    }

    // Fallback to existing logic if not a valid PRV entry
    const stage = entry["Current Development Stage"];
    switch(stage) {
        case "Preclinical":
            assignedStage = "PRE";
            break;
        case "Phase 1":
        case "Phase 1/2":
            assignedStage = "P1";
            break;
        case "Phase 2":
        case "Phase 2a":
        case "Phase 2b":
            assignedStage = "P2";
            break;
        case "Phase 3":
            assignedStage = "P3";
            break;
        case "Filed":
            assignedStage = "FILED";
            break;
        case "Approved":
            assignedStage = "APRV";
            break;
        default:
            assignedStage = "PRE";
            break;
    }
    
    // For debugging RPDD entries - only log for verification
    if (entry["RPDD Year"] && !hasPRVAward(entry)) {
        console.log("RPDD Entry:", {
            id: entryId,
            candidate: entry["Candidate"],
            company: entry["Company"],
            currentStage: entry["Current Development Stage"],
            assignedStage: assignedStage,
            rpddYear: entry["RPDD Year"],
            hasPRV: hasPRVAward(entry) // Log whether it has a PRV award for verification
        });
    }
    
    return assignedStage;
}

// Maps for stage and company status codes
export const stageCodeMap: Record<string, string> = {
    'PRE': 'Preclinical',
    'P1': 'Phase 1',
    'P1/2': 'Phase 1/2',
    'P2': 'Phase 2',
    'P3': 'Phase 3',
    'FILED': 'Filed',
    'APRV': 'Approved',
    'PRV': 'PRV Awarded',
};

/**
 * Get the stage radii configuration
 */
export function getStageRadii(radius: number) {
    // Define the main stage circles
    const stageRadii = {
        'PRE': radius * 0.955,
        'P1': radius * 0.845,
        'P2': radius * 0.7125,
        'P3': radius * 0.5725,
        'FILED': radius * 0.4325,
        'PRV': radius * 0.255,
    };
    
    // Define midpoints between stages for drug node placement
    const midpoints = {
        'PRE_MID': (stageRadii.PRE + stageRadii.P1) / 2,
        'P1_MID': (stageRadii.P1 + stageRadii.P2) / 2,
        'P2_MID': (stageRadii.P2 + stageRadii.P3) / 2,
        'P3_MID': (stageRadii.P3 + stageRadii.FILED) / 2,
        'FILED_MID': (stageRadii.FILED + stageRadii.PRV) / 2,
        'PRV_MID': stageRadii.PRV * 0.6, // Special case for PRV - place at 60% of PRV radius
    };
    
    // Return only the main stage radii, not the midpoints
    return stageRadii;
}

/**
 * Gets the full stage name from a stage code
 */
export function getStageFullName(stageCode: string): string {
    return stageCodeMap[stageCode] || stageCode;
}

/**
 * Format company names by removing industry terms
 */
export function formatCompanyName(companyName: string): string {
    if (!companyName) return '';
    
    const phrasesToRemove = [
        'Life Sciences', 'Life Science', 'Pharmaceuticals', 'Biotechnology',
        'Therapeutics', 'Sciences', 'Biometrics', 'Partners', 'Science', 'Biologics', 'Gene Therapies',
        'Pharma', 'Biotech', 'Genetic', 'Bio', 'Biosciences', 'Biotechnologies'
    ];
    
    let formattedName = companyName;
    
    phrasesToRemove.forEach(phrase => {
        const pattern = new RegExp(`\\b${phrase}\\b`, 'gi');
        formattedName = formattedName.replace(pattern, '');
    });
    
    // Clean up formatting
    formattedName = formattedName.replace(/\s+/g, ' ').trim()
        .replace(/,\s*$/, '').replace(/^\s*,/, '')
        .replace(/,\s*,/g, ',');
    
    // Return original if nothing meaningful remains
    if (!formattedName.trim() || formattedName.trim().match(/^[,.\s-]+$/)) {
        return companyName;
    }
    
    // Fix formatting inconsistencies
    formattedName = formattedName
        .replace(/^\s*[,.-]\s*/, '').replace(/\s*[,.-]\s*$/, '')
        .replace(/\s*,\s*Inc\.?$/i, '')
        .replace(/\s*,\s*LLC\.?$/i, '')
        .replace(/\s*,\s*Ltd\.?$/i, '')
        .replace(/\s*,\s*Corporation\.?$/i, '');
    
    return formattedName;
}

/**
 * Calculate angles for each company based on their proportion of total drugs
 */
export function calculateCompanyAngles(companies: any[], angleBuffer: number) {
    const totalDrugs = companies.reduce((sum, company) => sum + company.totalDrugs, 0);
    let currentAngle = 0;
    const angles = new Map();

    companies.forEach(company => {
        const proportion = company.totalDrugs / totalDrugs;
        const angle = proportion * (2 * Math.PI - (companies.length * angleBuffer));
        angles.set(company.company, {
            start: currentAngle,
            end: currentAngle + angle,
            center: currentAngle + angle/2
        });
        currentAngle += angle + angleBuffer;
    });

    return angles;
}

/**
 * Calculate optimal label placement for companies to avoid overlaps
 * and align with connecting line angles
 */
export function calculateOptimalLabelPlacement(companies: any[], companyAngles: Map<string, any>, labelConfig: any) {
    const labels: any[] = [];
    const labelHeight = labelConfig.textHeight;
    const minDistanceBetweenLabels = labelHeight * 2.5; // Minimum spacing between labels
    const isAlternatingLabels = companies.length > 80;

    companies.forEach((company, index) => {
        const angle = companyAngles.get(company.company);
        if (!angle) return;
        
        const centerAngle = angle.center - Math.PI/2; // Adjust for SVG coordinate system
        
        // Determine if label should be on left or right side
        const isRightSide = Math.cos(centerAngle) > 0;
        
        // Calculate initial radius based on angle and whether we're alternating positions
        const shouldPositionCloser = isAlternatingLabels && (index % 2 === 0);
        let baseRadius = shouldPositionCloser ? labelConfig.minRadius : labelConfig.alternateRadius;
        
        // Find a position that doesn't overlap with existing labels
        let currentRadius = baseRadius;
        let overlap = true;
        let attempts = 0;
        const maxAttempts = 10; // Limit attempts to find non-overlapping position
        
        while (overlap && attempts < maxAttempts) {
            // Calculate position based on angle and current radius
            const x = currentRadius * Math.cos(centerAngle);
            const y = currentRadius * Math.sin(centerAngle);
            
            // Check for overlaps with existing labels
            overlap = labels.some(label => {
                const dx = x - label.x;
                const dy = y - label.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance < minDistanceBetweenLabels;
            });
            
            if (!overlap) {
                labels.push({
                    company: company.company,
                    x,
                    y,
                    angle: centerAngle,
                    isRightSide,
                    isCloserPosition: shouldPositionCloser
                });
                break;
            }
            
            // Try a slightly different radius if there's overlap
            currentRadius += labelConfig.padding;
            attempts++;
        }
        
        // If we couldn't find a non-overlapping position, add it anyway at the maximum radius
        if (overlap) {
            const x = labelConfig.maxRadius * Math.cos(centerAngle);
            const y = labelConfig.maxRadius * Math.sin(centerAngle);
            
            labels.push({
                company: company.company,
                x,
                y,
                angle: centerAngle,
                isRightSide,
                isCloserPosition: shouldPositionCloser
            });
        }
    });

    return labels;
}

/**
 * Process data for the radial layout visualization
 */
export function processDataForLayout(data: any[]) {
    console.log("Starting data processing with", data.length, "entries");
    
    // Log PRV entries with more information for verification
    const prvEntries = data.filter(entry => 
        hasPRVAward(entry)
    );
    
    if (prvEntries.length > 0) {
        console.log("PRV entries:", prvEntries.length);
        console.log("PRV entries sample:", prvEntries.slice(0, 5).map(entry => ({
            candidate: entry["Candidate"],
            company: entry["Company"],
            currentStage: entry["Current Development Stage"],
            prvYear: entry["PRV Year"],
            prvStatus: entry["PRV Status"],
        })));
    }
    
    const companiesMap = new Map();
    const processedStages = new Map(); // Track entries by stage
    
    data.forEach((entry) => {
        const companyName = entry.Company;
        if (!companyName) return; // Skip entries without company name
        
        if (!companiesMap.has(companyName)) {
            companiesMap.set(companyName, {
                company: companyName,
                status: entry['Public/Private'] || 'Private',
                stages: new Map(),
                totalDrugs: 0,
                entries: [],
                clinicalTrials: 0,
                vouchersAwarded: 0,
                transactedVouchers: 0,
                uniqueIndications: new Set(),
                uniqueAreas: new Set()
            });
        }
        
        const companyData = companiesMap.get(companyName);
        
        // Use the updated getStage function which prioritizes PRV Year
        const stage = getStage(entry);
        
        // Track all entries by stage
        if (!processedStages.has(stage)) {
            processedStages.set(stage, []);
        }
        
        // Add more detailed information for debugging
        processedStages.get(stage).push({
            candidate: entry["Candidate"],
            company: companyName,
            stage: stage,
            prvYear: entry["PRV Year"],
            prvStatus: entry["PRV Status"],
            rpddYear: entry["RPDD Year"],
            hasPRV: hasPRVAward(entry)
        });
        
        if (!companyData.stages.has(stage)) {
            companyData.stages.set(stage, []);
        }
        
        companyData.stages.get(stage).push(entry);
        companyData.entries.push(entry);
        companyData.totalDrugs++;
        
        // Track indications and therapeutic areas
        if (entry.Indication) {
            companyData.uniqueIndications.add(entry.Indication);
        }
        if (entry.TherapeuticArea1) {
            companyData.uniqueAreas.add(entry.TherapeuticArea1);
        }
        
        // Count clinical trials (Phase 1-3)
        const clinicalStages = ["P1", "P1/2", "P2", "P3"];
        if (clinicalStages.includes(stage)) {
            companyData.clinicalTrials++;
        }
        
        // Count vouchers awarded using the updated hasPRVAward function
        if (hasPRVAward(entry)) {
            companyData.vouchersAwarded++;
        }
        
        // Count transacted vouchers
        if (entry["Purchase Year"]) {
            companyData.transactedVouchers++;
        }
    });
    
    // Log summary of entries by stage
    console.log("Entries by stage:", Object.fromEntries(
        Array.from(processedStages.entries()).map(([stage, entries]) => [
            stage,
            entries.length
        ])
    ));
    
    // Log specific PRV stage entries with detailed information
    console.log("PRV stage entries:", processedStages.get("PRV"));
    
    return Array.from(companiesMap.values())
        .sort((a, b) => a.company.localeCompare(b.company));
}

/**
 * Get the configuration object for visualization sizing based on view mode
 */
export function getSizeConfig(isAllYearView: boolean) {
    return {
        // When all years view is active, use smaller sizes
        labelFontSize: isAllYearView ? "6.425px" : "7.725px",
        labelFontWeight: isAllYearView ? "400" : "400",
        companyNodeWidth: isAllYearView ? 4.25 : 7.725,
        companyNodeHeight: isAllYearView ? 4.25 : 7.725,
        drugNodeRadius: isAllYearView ? 2.7125 : 6.125,
        drugNodeStrokeWidth: isAllYearView ? .925 : 1.5125,
        prvIndicatorRadius: isAllYearView ? 9 : 11.25,
        dotSize: isAllYearView ? 0 : 0,
        dotSpacing: isAllYearView ? 0 : 0,
        connectionStrokeWidth: isAllYearView ? 0.25 : 0.7625,
        connectionOpacity: isAllYearView ? 0.4025 : 0.325,
        highlightedNodeRadius: isAllYearView ? 8 : 10.25, 
        highlightedNodePosition: isAllYearView ? 1.25 : 1.25,
        // New optimized settings for all year view
        useShadowEffects: !isAllYearView, // Disable shadow effects in all year view
        useAnimations: !isAllYearView, // Disable animations in all year view
        transitionDuration: isAllYearView ? 0 : 200, // No transitions in all year view
        renderPRVIndicators: !isAllYearView, // Only render PRV indicators in regular view
        simplifiedConnections: isAllYearView, // Use simplified connections in all year view
    };
}

/**
 * Get the label configuration object based on view mode and radius
 */
export function getLabelConfig(radius: number, isAllYearView: boolean) {
    return {
        minRadius: radius * 1.0125, // Position closest to the outermost circle
        maxRadius: radius * 1.10, // Maximum radius for labels
        alternateRadius: radius * 1.15, // Alternate position for better legibility with many entries
        padding: 10.25,
        minAngleDiff: Math.PI / 30, // Minimum angle between labels
        textHeight: 10,
        maxDotsPerRow: 0, // For pipeline dots
        dotRowHeight: 0 // For pipeline dots
    };
}

/**
 * Get the stage label configuration
 */
export function getStageLabelConfig() {
    return {
        padding: { x: 10, y: 1 },
        height: 10,
        cornerRadius: 10
    };
}

export function processDataForTherapeuticAreas(data: any[]) {
    const areasMap = new Map();
    
    data.forEach(entry => {
        const stage = getStage(entry);
        const area = entry.TherapeuticArea1;
        
        if (!areasMap.has(area)) {
            areasMap.set(area, {
                company: area, // Use 'company' key for compatibility with calculateCompanyAngles
                area,
                stages: new Map(),
                totalDrugs: 0,
                entries: [],
                uniqueCompanies: new Set(),
                uniqueCandidates: new Set(),
                clinicalTrials: 0,
                vouchersAwarded: 0,
                transactedVouchers: 0,  // Add counter for transacted vouchers
                indications: new Set()
            });
        }
        
        const areaData = areasMap.get(area);
        if (!areaData.stages.has(stage)) {
            areaData.stages.set(stage, []);
        }
        
        areaData.stages.get(stage).push(entry);
        areaData.entries.push(entry);
        areaData.totalDrugs++;
        
        // Track unique companies and candidates
        if (entry.Company) {
            areaData.uniqueCompanies.add(entry.Company);
        }
        if (entry.Candidate) {
            areaData.uniqueCandidates.add(entry.Candidate);
        }
        if (entry.Indication) {
            areaData.indications.add(entry.Indication);
        }
        
        // Count clinical trials (Phase 1-3)
        const clinicalStages = ["P1", "P1/2", "P2", "P3"];
        if (clinicalStages.includes(stage)) {
            areaData.clinicalTrials++;
        }
        
        // Count vouchers awarded
        if (stage === "PRV" || entry["PRV Year"] || entry["PRV Year"]) {
            areaData.vouchersAwarded++;
        }
        
        // Count transacted vouchers
        if (entry["Purchase Year"]) {
            areaData.transactedVouchers++;
        }
    });

    // Return as array sorted by total drugs
    return Array.from(areasMap.values())
        .sort((a, b) => b.totalDrugs - a.totalDrugs);
}

/**
 * Returns an object with counts for various metrics by therapeutic area
 */
export function getAreaStatistics(data: any[]) {
    const areas = processDataForTherapeuticAreas(data);
    
    return areas.map(area => {
        // Create stages object with counts
        const stages: Record<string, number> = {};
        area.stages.forEach((drugs: any[], stage: string) => {
            stages[stage] = drugs.length;
        });
        
        return {
            name: area.area,
            totalDrugs: area.totalDrugs,
            companies: area.uniqueCompanies.size,
            candidates: area.uniqueCandidates.size,
            indications: area.indications.size,
            clinicalTrials: area.clinicalTrials,
            vouchersAwarded: area.vouchersAwarded,
            transactedVouchers: area.transactedVouchers,
            stages
        };
    });
}

/**
 * Creates an area label group with text and dots representing drugs
 * This is a D3 helper function with text aligned to the connecting line angle
 */
export function createAreaLabelGroup(
    group: any, 
    area: any, 
    labelPlacement: any,
    sizeConfig: any,
    labelConfig: any,
    maxLabelWidth: number = 85,
    areaColors: any
) {
    // Determine if label is on right or left side
    const isRightSide = labelPlacement.isRightSide;
    
    // Create a rotated group to align with connecting line
    const labelGroup = group.append("g")
        .attr("class", "area-label-text");
        
    // Calculate rotation angle to align with connecting line
    // Convert radians to degrees and adjust by 90 degrees for text orientation
    const rotationAngle = (labelPlacement.angle * 180 / Math.PI) + (isRightSide ? 0 : 180);
    
    // Apply rotation transform
    labelGroup.attr("transform", `rotate(${rotationAngle})`);
    
    // Determine text anchor and offset based on side
    const textAnchor = isRightSide ? "start" : "end";
    const xOffset = isRightSide ? 10 : -10; // Reduced offset to bring labels closer    
    
    // Create text element with area name and counter-rotate to keep text horizontal
    const textElement = labelGroup.append("text")
        .attr("text-anchor", textAnchor)
        .attr("dx", xOffset)
        .attr("dy", "0.35em")
        // Counter-rotate the text to keep it horizontal while the group is rotated
        .attr("transform", `rotate(${-rotationAngle})`)
        .text(truncateText(area.area, maxLabelWidth))
        .attr("fill", "#4A5568")
        .attr("font-size", sizeConfig.labelFontSize)
        .attr("font-weight", sizeConfig.labelFontWeight);
    
    // Create dots group with counter-rotation
    const dotsGroup = labelGroup.append("g")
        .attr("class", "area-drugs")
        .attr("transform", `rotate(${-rotationAngle}) translate(${xOffset}, ${labelConfig.textHeight})`);
    
    const numDots = Math.min(area.totalDrugs, 20); // Limit dots for visual clarity
    const dotsPerRow = Math.min(10, numDots);  // Maximum 10 dots per row
    
    for (let i = 0; i < numDots; i++) {
        const row = Math.floor(i / dotsPerRow);
        const col = i % dotsPerRow;
        const x = textAnchor === "start" ? col * 6 : -(col * 6);
        
        dotsGroup.append("circle")
            .attr("r", 0)
            .attr("cx", x + (textAnchor === "start" ? 3 : -3))
            .attr("cy", row * 5)  // 5px spacing between rows
            .attr("fill", areaColors.fill)
            .attr("stroke", areaColors.stroke)
            .attr("stroke-width", 0.5)
            .attr("opacity", 0.8);
    }
    
    return { labelGroup, textElement, dotsGroup };
}

/**
 * Truncates text to fit within maximum width
 */
export function truncateText(text: string, maxWidth: number) {
    if (!text) return '';
    if (text.length <= maxWidth / 4) return text;
    return text.slice(0, Math.floor(maxWidth / 8) - 3) + '...';
}

/**
 * Creates a company label group with text and dots representing drugs
 * @param group - D3 selection for the parent group
 * @param company - Company data object
 * @param labelPlacement - Label placement information
 * @param labelConfig - Configuration for label styling
 */
export function createLabelGroup(
    group: d3.Selection<SVGGElement, unknown, null, undefined>, 
    company: any, 
    labelPlacement: any,
    labelConfig: any
) {
    // Determine text anchor based on side
    const textAnchor = labelPlacement.isRightSide ? "start" : "end";
    const xOffset = labelPlacement.isRightSide ? 15 : -15;
    
    // Create a group at the label position
    const labelGroup = group.append("g")
        .attr("transform", `translate(${labelPlacement.x}, ${labelPlacement.y})`)
        .attr("alignment-baseline", "middle")
        .attr("text-anchor", textAnchor)
        .attr("cursor", "pointer")
        .attr("class", "company-label")
        .attr("id", `company-label-${company.company.replace(/\s+/g, '-').toLowerCase()}`);
    
    // Create text element with formatted company name
    const textElement = labelGroup.append("text")
        .attr("text-anchor", textAnchor)
        .attr("dx", xOffset)
        .attr("dy", "0.35em")
        .text(formatCompanyName(company.company))
        .attr("fill", "#4A5568")
        .attr("font-size", "6.25px")
        .attr("font-weight", "400");
    
    return { 
        group: labelGroup,
        textElement
    };
}

/**
 * Samples data for the all year view to reduce rendering load
 * @param data The full dataset
 * @param maxCompanies Maximum number of companies to include (prioritizes those with more drugs)
 * @param maxDrugsPerCompany Maximum number of drugs to show per company
 * @returns Sampled dataset for lighter rendering
 */
export function sampleDataForAllYearView(data: any[], maxCompanies: number = 100, maxDrugsPerCompany: number = 5): any[] {
    // First process the data to get company information
    const companies = processDataForLayout(data);
    
    // Sort companies by total drugs (descending) and take top N
    const topCompanies = companies
        .sort((a, b) => b.totalDrugs - a.totalDrugs)
        .slice(0, maxCompanies)
        .map(company => company.company);
    
    // Create a set for faster lookups
    const topCompanySet = new Set(topCompanies);
    
    // Filter and sample the data
    const sampledData: any[] = [];
    const companyDrugCounts: Record<string, number> = {};
    
    // Initialize drug counts for each company
    topCompanies.forEach(company => {
        companyDrugCounts[company] = 0;
    });
    
    // Prioritize PRV entries first
    const prvEntries = data.filter(entry => hasPRVAward(entry) && topCompanySet.has(entry.Company));
    prvEntries.forEach(entry => {
        const company = entry.Company;
        if (companyDrugCounts[company] < maxDrugsPerCompany) {
            sampledData.push(entry);
            companyDrugCounts[company]++;
        }
    });
    
    // Then add other entries until we reach the limit for each company
    data.forEach(entry => {
        const company = entry.Company;
        
        // Skip if not in top companies or already at max drugs for this company
        if (!topCompanySet.has(company) || companyDrugCounts[company] >= maxDrugsPerCompany) {
            return;
        }
        
        // Skip if it's a PRV entry (already added)
        if (hasPRVAward(entry)) {
            return;
        }
        
        sampledData.push(entry);
        companyDrugCounts[company]++;
    });
    
    console.log(`Sampled data: ${sampledData.length} entries from original ${data.length} entries`);
    return sampledData;
}