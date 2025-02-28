<!-- Enhanced RPDPRVCompanyTree.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import RPDTooltip from './RPDTooltip.svelte';
    // Import the color definitions
    import { 
        getTherapeuticAreaColor, 
        getStageColor, 
        getCompanyStatusColor,
        therapeuticAreaColors,
        stageColors,
        companyStatusColors
    } from './utils/colorDefinitions';

    export let data: any[] = [];
    export let onCompanyHover: (entries: any[]) => void = () => {};
    export let onStageHover: (entries: any[]) => void = () => {};
    export let onLeave: () => void = () => {};
    export let onShowDrugDetail: (detail: any) => void = () => {};
    export let onShowCompanyDetail: (detail: any) => void = () => {};

    let svg: SVGElement;
    const width = 850;
    const height = 850;
    const radius = Math.min(width, height) / 2 - 60;

    // Improved label positioning configuration
    const labelConfig = {
        minRadius: radius * .9825,
        maxRadius: radius * 1.25,
        padding: 8.25,
        minAngleDiff: Math.PI / 32, // Minimum angle between labels
        textHeight: 12,
        dotRowHeight: 5,
        maxDotsPerRow: 12
    };

    // Stage-specific radii (from outer to inner)
    const stageRadii = {
        'PRE': radius * 0.9325,
        'P1': radius * 0.8125,
        'P1/2': radius * 0.725,
        'P2': radius * 0.625,
        'P3': radius * 0.525,
        'FILED': radius * 0.4125,
        'APRV': radius * 0.295,
        'PRV': radius * 0.15
    };

    // UI Configuration
    const stageLabelConfig = {
        padding: { x: 0, y: 1 },
        height: 10,
        cornerRadius: 10
    };

    const maxLabelWidth = 85;
    const ANGLE_BUFFER = Math.PI / 24;

    // Tooltip state
    let tooltipVisible = false;
    let tooltipContent = {
        sponsor: '',
        drugName: '',
        therapeuticArea: '',
        id: ''
    };
    let tooltipBorderColor = '';
    let tooltipX = 0;
    let tooltipY = 0;
    // Tooltip offset from cursor
    const tooltipOffset = { x: 15, y: 15 };
    // Tooltip timeout for handling stale tooltips
    let tooltipTimeout = null;

    // Maps for stage and company status codes
    const stageCodeMap = {
        'PRE': 'Preclinical',
        'P1': 'Phase 1',
        'P1/2': 'Phase 1/2',
        'P2': 'Phase 2',
        'P3': 'Phase 3',
        'FILED': 'Filed',
        'APRV': 'Approved',
        'PRV': 'PRV Awarded'
    };

    // Active selection tracking
    let activeCompany = null;
    let activeStage = null;

    function getStage(entry: any) {
        if (entry["PRV Year"]) return "PRV";
        
        const stage = entry["Current Development Stage"];
        switch(stage) {
            case "PRV Awarded": return "PRV";
            case "Preclinical": return "PRE";
            case "Phase 1": return "P1";
            case "Phase 1/2": return "P1/2";
            case "Phase 2":
            case "Phase 2a":
            case "Phase 2b": return "P2";
            case "Phase 3": return "P3";
            case "Filed": return "FILED";
            case "Approved": return "APRV";
            default: return "PRE";
        }
    }

    function getStageFullName(stageCode: string): string {
        return stageCodeMap[stageCode] || stageCode;
    }

    function calculateOptimalLabelPlacement(companies: any[], companyAngles: Map<string, any>) {
        const labels: any[] = [];
        const labelHeight = labelConfig.textHeight + 
                          Math.ceil(companies[0].totalDrugs / labelConfig.maxDotsPerRow) * labelConfig.dotRowHeight;

        companies.forEach(company => {
            const angle = companyAngles.get(company.company);
            const centerAngle = angle.center;
            
            // Determine if label should be on left or right side
            const isRightSide = Math.cos(centerAngle - Math.PI/2) > 0;
            
            // Calculate initial radius based on angle
            let baseRadius = labelConfig.minRadius;
            const labelAngle = centerAngle;

            // Find a position that doesn't overlap with existing labels
            let currentRadius = baseRadius;
            let overlap = true;
            
            while (overlap && currentRadius <= labelConfig.maxRadius) {
                const x = currentRadius * Math.cos(labelAngle - Math.PI/2);
                const y = currentRadius * Math.sin(labelAngle - Math.PI/2);
                
                overlap = labels.some(label => {
                    const dx = x - label.x;
                    const dy = y - label.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    return distance < labelHeight * 2;
                });
                
                if (!overlap) {
                    labels.push({
                        company: company.company,
                        x,
                        y,
                        angle: labelAngle,
                        isRightSide
                    });
                    break;
                }
                
                currentRadius += labelConfig.padding;
            }
        });

        return labels;
    }
  
    function createLabelGroup(group: d3.Selection<SVGGElement, unknown, null, undefined>, 
                            company: any,
                            labelPlacement: any) {
        const textAnchor = labelPlacement.isRightSide ? "start" : "end";
        const xOffset = labelPlacement.isRightSide ? 15 : -15;
        
        // Create text element
        const textElement = group.append("text")
            .attr("text-anchor", textAnchor)
            .attr("dx", xOffset)
            .attr("dy", "0.35em")
            .text(company.company)
            .attr("fill", "#4A5568")
            .attr("font-size", "10.25px")
            .attr("font-weight", "500");

        // Create dots group with improved positioning
        const dotsGroup = group.append("g")
            .attr("class", "pipeline-dots")
            .attr("transform", `translate(${xOffset}, ${labelConfig.textHeight})`);

        const numDots = company.entries.length;
        const dotsPerRow = Math.min(labelConfig.maxDotsPerRow, numDots);
        const numRows = Math.ceil(numDots / dotsPerRow);

        // Get company status color
        const statusColor = getCompanyStatusColor(company.status);

        for (let i = 0; i < numDots; i++) {
            const row = Math.floor(i / dotsPerRow);
            const col = i % dotsPerRow;
            const x = labelPlacement.isRightSide ? 
                col * 10 : 
                -(col * 10);
            
            dotsGroup.append("circle")
                .attr("r", 0)
                .attr("stroke", "#161616")
                .attr("cx", x+10)
                .attr("cy", row * labelConfig.dotRowHeight)
                .attr("fill", statusColor.fill)
                .attr("opacity", 0.825);
        }

        return { textElement, dotsGroup };
    }

    function processDataForLayout(data: any[]) {
        const companiesMap = new Map();
        
        data.forEach((entry) => {
            const companyName = entry.Company;
            if (!companiesMap.has(companyName)) {
                companiesMap.set(companyName, {
                    company: companyName,
                    status: entry['Public/Private'] || 'Private',
                    stages: new Map(),
                    totalDrugs: 0,
                    entries: [],
                    clinicalTrials: 0,
                    vouchersAwarded: 0,
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
            if (stage === "PRV" || entry["PRV Issue Year"]) {
                companyData.vouchersAwarded++;
            }
        });

        return Array.from(companiesMap.values())
            .sort((a, b) => a.company.localeCompare(b.company));
    }

    function calculateCompanyAngles(companies: any[]) {
        const totalDrugs = companies.reduce((sum, company) => sum + company.totalDrugs, 0);
        let currentAngle = 0;
        const angles = new Map();

        companies.forEach(company => {
            const proportion = company.totalDrugs / totalDrugs;
            const angle = proportion * (2 * Math.PI - (companies.length * ANGLE_BUFFER));
            angles.set(company.company, {
                start: currentAngle,
                end: currentAngle + angle,
                center: currentAngle + angle/2
            });
            currentAngle += angle + ANGLE_BUFFER;
        });

        return angles;
    }

    function truncateText(text: string, maxWidth: number) {
        if (text.length <= maxWidth / 8) return text;
        return text.slice(0, Math.floor(maxWidth / 8) - 3) + '...';
    }

    function showTooltip(event: MouseEvent, d: any, isCompany: boolean = false) {
        // Clear any existing tooltip timeout
        if (tooltipTimeout) {
            clearTimeout(tooltipTimeout);
            tooltipTimeout = null;
        }
        
        // If SVG is not available, don't show tooltip
        if (!svg) {
            return;
        }
        
        const containerRect = svg.getBoundingClientRect();
        
        // Position the tooltip next to the cursor with offsets
        tooltipX = event.clientX - containerRect.left + tooltipOffset.x;
        tooltipY = event.clientY - containerRect.top + tooltipOffset.y;
        
        // Check if tooltip would go outside right edge of container
        const tooltipWidth = 200; // Approximate width of tooltip
        if (tooltipX + tooltipWidth > containerRect.width) {
            // Position tooltip to the left of cursor instead
            tooltipX = event.clientX - containerRect.left - tooltipWidth - tooltipOffset.x;
        }
        
        // Check if tooltip would go outside bottom edge of container
        const tooltipHeight = 100; // Approximate height of tooltip
        if (tooltipY + tooltipHeight > containerRect.height) {
            // Position tooltip above cursor instead
            tooltipY = event.clientY - containerRect.top - tooltipHeight - tooltipOffset.y;
        }
        
        if (isCompany) {
            tooltipContent = {
                sponsor: d.company,
                drugName: '',
                therapeuticArea: '',
                id: `${d.totalDrugs} drugs in pipeline`
            };
            const statusColor = getCompanyStatusColor(d.status);
            tooltipBorderColor = statusColor.stroke;
        } else {
            tooltipContent = {
                sponsor: d.Company || '',
                drugName: d.Candidate || '',
                therapeuticArea: d.TherapeuticArea1 || '',
                id: d["Current Development Stage"] || (d["PRV Issue Year"] ? "PRV" : "")
            };
            const stageCode = getStage(d);
            const stageFullName = getStageFullName(stageCode);
            const stageColor = getStageColor(stageFullName);
            tooltipBorderColor = stageColor.stroke;
        }
        
        tooltipVisible = true;
    }

    function hideTooltip() {
        // Use a small timeout to prevent the tooltip from flickering when moving between elements
        if (tooltipTimeout) {
            clearTimeout(tooltipTimeout);
        }
        
        tooltipTimeout = setTimeout(() => {
            tooltipVisible = false;
            tooltipTimeout = null;
        }, 100);
    }
    
    function setActiveCompany(company, entries) {
        // Set the active company and clear active stage
        activeCompany = company;
        activeStage = null;
        
        // Reset all company nodes and labels to inactive state
        d3.selectAll(".company-node rect")
            .transition()
            .duration(200)
            .attr("width", "9.25")
            .attr("height", "9.25")
            .attr("transform", "translate(-5.125, -5.125)");
            
        d3.selectAll(".company-label text")
            .transition()
            .duration(500)
            .attr("fill", "#4A5568")
            .attr("font-size", "10.25px")
            .attr("font-weight", "500");
            
        d3.selectAll(".pipeline-dots circle")
            .transition()
            .duration(200)
            .attr("r", 0)
            .attr("opacity", 0.7);
            
        // Highlight the active company
        if (company) {
            const companyId = company.replace(/\s+/g, '-').toLowerCase();
            
            d3.select(`#company-node-${companyId} rect`)
                .transition()
                .duration(200)
                .attr("width", "14.25")
                .attr("height", "14.25")
                .attr("transform", "translate(-7.125, -7.125)");
                
            d3.select(`#company-label-${companyId} text`)
                .transition()
                .duration(500)
                .attr("fill", "#FF4A4A")
                .attr("font-size", "12px")
                .attr("font-weight", "800");
                
            d3.select(`#company-label-${companyId} .pipeline-dots`)
                .selectAll("circle")
                .transition()
                .duration(200)
                .attr("r", 0)
                .attr("opacity", 1);
                
            // Find company data for this company
            const companyData = processDataForLayout(data).find(c => c.company === company);
            if (companyData) {
                // Pass additional metrics to onCompanyHover
                onCompanyHover({
                    entries: companyData.entries,
                    companyName: companyData.company, 
                    totalDrugs: companyData.totalDrugs,
                    clinicalTrials: companyData.clinicalTrials,
                    vouchersAwarded: companyData.vouchersAwarded,
                    uniqueIndications: companyData.uniqueIndications.size,
                    uniqueAreas: companyData.uniqueAreas.size
                });
            } else {
                onCompanyHover(entries);
            }
        }
    }
    
    function setActiveStage(stage, entries) {
        // Set the active stage and clear active company
        activeStage = stage;
        activeCompany = null;
        
        // Reset all stage circles to inactive state
        d3.selectAll(".stage-label rect")
            .transition()
            .duration(200)
            .attr("fill", "#F8FAFC");
            
        d3.selectAll(".stage-label text")
            .transition()
            .duration(200)
            .attr("font-weight", "400");
            
        // Highlight the active stage
        if (stage) {
            d3.select(`#stage-label-${stage} rect`)
                .transition()
                .duration(200)
                .attr("fill", "#F1F5F9");
                
            d3.select(`#stage-label-${stage} text`)
                .transition()
                .duration(200)
                .attr("font-weight", "700");
                
            onStageHover(entries);
        }
    }

    function createVisualization() {
    if (!svg) return;

    const svgElement = d3.select(svg);
    svgElement.selectAll("*").remove();

    const mainGroup = svgElement.append("g")
        .attr("transform", `translate(${width/2},${height/2})`);

    const linesGroup = mainGroup.append("g").attr("class", "connecting-lines");
    const stagesGroup = mainGroup.append("g").attr("class", "stage-circles");
    const companyLabelsGroup = mainGroup.append("g").attr("class", "company-labels");

    // Create stage circles and labels
    Object.entries(stageRadii).forEach(([stage, radius]) => {
        // Get the stage color from our color definitions
        const stageFullName = getStageFullName(stage);
        const stageColor = getStageColor(stageFullName);
        
        stagesGroup.append("circle")
            .attr("r", radius)
            .attr("fill", "none")
            .attr("stroke", stageColor.stroke)
            .attr("stroke-width", 1.425)
            .attr("stroke-dasharray", "1,5")
            .attr("stroke-opacity", 1);

        const labelAngle = -Math.PI / 15;
        const labelX = radius * Math.cos(labelAngle) - 15;
        const labelY = radius * Math.sin(labelAngle) + 25;

        const labelGroup = stagesGroup.append("g")
            .attr("transform", `translate(${labelX},${labelY})`)
            .attr("class", "stage-label")
            .attr("id", `stage-label-${stage}`)
            .attr("cursor", "pointer");

        const tempText = labelGroup.append("text")
            .attr("opacity", 0)
            .text(stage);
        const textWidth = tempText.node()?.getBBox().width ?? 0;
        tempText.remove();

        labelGroup.append("rect")
            .attr("x", -stageLabelConfig.padding.x)
            .attr("y", -stageLabelConfig.height/2)
            .attr("width", textWidth + stageLabelConfig.padding.x * 2)
            .attr("height", stageLabelConfig.height)
            .attr("rx", stageLabelConfig.cornerRadius)
            .attr("fill", '#F8FAFC')
            .attr("opacity", 1);

        labelGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .attr("fill", stageColor.stroke)
            .attr("font-size", "10.25px")
            .attr("font-weight", "400")
            .text(stage);
            
        // Add click handler for stage label
        labelGroup.on("click", (event) => {
            event.stopPropagation();
            
            // Hide tooltip immediately
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
            tooltipVisible = false;
            
            const stageEntries = data.filter(entry => getStage(entry) === stage);
            setActiveStage(stage, stageEntries);
        });
    });

    const companies = processDataForLayout(data);
    const companyAngles = calculateCompanyAngles(companies);
    const labelPlacements = calculateOptimalLabelPlacement(companies, companyAngles);

    companies.forEach(company => {
        const angle = companyAngles.get(company.company);
        const labelPlacement = labelPlacements.find(l => l.company === company.company);
        if (!labelPlacement) return;

        const companyGroup = mainGroup.append("g");

        // Create sanitized ID for the company
        const companyId = company.company.replace(/\s+/g, '-').toLowerCase();

        // Calculate node position (where lines connect)
        const nodeRadius = radius * .9725;
        const nodeAngle = angle.center;
        const nodeX = nodeRadius * Math.cos(nodeAngle - Math.PI/2);
        const nodeY = nodeRadius * Math.sin(nodeAngle - Math.PI/2);

        // Get company status color
        const statusColor = getCompanyStatusColor(company.status);

        // Create company node
        const nodeGroup = companyLabelsGroup.append("g")
            .attr("transform", `translate(${nodeX},${nodeY})`)
            .attr("cursor", "pointer")
            .attr("class", "company-node")
            .attr("id", `company-node-${companyId}`);

        nodeGroup.append("rect")
            .attr("width", 7.725)
            .attr("height", 7.725)
            .attr("transform", "translate(-5.125, -5.125)")
            .attr("fill", statusColor.fill)
            .attr("stroke", statusColor.stroke)
            .attr("stroke-width", 0.725)
            .attr("rx", 2);

        // Add connecting line from node to label
        linesGroup.append("path")
            .attr("d", `M${nodeX},${nodeY}L${labelPlacement.x},${labelPlacement.y}`)
            .attr("stroke", "#37587e")
            .attr("stroke-width", .725)
            .attr("stroke-opacity", 0.825)
            .attr("fill", "none");

        // Create label group
        const labelGroup = companyLabelsGroup.append("g")
            .attr("transform", `translate(${labelPlacement.x},${labelPlacement.y})`)
            .attr("cursor", "pointer")
            .attr("class", "company-label")
            .attr("id", `company-label-${companyId}`);

        const { textElement, dotsGroup } = createLabelGroup(labelGroup, company, labelPlacement);

        // Connect drugs to node
        company.stages.forEach((drugs, stage) => {
            const stageRadius = stageRadii[stage];
            const drugSpacing = (angle.end - angle.start) / (drugs.length + 1);

            drugs.forEach((drug, i) => {
                const drugAngle = angle.start + drugSpacing * (i + 1);
                const drugX = stageRadius * Math.cos(drugAngle - Math.PI/2);
                const drugY = stageRadius * Math.sin(drugAngle - Math.PI/2);

                // Add connecting line from node to drug
                linesGroup.append("path")
                    .attr("d", `M${nodeX},${nodeY}L${drugX},${drugY}`)
                    .attr("stroke", "#37587e")
                    .attr("stroke-width", .7625)
                    .attr("stroke-opacity", 0.525)
                    .attr("fill", "none");

                const drugGroup = companyGroup.append("g")
                    .attr("transform", `translate(${drugX},${drugY})`)
                    .attr("cursor", "pointer");

                // Get therapeutic area color
                const areaColors = getTherapeuticAreaColor(drug.TherapeuticArea1);

                // Drug circle
                drugGroup.append("circle")
                    .attr("r", 7.725)
                    .attr("fill", areaColors.fill)
                    .attr("stroke", areaColors.stroke)
                    .attr("stroke-width", "1.7825px");

                // Add PRV indicator for PRV awarded drugs
                if (drug["PRV Issue Year"]) {
                    drugGroup.append("circle")
                        .attr("r", 11.25)
                        .attr("fill", "none")
                        .attr("stroke", "#976201")
                        .attr("stroke-width", "2")
                        .attr("stroke-dasharray", "2,2");
                }

                // Drug interactions
                drugGroup
                    .on("mouseenter", (event) => {
                        drugGroup.select("circle")
                            .transition()
                            .duration(200)
                            .attr("r", 10.25)
                            .style("filter", "drop-shadow(0 2px 2px rgba(0,0,0,0.1))");

                        if (drug["PRV Issue Year"]) {
                            drugGroup.select("circle:last-child")
                                .transition()
                                .duration(200)
                                .attr("r", 10.25)
                                .attr("stroke-width", 4.725);
                        }
                        showTooltip(event, drug);
                    })
                    .on("mousemove", (event) => {
                        // Update tooltip position when mouse moves
                        showTooltip(event, drug);
                    })
                    .on("mouseleave", () => {
                        drugGroup.select("circle")
                            .transition()
                            .duration(200)
                            .attr("r", 7.725)
                            .attr("stroke-width", "1.7825px")
                            .attr("stroke", areaColors.stroke)
                            .style("filter", "none");

                        if (drug["PRV Issue Year"]) {
                            drugGroup.select("circle:last-child")
                                .transition()
                                .duration(200)
                                .attr("r", 11.25)
                                .attr("stroke-width", "2px");
                        }
                        hideTooltip();
                    })
                    .on("click", (event) => {
                        event.stopPropagation();
                        
                        // Force immediate tooltip hiding without delay
                        if (tooltipTimeout) {
                            clearTimeout(tooltipTimeout);
                            tooltipTimeout = null;
                        }
                        tooltipVisible = false;
                        
                        onShowDrugDetail({
                            drugName: drug.Candidate,
                            year: drug["PRV Year"] || drug["RPDD Year"],
                            Company: drug.Company,
                            therapeuticArea: drug.TherapeuticArea1,
                            entries: data.filter(d => d.TherapeuticArea1 === drug.TherapeuticArea1),
                            color: areaColors.fill,
                            strokeColor: areaColors.stroke,
                            currentStage: drug["Current Development Stage"],
                            indication: drug.Indication || "",
                            rpddAwardDate: drug["RPDD Year"],
                            voucherAwardDate: drug["PRV Year"] || "",
                            treatmentClass: drug.Class1 || "TBD",
                            mechanismOfAction: drug.MOA || "TBD",
                            companyUrl: drug["Link to CrunchBase"] || ""
                        });
                    });
            });
        });

        // Add interaction handlers for both node and label
        const handleMouseEnter = (event: MouseEvent) => {
            // Set this company as active
            setActiveCompany(company.company, company.entries);
            showTooltip(event, {
                company: company.company,
                totalDrugs: company.totalDrugs,
                status: company.status
            }, true);
        };

        const handleMouseMove = (event: MouseEvent) => {
            // Update tooltip position when mouse moves
            showTooltip(event, {
                company: company.company,
                totalDrugs: company.totalDrugs,
                status: company.status
            }, true);
        };

        const handleClick = (event) => {
            // Stop event propagation to prevent background click handler from firing
            event.stopPropagation();
            
            // Force immediate tooltip hiding without delay
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
            tooltipVisible = false;
            
            onShowCompanyDetail({
                Company: company.company,
                entries: company.entries,
                color: statusColor.fill,
                strokeColor: statusColor.stroke
            });
        };

        // Apply handlers to both node and label groups
        [nodeGroup, labelGroup].forEach(group => {
            group
                .on("mouseenter", handleMouseEnter)
                .on("mousemove", handleMouseMove)
                .on("click", handleClick);
        });
    });

    // Add click handler to SVG background to clear selections
    svgElement.on("click", (event) => {
        // Check if click was directly on the SVG background
        if (event.target === svg) {
            activeCompany = null;
            activeStage = null;
            hideTooltip(); // Ensure tooltip is hidden when clicking on background
            onLeave();
        }
    });
    
    // Add event listeners to handle tooltip when mouse leaves SVG
    svgElement.on("mouseleave", () => {
        hideTooltip();
    });
}

    // Initialize visualization when data or svg changes
    $: if (data.length > 0 && svg) {
        createVisualization();
    }
    
    // Clean up tooltip when component is destroyed
    onMount(() => {
        return () => {
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
        };
    });
</script>

<div class="chart-container">
    <svg
        bind:this={svg}
        {width}
        {height}
        viewBox="0 0 {width} {height}"
        class="w-full h-auto"
    />

    {#if tooltipVisible}
        <RPDTooltip
            visible={tooltipVisible}
            content={tooltipContent}
            borderColor={tooltipBorderColor}
            x={tooltipX}
            y={tooltipY}
        />
    {/if}
</div>

<style>
    .chart-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        position: relative;
    }
</style>