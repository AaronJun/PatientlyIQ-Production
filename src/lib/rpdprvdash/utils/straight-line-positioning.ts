/**
 * Utility functions for positioning drug nodes in a straight line layout
 * Used for "All" year view to place drugs in a straight line
 */

/**
 * Calculate positions for drug nodes in a linear layout
 */
export function calculateLinearDrugPositions(
    companyNodePos: { x: number, y: number },
    stageRadii: { [key: string]: number },
    company: any
) {
    const drugPositions = [];
    
    // Get all drugs across all stages
    const allDrugs = [];
    company.stages.forEach((drugs, stage) => {
        drugs.forEach(drug => {
            allDrugs.push({
                drug,
                stage
            });
        });
    });
    
    // Sort drugs by stage
    // This ensures drugs are positioned from outside to inside (preclinical to approved)
    const sortOrder = ['PRE', 'P1', 'P1/2', 'P2', 'P3', 'FILED', 'APRV', 'PRV'];
    allDrugs.sort((a, b) => sortOrder.indexOf(a.stage) - sortOrder.indexOf(b.stage));
    
    // For each drug, calculate a position along the line from node to center
    allDrugs.forEach((item, index) => {
        const { drug, stage } = item;
        
        // Get the radius for this stage
        const stageRadius = stageRadii[stage];
        
        // Direction vector from company node to origin (0,0)
        const dirX = -companyNodePos.x;
        const dirY = -companyNodePos.y;
        const distance = Math.sqrt(dirX * dirX + dirY * dirY);
        
        // Normalize direction vector
        const normalizedDirX = dirX / distance;
        const normalizedDirY = dirY / distance;
        
        // Calculate drug position along the straight line
        // Use the stage radius to position it at the correct ring
        const drugX = companyNodePos.x + normalizedDirX * (distance - stageRadius);
        const drugY = companyNodePos.y + normalizedDirY * (distance - stageRadius);
        
        drugPositions.push({
            drug,
            stage,
            position: { x: drugX, y: drugY }
        });
    });
    
    return drugPositions;
}

/**
 * Check if drug positions might overlap and adjust if needed
 * This ensures drugs don't overlap too much when placed on a straight line
 */
export function adjustForOverlap(drugPositions, minDistance = 15) {
    if (drugPositions.length <= 1) return drugPositions;
    
    const adjustedPositions = [...drugPositions];
    
    // Simple adjustment - spread out overlapping nodes slightly perpendicular to line
    for (let i = 0; i < adjustedPositions.length - 1; i++) {
        const posA = adjustedPositions[i].position;
        const posB = adjustedPositions[i + 1].position;
        
        // Calculate distance between consecutive nodes
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If nodes are too close, adjust their positions
        if (distance < minDistance) {
            // Calculate perpendicular vector
            const perpX = -dy / distance;  
            const perpY = dx / distance;
            
            // Move nodes in opposite perpendicular directions
            const offsetDistance = (minDistance - distance) / 2;
            
            adjustedPositions[i].position = {
                x: posA.x + perpX * offsetDistance * 0.5,
                y: posA.y + perpY * offsetDistance * 0.5
            };
            
            adjustedPositions[i + 1].position = {
                x: posB.x - perpX * offsetDistance * 0.5,
                y: posB.y - perpY * offsetDistance * 0.5
            };
        }
    }
    
    return adjustedPositions;
}