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

    // First check if this is a transacted voucher (has Purchase Year)
    // For transacted vouchers, always place in TRANS stage regardless of year
    if (entry["Purchase Year"] && entry["Purchase Year"].trim() !== "") {
        // Log for debugging
        if (!processedPRVEntries.has(`trans-${entryId}`)) {
            processedPRVEntries.add(`trans-${entryId}`);
            console.log("Transacted Voucher Entry:", {
                id: entryId,
                candidate: entry["Candidate"],
                company: entry["Company"],
                currentStage: entry["Current Development Stage"],
                prvYear: entry["PRV Year"],
                purchaseYear: entry["Purchase Year"]
            });
        }
        return "TRANS";
    }

    // Then check for PRV awarded
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
    'TRANS': 'Transacted Voucher',
};

/**
 * Gets the full stage name from a stage code
 */
export function getStageFullName(stageCode: string): string {
    return stageCodeMap[stageCode] || stageCode;
}

/**
 * Gets a simplified stage name for display
 */
export function getStageDisplayName(stageCode: string): string {
    switch(stageCode) {
        case 'PRE': return 'Preclinical';
        case 'P1': return 'Phase 1';
        case 'P2': return 'Phase 2';
        case 'P3': return 'Phase 3';
        case 'FILED': return 'Filed';
        case 'PRV': return 'PRV';
        case 'APRV': return 'Approved';
        case 'TRANS': return 'Transacted';
        default: return stageCode;
    }
}

/**
 * Get the stage radii based on radius
 */
export function getStageRadii(radius: number, isAllYearView: boolean = false) {
    // Define the main stage circles with proportions optimized for different views
    const stageRadii = isAllYearView ? 
        // All-year view: optimize space distribution to show more data
        {
            'PRE': radius * 1.325,    // Larger outer ring for more space
            'P1': radius * 0.95,      // Increase the space between rings
            'P2': radius * 0.825,     // for better visualization of more data
            'P3': radius * 0.745,      
            'FILED': radius * 0.5125,  
            'PRV': radius * 0.4925,     
            'TRANS': radius * 0.3925,  // Increase innermost ring for transacted vouchers
        } : 
        // Single-year view: original proportions
        {
            'PRE': radius * 1.125,
            'P1': radius * 0.8725,
            'P2': radius * 0.7725,
            'P3': radius * 0.6525,
            'FILED': radius * 0.4325,
            'PRV': radius * 0.325,
            'TRANS': radius * 0.14275,
        };
    
    // Define midpoints between stages for drug node placement
    // For all-year view, create two sets of midpoints for staggered placement
    if (isAllYearView) {
        // Create primary and secondary midpoints for staggered drug placement
        const midpoints = {
            // Primary midpoints (closer to outer ring)
            'PRE_MID': (stageRadii.PRE + stageRadii.P1) / 2 * 1.05,
            'P1_MID': (stageRadii.P1 + stageRadii.P2) / 2 * 1.04,
            'P2_MID': (stageRadii.P2 + stageRadii.P3) / 2 * 1.04,
            'P3_MID': (stageRadii.P3 + stageRadii.FILED) / 2 * 1.04,
            'FILED_MID': (stageRadii.FILED + stageRadii.PRV) / 2 * 1.04,
            'PRV_MID': (stageRadii.PRV + stageRadii.TRANS) / 2 * 1.2,
            'TRANS_MID': stageRadii.TRANS * 0.6,
            
            // Secondary midpoints (closer to inner ring) - for staggered placement
            'PRE_MID2': (stageRadii.PRE + stageRadii.P1) / 2 * 1,
            'P1_MID2': (stageRadii.P1 + stageRadii.P2) / 2 * 0.96,
            'P2_MID2': (stageRadii.P2 + stageRadii.P3) / 2 * 0.96,
            'P3_MID2': (stageRadii.P3 + stageRadii.FILED) / 2 * 0.96,
            'FILED_MID2': (stageRadii.FILED + stageRadii.PRV) / 2 * 0.96,
            'PRV_MID2': (stageRadii.PRV + stageRadii.TRANS) / 2 * 0.96,
            'TRANS_MID2': stageRadii.TRANS * .75,
        };
        
        // Add midpoints to the returned object for all-year view
        return {
            ...stageRadii,
            ...midpoints
        };
    } else {
        // Standard midpoints for single-year view
        const midpoints = {
            'PRE_MID': (stageRadii.PRE + stageRadii.P1) / 1.25,
            'P1_MID': (stageRadii.P1 + stageRadii.P2) / 1.25,
            'P2_MID': (stageRadii.P2 + stageRadii.P3) / 1.25,
            'P3_MID': (stageRadii.P3 + stageRadii.FILED) / 1.25,
            'FILED_MID': (stageRadii.FILED + stageRadii.PRV) / 2,
            'PRV_MID': (stageRadii.PRV + stageRadii.TRANS) / 2,
            'TRANS_MID': stageRadii.TRANS * 0.6,
        };
        
        // Return only the main stage radii for single-year view (backward compatibility)
        return stageRadii;
    }
}

/**
 * Format company names by removing industry terms
 */
export function formatCompanyName(companyName: string): string {
    if (!companyName) return '';
    
    const phrasesToRemove = [
        'Life Sciences', 'Life Science', 'Pharmaceuticals', 'Biotechnology',
        'Therapeutics', 'Biometrics', 'Partners', 'Science', 'Biologics', 'Gene Therapies', ', Institute of Zoology, Chinese Academy of Sciences',
        'Pharma', 'Biotech', 'Genetic', 'Bio', 'Biosciences', 'BioTherapeutics', 'Theranostics',  'Bioscience', 'Biotechnologies', 'Biopharmaceuticals', 'Precision Medicines'
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
    const isAllYearView = labelConfig.textHeight < 9; // Detect all-year view based on text height

    // Get the stage radii based on the labelConfig's minRadius (which is based on the overall radius)
    const overallRadius = labelConfig.minRadius / (isAllYearView ? 1.25 : 1.125); // Reverse-engineer the original radius
    const stageRadii = getStageRadii(overallRadius, isAllYearView);

    companies.forEach((company, index) => {
        const angle = companyAngles.get(company.company);
        if (!angle) return;
        
        const centerAngle = angle.center - Math.PI/2; // Adjust for SVG coordinate system
        
        // Determine if label should be on left or right side
        const isRightSide = Math.cos(centerAngle) > 0;
        
        // CUSTOM PLACEMENT BASED ON STAGES
        // Determine which stages this company has
        const hasPreStage = company.stages.has('PRE') && company.stages.get('PRE').length > 0;
        const hasP1Stage = company.stages.has('P1') && company.stages.get('P1').length > 0;
        const hasP2Stage = company.stages.has('P2') && company.stages.get('P2').length > 0;
        const hasP3Stage = company.stages.has('P3') && company.stages.get('P3').length > 0;
        const hasPRVStage = company.stages.has('PRV') && company.stages.get('PRV').length > 0;
        const hasTransStage = company.stages.has('TRANS') && company.stages.get('TRANS').length > 0;
        const hasFiledStage = company.stages.has('FILED') && company.stages.get('FILED').length > 0;

        // Determine category for company placement
        const onlyPreStage = hasPreStage && !hasP1Stage && !hasP2Stage && !hasP3Stage && !hasPRVStage && !hasTransStage && !hasFiledStage;
        const onlyEarlyStages = (hasP1Stage || hasP2Stage || hasP3Stage) && !hasPreStage && !hasPRVStage && !hasTransStage && !hasFiledStage;
        const onlyLateStages = (hasPRVStage || hasTransStage || hasFiledStage) && !hasPreStage && !hasP1Stage && !hasP2Stage && !hasP3Stage;

        // Calculate initial radius based on category and alternating pattern
        const shouldPositionCloser = isAlternatingLabels && (index % 2 === 0);
        let baseRadius;
        
        if (onlyPreStage) {
            // Place outside PRE radial
            baseRadius = shouldPositionCloser ? labelConfig.minRadius : labelConfig.alternateRadius;
        } else if (onlyEarlyStages) {
            // Place between PRE and P1 radials - calculate midpoint
            const preP1Midpoint = (stageRadii['PRE'] + stageRadii['P1']) / 2;
            // Use a slightly different scaling for all-year view to prevent overlap
            const scaleFactor = isAllYearView ? 0.95 : 0.98;
            baseRadius = shouldPositionCloser ? preP1Midpoint : preP1Midpoint * scaleFactor;
        } else if (onlyLateStages) {
            // Place between P3 and PRV radials - calculate midpoint
            const p3PRVMidpoint = (stageRadii['P3'] + stageRadii['PRV']) / 2;
            // Use a slightly different scaling for all-year view to prevent overlap
            const scaleFactor = isAllYearView ? 0.985 : 0.918;
            baseRadius = shouldPositionCloser ? p3PRVMidpoint : p3PRVMidpoint * scaleFactor;
        } else {
            // Default placement for companies with mixed stages
            baseRadius = shouldPositionCloser ? labelConfig.minRadius : labelConfig.alternateRadius;
        }
        
        // Find a position that doesn't overlap with existing labels
        let currentRadius = baseRadius;
        let overlap = true;
        let attempts = 0;
        const maxAttempts = isAllYearView ? 15 : 10; // More attempts for all-year view
        
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
            // Use smaller increments in all-year view to find placement more precisely
            currentRadius += isAllYearView ? labelConfig.padding * 0.8 : labelConfig.padding;
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
        companyLabelFontSize: isAllYearView ? "8.425px" : "9.25px",
        labelFontSize: isAllYearView ? "8.425px" : "10.25px", // Increased font size for therapeutic areas
        labelFontWeight: isAllYearView ? "400" : "500", // Made fonts slightly bolder
        companyNodeWidth: isAllYearView ? 7.25 : 7.725, // Add back the companyNodeWidth
        companyNodeHeight: isAllYearView ? 4.25 : 7.725, // Add back the companyNodeHeight
        drugNodeRadius: isAllYearView ? 4.7125 : 8.125,
        drugNodeStrokeWidth: isAllYearView ? 1.225 : 1.5125,
        // Radius of the circular indicator shown around PRV-awarded drug nodes
        prvIndicatorRadius: isAllYearView ? 9 : 11.25,
        dotSize: isAllYearView ? 0 : 0,
        dotSpacing: isAllYearView ? 0 : 0,
        connectionStrokeWidth: isAllYearView ? 0.125 : 0.7625,
        connectionOpacity: isAllYearView ? 0.4025 : 0.325,
        highlightedNodeRadius: isAllYearView ? 8 : 10.25, 
        highlightedNodePosition: isAllYearView ? 1.25 : 1.25,
        // Optimization settings
        useShadowEffects: false, // Disable shadow effects in both views
        useAnimations: !isAllYearView, // Disable animations in all year view
        transitionDuration: isAllYearView ? 0 : 0, // No transitions in all year view
        renderPRVIndicators: !isAllYearView, // Only render PRV indicators in regular view
        simplifiedConnections: isAllYearView, // Use simplified connections in all year view
        // New performance optimizations
        maxCompaniesForAllYears: 350, // Maximum number of companies to show in all years view
        maxDrugsPerCompany: 10, // Maximum number of drugs to show per company in all years view
        useProgressiveLoading: isAllYearView, // Use progressive loading for all years view
        batchSize: 20, // Number of companies to render in each batch
        batchDelay: 200, // Delay between batches in ms
        useSimplifiedDrugNodes: isAllYearView, // Use simplified drug nodes in all years view
        skipNonEssentialEffects: isAllYearView, // Skip non-essential visual effects
        useStandardStrokeColors: true, // Use standard stroke colors instead of different ones
    };
}

/**
 * Get label configuration based on radius
 */
export function getLabelConfig(radius: number, isAllYearView: boolean) {
    // Adjust the radii values for the all-year view to work with expanded radials
    const minRadiusFactor = isAllYearView ? 1.725 : 1.4525;
    const maxRadiusFactor = isAllYearView ? 1.06 : 1.10;  // Closer to stage radials in all-year view
    const alternateRadiusFactor = isAllYearView ? 1.525 : 1.15;
    
    return {
        minRadius: radius * minRadiusFactor, // Position closest to the outermost circle
        maxRadius: radius * maxRadiusFactor, // Maximum radius for labels
        alternateRadius: radius * alternateRadiusFactor, // Alternate position for better legibility with many entries
        padding: isAllYearView ? 8.5 : 10.25, // Smaller padding in all-year view
        minAngleDiff: isAllYearView ? Math.PI / 60 : Math.PI / 30, // Tighter angle difference in all-year view
        textHeight: isAllYearView ? 8 : 10, // Smaller text height in all-year view
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
        cornerRadius: 10,
        angle: -Math.PI / 15 // Add angle for label positioning
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
    
    return { labelGroup, textElement };
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
export function sampleDataForAllYearView(data: any[], maxCompanies: number = 350, maxDrugsPerCompany: number = 10): any[] {
    console.time('sampleDataForAllYearView');
    
    // Filter data for years 2020-2025 and exclude terminated/canceled entries
    const filteredData = data.filter(entry => {
        // Check year
        const year = entry["PRV Year"] || entry["RPDD Year"] || entry["Purchase Year"];
        if (!year) return false;
        const yearNum = parseInt(year);
        if (yearNum < 2020 || yearNum > 2025) return false;
        
        // Check for terminated/canceled status
        // Exclude if PRV is terminated/liquidated
        if (isPRVTerminatedOrLiquidated(entry)) return false;
        
        // Exclude if drug development is terminated/canceled/discontinued
        if (entry["PRV Status"] === "Terminated" || 
            entry["PRV Status"] === "Liquidated" ||
            entry["PRV Status"] === "Canceled" ||
            entry["Current Development Stage"] === "Terminated" || 
            entry["Current Development Stage"] === "Discontinued" || 
            entry["Current Development Stage"] === "Canceled") {
            return false;
        }
        
        return true;
    });
    
    // First process the data to get company information
    // Use a more efficient approach to group by company
    const companyMap = new Map<string, { 
        company: string, 
        totalDrugs: number, 
        hasPRV: boolean,
        hasTransaction: boolean,
        entries: any[] 
    }>();
    
    // First pass: count drugs and check for PRV entries and transactions
    filteredData.forEach(entry => {
        const company = entry.Company;
        if (!company) return;
        
        if (!companyMap.has(company)) {
            companyMap.set(company, {
                company,
                totalDrugs: 0,
                hasPRV: false,
                hasTransaction: false,
                entries: []
            });
        }
        
        const companyData = companyMap.get(company)!;
        companyData.totalDrugs++;
        
        // Check if this is a PRV entry
        if (hasPRVAward(entry)) {
            companyData.hasPRV = true;
        }
        
        // Check if this is a transacted voucher
        if (entry["Purchase Year"] && entry["Purchase Year"].trim() !== "") {
            companyData.hasTransaction = true;
        }
    });
    
    // Sort companies by PRV/transaction status first, then by total drugs
    const sortedCompanies = Array.from(companyMap.values())
        .sort((a, b) => {
            // Prioritize companies with both PRV and transactions
            const aScore = (a.hasPRV ? 2 : 0) + (a.hasTransaction ? 1 : 0);
            const bScore = (b.hasPRV ? 2 : 0) + (b.hasTransaction ? 1 : 0);
            if (aScore !== bScore) return bScore - aScore;
            // Then sort by total drugs
            return b.totalDrugs - a.totalDrugs;
        })
        .slice(0, maxCompanies)
        .map(c => c.company);
    
    // Create a set for faster lookups
    const topCompanySet = new Set(sortedCompanies);
    
    // Initialize drug counts for each company
    const companyDrugCounts: Record<string, number> = {};
    sortedCompanies.forEach(company => {
        companyDrugCounts[company] = 0;
    });
    
    // First pass: include PRV entries and transacted vouchers
    const sampledData: any[] = [];
    const priorityEntries = filteredData.filter(entry => 
        (hasPRVAward(entry) || (entry["Purchase Year"] && entry["Purchase Year"].trim() !== "")) && 
        topCompanySet.has(entry.Company)
    );
    
    priorityEntries.forEach(entry => {
        const company = entry.Company;
        if (companyDrugCounts[company] < maxDrugsPerCompany) {
            sampledData.push(entry);
            companyDrugCounts[company]++;
        }
    });
    
    // Second pass: include entries in later stages
    const stageOrder = ['APRV', 'FILED', 'P3', 'P2', 'P1', 'PRE'];
    const remainingEntries = filteredData.filter(entry => 
        !hasPRVAward(entry) && 
        !(entry["Purchase Year"] && entry["Purchase Year"].trim() !== "") && 
        topCompanySet.has(entry.Company) &&
        companyDrugCounts[entry.Company] < maxDrugsPerCompany
    );
    
    // Sort by stage (later stages first)
    remainingEntries.sort((a, b) => {
        const stageA = getStage(a);
        const stageB = getStage(b);
        return stageOrder.indexOf(stageA) - stageOrder.indexOf(stageB);
    });
    
    // Add entries until we reach the limit for each company
    remainingEntries.forEach(entry => {
        const company = entry.Company;
        if (companyDrugCounts[company] < maxDrugsPerCompany) {
            sampledData.push(entry);
            companyDrugCounts[company]++;
        }
    });
    
    console.timeEnd('sampleDataForAllYearView');
    console.log(`Sampled data: ${sampledData.length} entries from original ${data.length} entries (2020-2025 only, excluding terminated/canceled)`);
    return sampledData;
}

/**
 * Samples data for the therapeutic area view to reduce rendering load
 * @param data The full dataset
 * @param maxAreas Maximum number of therapeutic areas to include (prioritizes those with more drugs)
 * @param maxDrugsPerArea Maximum number of drugs to show per therapeutic area
 * @returns Sampled dataset for lighter rendering
 */
export function sampleDataForTherapeuticAreaView(data: any[], maxAreas: number = 15, maxDrugsPerArea: number = 5): any[] {
    // First process the data to get therapeutic area information
    const areasMap = new Map();
    
    data.forEach(entry => {
        const area = entry.TherapeuticArea1;
        if (!area) return; // Skip entries without therapeutic area
        
        if (!areasMap.has(area)) {
            areasMap.set(area, {
                area,
                entries: [],
                totalDrugs: 0,
                hasPRV: false
            });
        }
        
        const areaData = areasMap.get(area);
        areaData.entries.push(entry);
        areaData.totalDrugs++;
        
        // Track if this area has any PRV entries
        if (hasPRVAward(entry)) {
            areaData.hasPRV = true;
        }
    });
    
    // Sort areas by total drugs (descending) and take top N
    const topAreas = Array.from(areasMap.values())
        .sort((a, b) => {
            // Prioritize areas with PRV entries
            if (a.hasPRV && !b.hasPRV) return -1;
            if (!a.hasPRV && b.hasPRV) return 1;
            // Then sort by total drugs
            return b.totalDrugs - a.totalDrugs;
        })
        .slice(0, maxAreas)
        .map(area => area.area);
    
    // Create a set for faster lookups
    const topAreaSet = new Set(topAreas);
    
    // Filter and sample the data
    const sampledData: any[] = [];
    const areaDrugCounts: Record<string, number> = {};
    
    // Initialize drug counts for each area
    topAreas.forEach(area => {
        areaDrugCounts[area] = 0;
    });
    
    // Prioritize PRV entries first
    const prvEntries = data.filter(entry => hasPRVAward(entry) && topAreaSet.has(entry.TherapeuticArea1));
    prvEntries.forEach(entry => {
        const area = entry.TherapeuticArea1;
        if (areaDrugCounts[area] < maxDrugsPerArea) {
            sampledData.push(entry);
            areaDrugCounts[area]++;
        }
    });
    
    // Then add other entries until we reach the limit for each area
    data.forEach(entry => {
        const area = entry.TherapeuticArea1;
        
        // Skip if not in top areas or already at max drugs for this area
        if (!topAreaSet.has(area) || areaDrugCounts[area] >= maxDrugsPerArea) {
            return;
        }
        
        // Skip if it's a PRV entry (already added)
        if (hasPRVAward(entry)) {
            return;
        }
        
        sampledData.push(entry);
        areaDrugCounts[area]++;
    });
    
    console.log(`Sampled therapeutic area data: ${sampledData.length} entries from original ${data.length} entries`);
    return sampledData;
}

/**
 * Creates a function that renders items in batches to avoid blocking the UI
 * @param items Array of items to render
 * @param renderFn Function to render each item
 * @param batchSize Number of items to render in each batch
 * @param progressCallback Callback to report progress
 * @returns Function that starts the rendering process
 */
export function createRenderingBatches<T>(
    items: T[],
    renderFn: (item: T, index: number) => void,
    batchSize: number = 10,
    progressCallback?: (completed: number, total: number) => void
): () => void {
    console.log(`Creating rendering batches for ${items.length} items with batch size ${batchSize}`);
    let currentIndex = 0;
    const totalItems = items.length;
    
    // Function to render a batch of items
    function renderBatch() {
        const endIndex = Math.min(currentIndex + batchSize, totalItems);
        console.log(`Rendering batch from ${currentIndex} to ${endIndex}`);
        
        // Render this batch
        for (let i = currentIndex; i < endIndex; i++) {
            renderFn(items[i], i);
        }
        
        // Update progress
        currentIndex = endIndex;
        if (progressCallback) {
            progressCallback(currentIndex, totalItems);
        }
        
        // Continue with next batch or finish
        if (currentIndex < totalItems) {
            setTimeout(renderBatch, 0);
        } else {
            console.log('Finished rendering all batches');
        }
    }
    
    // Return function to start rendering
    return () => {
        console.log('Starting batch rendering');
        currentIndex = 0;
        renderBatch();
    };
}

/**
 * Generates a sampled dataset for visualization
 * @param data The full dataset
 * @param maxElements Maximum number of elements to include
 * @param prioritizePRV Whether to prioritize PRV entries
 * @returns Sampled dataset
 */
export function generateSampledData(data: any[], maxElements: number = 500, prioritizePRV: boolean = true): any[] {
    if (data.length <= maxElements) {
        return data; // No sampling needed
    }
    
    // First, separate PRV entries if prioritizing them
    const prvEntries: any[] = [];
    const nonPrvEntries: any[] = [];
    
    if (prioritizePRV) {
        data.forEach(entry => {
            if (hasPRVAward(entry)) {
                prvEntries.push(entry);
            } else {
                nonPrvEntries.push(entry);
            }
        });
    } else {
        nonPrvEntries.push(...data);
    }
    
    // If we have more PRV entries than the max, sample them
    let sampledData: any[] = [];
    
    if (prvEntries.length >= maxElements) {
        // Randomly sample PRV entries to fit the max
        const shuffled = [...prvEntries].sort(() => 0.5 - Math.random());
        sampledData = shuffled.slice(0, maxElements);
    } else {
        // Include all PRV entries and sample the rest
        sampledData = [...prvEntries];
        
        // Calculate how many non-PRV entries we can include
        const remainingSlots = maxElements - prvEntries.length;
        
        if (remainingSlots > 0 && nonPrvEntries.length > 0) {
            // Sort by stage (later stages first)
            nonPrvEntries.sort((a, b) => {
                const stageA = getStage(a);
                const stageB = getStage(b);
                const stageOrder = ['PRV', 'FILED', 'P3', 'P2', 'P1', 'PRE'];
                return stageOrder.indexOf(stageA) - stageOrder.indexOf(stageB);
            });
            
            // Take entries from later stages first, up to the remaining slots
            sampledData.push(...nonPrvEntries.slice(0, remainingSlots));
        }
    }
    
    console.log(`Sampled data: ${sampledData.length} entries from original ${data.length} entries`);
    return sampledData;
}

/**
 * Calculate an adjusted drug node radius based on the number of drugs in a stage
 * to prevent overcrowding in dense areas of the visualization
 */
export function getAdjustedNodeRadius(
    sizeConfig: any, 
    drugsCount: number, 
    angleWidth: number, 
    stageRadius: number
): number {
    // Base radius from config
    const baseRadius = sizeConfig.drugNodeRadius;
    
    // If few drugs or this is a non-critical number, return the base radius
    if (drugsCount <= 5) {
        return baseRadius;
    }
    
    // Calculate the approximate circumference portion this company occupies at this stage
    const arcLength = angleWidth * stageRadius;
    
    // Calculate approximate space available per drug
    const spacePerDrug = arcLength / drugsCount;
    
    // Ideal minimum space between drug nodes (based on 2x the node diameter)
    const idealSpace = baseRadius * 4;
    
    // Calculate scaling factor based on available space vs ideal space
    const scaleFactor = Math.min(1, spacePerDrug / idealSpace);
    
    // Use a non-linear scaling to avoid too small nodes
    // This ensures that nodes don't get smaller than 50% of their original size
    const adjustedScaleFactor = 0.5 + (scaleFactor * 0.5);
    
    // Calculate the adjusted radius
    let adjustedRadius = baseRadius * adjustedScaleFactor;
    
    // For moderately crowded stages (6-12 drugs), use a more gradual scale
    if (drugsCount <= 12) {
        // Linear interpolation between full size at 5 drugs and adjusted size at 12 drugs
        const t = (drugsCount - 5) / 7; // normalized position between 5 and 12
        adjustedRadius = baseRadius * (1 - (t * (1 - adjustedScaleFactor)));
    }
    
    // For extremely crowded stages, make them even smaller
    if (drugsCount > 20) {
        adjustedRadius = Math.max(baseRadius * 0.4, adjustedRadius * 0.8);
    }
    
    // Ensure the radius doesn't go below a minimum threshold
    return Math.max(baseRadius * 0.4, adjustedRadius);
}