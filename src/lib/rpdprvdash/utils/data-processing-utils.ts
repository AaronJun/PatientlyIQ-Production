/**
 * Determines the stage code from an entry
 */
export function getStage(entry: any): string {
    if (!entry) return "PRE";
    
    // Check if PRV has been transacted (purchased)
    if (entry["Purchase Year"]) return "TRNS";
    
    // Check if PRV has been issued
    if (entry["PRV Year"] || entry["PRV Issue Year"]) return "PRV";
    
    const stage = entry["Current Development Stage"];
    switch(stage) {
        case "PRV Awarded": return "PRV";
        case "Preclinical": return "PRE";
        case "Phase 1": return "P1";
        case "Phase 1/2": return "P1";
        case "Phase 2" || "Phase 2a" || "Phase 2b": return "P2";
        case "Phase 3": return "P3";
        case "Filed": return "FILED";
        case "Approved": return "APRV";
        default: return "PRE";
    }
}

// Maps for stage and company status codes
export const stageCodeMap = {
    'PRE': 'Preclinical',
    'P1': 'Phase 1',
    'P1/2': 'Phase 1/2',
    'P2': 'Phase 2',
    'P3': 'Phase 3',
    'FILED': 'Filed',
    'APRV': 'Approved',
    'PRV': 'PRV Awarded',
    'TRNS': 'PRV Transacted'
};

/**
 * Get the stage radii configuration
 */
export function getStageRadii(radius: number) {
    return {
        'PRE': radius * 0.925,
        'P1': radius * 0.8425,
        'P2': radius * 0.7425,
        'P3': radius * 0.6425,
        'FILED': radius * 0.525,
        'PRV': radius * 0.425,
        'TRNS': radius * 0.325  // Add the new TRNS stage with smaller radius
    };
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
        'Therapeutics', 'Biometrics', 'Partners', 'Science', 'Biologics',
        'Pharma', 'Biotech', 'Genetic', 'Bio', 'Biosciences'
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
    const minDistanceBetweenLabels = labelHeight * 1.5; // Minimum spacing between labels

    companies.forEach(company => {
        const angle = companyAngles.get(company.company);
        if (!angle) return;
        
        const centerAngle = angle.center - Math.PI/2; // Adjust for SVG coordinate system
        
        // Determine if label should be on left or right side
        const isRightSide = Math.cos(centerAngle) > 0;
        
        // Calculate initial radius based on angle
        let baseRadius = labelConfig.minRadius;
        
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
                    isRightSide
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
                isRightSide
            });
        }
    });

    return labels;
}

/**
 * Process data into a format suitable for the visualization
 */
export function processDataForLayout(data: any[]) {
    const companiesMap = new Map();
    
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
                transactedVouchers: 0,  // Add counter for transacted vouchers
                uniqueIndications: new Set(),
                uniqueAreas: new Set()
            });
        }
        
        const companyData = companiesMap.get(companyName);
        const stage = getStage(entry);
        
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
        
        // Count vouchers awarded
        if (stage === "PRV" || entry["PRV Issue Year"] || entry["PRV Year"]) {
            companyData.vouchersAwarded++;
        }
        
        // Count transacted vouchers
        if (stage === "TRNS" || entry["Purchase Year"]) {
            companyData.transactedVouchers++;
        }
    });

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
        labelFontWeight: isAllYearView ? "600" : "500",
        companyNodeWidth: isAllYearView ? 5.25 : 7.725,
        companyNodeHeight: isAllYearView ? 5.25 : 7.725,
        drugNodeRadius: isAllYearView ? 2.7125 : 6.125,
        drugNodeStrokeWidth: isAllYearView ? .925 : 1.5125,
        prvIndicatorRadius: isAllYearView ? 9 : 11.25,
        dotSize: isAllYearView ? 0 : 0,
        dotSpacing: isAllYearView ? 0 : 0,
        connectionStrokeWidth: isAllYearView ? 0.625 : 0.5625,
        connectionOpacity: isAllYearView ? 0.3025 : 0.225,
        highlightedNodeRadius: isAllYearView ? 8 : 10.25, 
        highlightedNodePosition: isAllYearView ? 1.25 : 1.25,
    };
}

/**
 * Get the label configuration object based on view mode and radius
 */
export function getLabelConfig(radius: number, isAllYearView: boolean) {
    return {
        minRadius: radius * 1.15, // Position outside the main circles
        maxRadius: radius * 1.25, // Maximum radius for labels
        padding: 8.25,
        minAngleDiff: Math.PI / 60, // Minimum angle between labels
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
        if (stage === "PRV" || entry["PRV Issue Year"] || entry["PRV Year"]) {
            areaData.vouchersAwarded++;
        }
        
        // Count transacted vouchers
        if (stage === "TRNS" || entry["Purchase Year"]) {
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
    
    return areas.map(area => ({
        name: area.area,
        totalDrugs: area.totalDrugs,
        companies: area.uniqueCompanies.size,
        candidates: area.uniqueCandidates.size,
        indications: area.indications.size,
        clinicalTrials: area.clinicalTrials,
        vouchersAwarded: area.vouchersAwarded,
        transactedVouchers: area.transactedVouchers,  // Add transacted vouchers to statistics
        // Count drugs by stage
        stages: Array.from(area.stages.entries()).reduce((acc, [stage, drugs]) => {
            acc[stage] = drugs.length;
            return acc;
        }, {})
    }));
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