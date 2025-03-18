import * as d3 from 'd3';

/**
 * Creates a star shape path based on the SVG star
 * @param radius The radius of the star (the size)
 * @returns A path string for the star shape
 */
export function createStarPath(radius: number): string {
    // The original SVG path data from the provided four-point star
    // Original path: "M96.3674 171.367C83.0989 132.889 58.7263 109.749 21.3674 96.3672C58.5004 83.0328 83.033 58.6131 96.3674 21.3672C109.749 58.6037 135.59 83.1081 171.367 96.3672C132.766 109.673 109.692 135.458 96.3674 171.367Z"
    
    // Extract the path commands from the original SVG
    // Original viewBox is 193x193 with center at (96.3674, 96.3672)
    
    // Create a direct path command scaling the original SVG path
    // We'll normalize around the original center point and then scale by our radius
    const originalCenter = 96.3674; // The center point from the original SVG
    const originalScale = 75; // Approximate distance from center to tip in original SVG
    const scaleFactor = radius / originalScale;
    
    // Create the path by manually constructing a scaled version of the original
    // Start at the bottom point and move counter-clockwise
    const path = d3.path();
    
    // Move to bottom point
    path.moveTo(0, radius);
    
    // Draw curve to left point
    path.bezierCurveTo(
        -radius * 0.125, radius * 0.65, // control point 1
        -radius * 0.65, radius * 0.125, // control point 2
        -radius, 0                     // endpoint (left)
    );
    
    // Draw curve to top point
    path.bezierCurveTo(
        -radius * 0.65, -radius * 0.125, // control point 1
        -radius * 0.125, -radius * 0.65, // control point 2
        0, -radius                      // endpoint (top)
    );
    
    // Draw curve to right point
    path.bezierCurveTo(
        radius * 0.125, -radius * 0.65, // control point 1
        radius * 0.65, -radius * 0.125, // control point 2
        radius, 0                      // endpoint (right)
    );
    
    // Draw curve back to bottom point to close the path
    path.bezierCurveTo(
        radius * 0.65, radius * 0.125, // control point 1
        radius * 0.125, radius * 0.65, // control point 2
        0, radius                     // endpoint (bottom)
    );
    
    path.closePath();
    
    return path.toString();
}

/**
 * Creates a star shape as a D3 selection
 * @param parent The parent D3 selection to append the star to
 * @param radius The radius (size) of the star
 * @param fill The fill color for the star
 * @param stroke The stroke color for the star
 * @param strokeWidth The stroke width for the star
 * @returns The D3 selection containing the created star
 */
export function createStarShape(
    parent: d3.Selection<SVGGElement, unknown, null, undefined>,
    radius: number,
    fill: string = "#FFFFFF",
    stroke: string = "#000000",
    strokeWidth: number = 1,
    opacity: number = 1
): d3.Selection<SVGPathElement, unknown, null, undefined> {
    const starPath = createStarPath(radius);
    
    return parent.append("path")
        .attr("d", starPath)
        .attr("fill", fill)
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("opacity", opacity);
}

/**
 * Creates an SVG string for a two-tone star (split vertically)
 * @param size The size of the star
 * @param fillLeft The fill color for the left half
 * @param fillRight The fill color for the right half
 * @param border The border color
 * @param uniqueId An optional unique identifier to prevent clip-path ID conflicts
 * @returns SVG string for the two-tone star
 */
export function createSplitColorStarSVG(
    size: number,
    fillLeft: string,
    fillRight: string,
    border: string = "#161616",
    uniqueId: string = ''
): string {
    const radius = size / 2;
    const starPath = createStarPath(radius);
    const uuid = uniqueId || Math.random().toString(36).substring(2, 9);
    
    // Create the SVG with a clip path for each half
    return `
        <svg width="${size}" height="${size}" viewBox="${-radius} ${-radius} ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <clipPath id="leftHalf-${uuid}">
                    <rect x="${-radius}" y="${-radius}" width="${radius}" height="${size}" />
                </clipPath>
                <clipPath id="rightHalf-${uuid}">
                    <rect x="0" y="${-radius}" width="${radius}" height="${size}" />
                </clipPath>
            </defs>
            
            <!-- Left half -->
            <path d="${starPath}" fill="${fillLeft}" stroke="${border}" stroke-width="0.5" clip-path="url(#leftHalf-${uuid})" />
            
            <!-- Right half -->
            <path d="${starPath}" fill="${fillRight}" stroke="${border}" stroke-width="0.5" clip-path="url(#rightHalf-${uuid})" />
        </svg>
    `;
} 