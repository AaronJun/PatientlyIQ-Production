<!-- RPDCompanyTree.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import RPDTooltip from './RPDTooltip.svelte';

    export let data: any[] = [];
    export let onCompanyHover: (entries: any[]) => void = () => {};
    export let onLeave: () => void = () => {};
    export let onShowDrugDetail: (detail: any) => void = () => {};
    export let onShowCompanyDetail: (detail: any) => void = () => {};

    let svg: SVGElement;
    const width = 1200;
    const height = 1200;
    const radius = Math.min(width, height) / 2 - 60;

    // Stage-specific radii (from outer to inner)  
    const stageRadii = {
        'PRE': radius * 0.925,
        'P1': radius * 0.825,
        'P1/2': radius * 0.725,
        'P2': radius * 0.625,
        'P3': radius * 0.525,
        'FILED': radius * 0.4125,
        'APRV': radius * 0.295,
        'PRV': radius * 0.15
    };

    // UI Configuration
    const stageLabelConfig = {
        padding: { x: 6, y: 4 },
        height: 18,
        cornerRadius: 10
    };

    const labelRadius = radius * .9725;
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

    // Color scales
    const stageColorScale = d3.scaleOrdinal()
        .domain(['PRE', 'P1', 'P1/2', 'P2', 'P3', 'APRV', 'PRV'])
        .range([
            '#4A5568', // Preclinical 
            '#60ACA9', // Phase 1
            '#2B6CB0', // Phase 1/2
            '#2C5282', // Phase 2
            '#1A365D', // Phase 3
            '#48BB78', // Approved
            '#2F855A'  // PRV
        ]);

    const therapeuticAreaColorScale = d3.scaleOrdinal()
        .domain([
            'Neurology', 'Oncology', 'Metabolic', 'Ophthalmology',
            'Cardiovascular', 'Pulmonology', 'Hematology',
            'Endocrinology', 'Genetic', 'Immunology',
            'Gastroenterology', 'Hepatology', 'Dermatology',
            'Neonatology', 'Urology'
        ])
        .range([
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEEAD', '#D4A5A5', '#9DE0AD',
            '#FF9F1C', '#2EC4B6', '#E71D36',
            '#FDFFB6', '#CBE896', '#FFA07A',
            '#98D8C8', '#B8B8D1'
        ]);

    function getStage(entry: any) {
        // Check for PRV status first
        if (entry["PRV Year"]) {
            return "PRV";
        }
        
        // Get current development stage
        const stage = entry["Current Development Stage"];
        
        // Map development stages
        switch(stage) {
            case "PRV Awarded":
                return "PRV";
            case "Preclinical":
                return "PRE";
            case "Phase 1":
                return "P1";
            case "Phase 1/2":
                return "P1/2";
            case "Phase 2":
            case "Phase 2a":
            case "Phase 2b":
                return "P2";
            case "Phase 3":
                return "P3";
            case "Filed":
                return "FILED";
            case "Approved":
                return "APRV";
            default:
                return "PRE";
        }
    }

    function showTooltip(event: MouseEvent, d: any, isCompany: boolean = false) {
        const containerRect = svg.getBoundingClientRect();
        tooltipX = event.pageX - containerRect.left;
        tooltipY = event.pageY - containerRect.top;
        
        if (isCompany) {
            tooltipContent = {
                sponsor: d.company,
                drugName: '',
                therapeuticArea: '',
                id: `${d.totalDrugs} drugs in pipeline`
            };
            tooltipBorderColor = '#37587e';
        } else {
            tooltipContent = {
                sponsor: d.Company,
                drugName: d.Candidate,
                therapeuticArea: d.TherapeuticArea1,
                id: d["Current Development Stage"] || (d["PRV Issue Year"] ? "PRV" : "")
            };
            tooltipBorderColor = stageColorScale(getStage(d));
        }
        
        tooltipVisible = true;
    }

    function hideTooltip() {
        tooltipVisible = false;
    }

    function truncateText(text: string, maxWidth: number) {
        if (text.length <= maxWidth / 8) return text;
        return text.slice(0, Math.floor(maxWidth / 8) - 3) + '...';
    }

    function processDataForLayout(data: any[]) {
        console.log('Processing data:', data.length, 'entries');
        const companiesMap = new Map();
        
        // First pass: Create company entries and initialize stage maps
        data.forEach((entry, index) => {
            const companyName = entry.Company;
            if (!companiesMap.has(companyName)) {
                companiesMap.set(companyName, {
                    company: companyName,
                    stages: new Map(),
                    totalDrugs: 0,
                    entries: []
                });
            }
            console.log(`Processed entry ${index + 1}:`, companyName);
        });

        // Second pass: Process each drug entry
        data.forEach((entry, index) => {
            const companyData = companiesMap.get(entry.Company);
            const stage = getStage(entry);
            
            // Initialize stage array if it doesn't exist
            if (!companyData.stages.has(stage)) {
                companyData.stages.set(stage, []);
            }
            
            // Add entry to appropriate stage
            companyData.stages.get(stage).push(entry);
            companyData.entries.push(entry);
            companyData.totalDrugs++;
            
            console.log(`Added drug ${entry["Candidate"]} to ${entry.Company} in stage ${stage}`);
        });

        // Convert map to array and sort by company name
        const result = Array.from(companiesMap.values())
            .sort((a, b) => a.company.localeCompare(b.company));
            
        console.log('Processed companies:', result.length);
        return result;
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
            stagesGroup.append("circle")
                .attr("r", radius)
                .attr("fill", "none")
                .attr("stroke", stageColorScale(stage))
                .attr("stroke-width", .5)
                .attr("stroke-dasharray", "1,4")
                .attr("stroke-opacity", 1);

            const labelAngle = -Math.PI / 10;
            const labelX = radius * Math.cos(labelAngle) - 15;
            const labelY = radius * Math.sin(labelAngle) + 25;

            const labelGroup = stagesGroup.append("g")
                .attr("transform", `translate(${labelX},${labelY})`)
                .attr("cursor", "pointer")
                .attr("class", "stage-label");

            // Calculate label width
            const tempText = labelGroup.append("text")
                .attr("opacity", 0)
                .text(stage);
            const textWidth = tempText.node().getBBox().width;
            tempText.remove();

            // Add label background
            labelGroup.append("rect")
                .attr("x", -stageLabelConfig.padding.x)
                .attr("y", -stageLabelConfig.height/2)
                .attr("width", textWidth + stageLabelConfig.padding.x)
                .attr("height", stageLabelConfig.height)
                .attr("rx", stageLabelConfig.cornerRadius)
                .attr("fill", '#F8FAFC')
                .attr("opacity", 1);

            // Add label text
            labelGroup.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "0.3em")
                .attr("fill", stageColorScale(stage))
                .attr("font-size", "10.25px")
                .attr("font-weight", "400")
                .text(stage);
        });

        const companies = processDataForLayout(data);
        const companyAngles = calculateCompanyAngles(companies);

        // Draw company sections and drugs
        companies.forEach(company => {
            const angle = companyAngles.get(company.company);
            const companyGroup = mainGroup.append("g");

            const labelAngle = angle.center;
            const labelX = labelRadius * Math.cos(labelAngle - Math.PI/2);
            const labelY = labelRadius * Math.sin(labelAngle - Math.PI/2);

            // Connect lines to drugs
            company.stages.forEach((drugs, stage) => {
                const stageRadius = stageRadii[stage];
                const drugSpacing = (angle.end - angle.start) / (drugs.length + 1);

                drugs.forEach((drug, i) => {
                    const drugAngle = angle.start + drugSpacing * (i + 1);
                    const drugX = stageRadius * Math.cos(drugAngle - Math.PI/2);
                    const drugY = stageRadius * Math.sin(drugAngle - Math.PI/2);

                    linesGroup.append("path")
                        .attr("d", `M${labelX},${labelY}L${drugX},${drugY}`)
                        .attr("stroke", "#37587e")
                        .attr("stroke-width", .25)
                        .attr("stroke-opacity", 0.525)
                        .attr("fill", "none");
                });
            });

            // Add company label
            const labelGroup = companyLabelsGroup.append("g")
                .attr("transform", `translate(${labelX},${labelY})`)
                .attr("cursor", "pointer");

            // Company node
            labelGroup.append("rect")
                .attr("width", 10.25)
                .attr("height", 10.25)
                .attr("transform", "translate(-3.625, -3.625)")
                .attr("angle", "120")
                .attr("fill", "#A598D9")
                .attr("stroke", "#375810")
                .attr("stroke-width", 0.725);

            // Company text label
            const textAngle = labelAngle > Math.PI ? "end" : "start";
            const dx = labelAngle > Math.PI ? -8 : 8;
            
            labelGroup.append("text")
                .attr("text-anchor", textAngle)
                .attr("dx", dx)
                .attr("dy", "-1em")
                .text(truncateText(company.company, maxLabelWidth+12))
                .attr("fill", "#A59899")
                .attr("font-size", "11.25px")
                .attr("font-weight", "500");

            // Add interaction handlers for company label
            labelGroup
                .on("mouseenter", (event) => {
                    labelGroup.select("rect")
                        .transition()
                        .duration(200)
                        .attr("height", 12)
                        .attr("width", 12)
                        .attr("fill", "#FF4A4A")
                        .attr("stroke-width", 2.725);

                    labelGroup.select("text")
                        .transition()
                        .duration(500)
                        .attr("font-weight", "800")
                        .attr("font-size", "12px")
                        .attr("fill", "#FF4A4A");

                    showTooltip(event, { company: company.company, totalDrugs: company.totalDrugs }, true);
                    onCompanyHover(data.filter(d => d.Company === company.company));
                })
                .on("mouseleave", () => {
                    labelGroup.select("rect")
                        .transition()
                        .attr("height", 10.25)
                        .attr("width", 10.25)
                        .attr("fill", "#A598D9")
                        .attr("stroke-width", 0.725);

                    labelGroup.select("text")
                        .transition()
                        .duration(500)
                        .attr("fill", "#A59899")
                        .attr("font-size", "11.25px")
                        .attr("font-weight", "500");

                    hideTooltip();
                    onLeave();
                })
                .on("click", () => {
                    hideTooltip();
                    onShowCompanyDetail({
                        Company: company.company,
                        entries: data.filter(d => d.Company === company.company),
                        color: '#37587e'
                    });
                });

            // Draw drugs
            company.stages.forEach((drugs, stage) => {
                const stageRadius = stageRadii[stage];
                const drugSpacing = (angle.end - angle.start) / (drugs.length + 1);

                drugs.forEach((drug, i) => {
                    const drugAngle = angle.start + drugSpacing * (i + 1);
                    const x = stageRadius * Math.cos(drugAngle - Math.PI/2);
                    const y = stageRadius * Math.sin(drugAngle - Math.PI/2);

                    const drugGroup = companyGroup.append("g")
                        .attr("transform", `translate(${x},${y})`)
                        .attr("cursor", "pointer");

                    // Drug circle
                    drugGroup.append("circle")
                        .attr("r", 8.25)
                        .attr("fill", therapeuticAreaColorScale(drug.TherapeuticArea1))
                        .attr("stroke", "#565656")
                        .attr("stroke-width", ".425px");

                    // Add PRV indicator for PRV awarded drugs
                    if (drug["PRV Issue Year"]) {
                        drugGroup.append("circle")
                            .attr("r", 10.25)
                            .attr("fill", "none")
                            .attr("stroke", "#2F855A")
                            .attr("stroke-width", "2")
                            .attr("stroke-dasharray", "2,2");
                    }

                    // Add drug interaction handlers
                    drugGroup
                        .on("mouseenter", (event) => {
                            drugGroup.select("circle")
                                .transition()
                                .duration(200)
                                .attr("r", 10.25)
                                .attr("stroke-width", 1.725)
                                .attr("stroke", "#375810")
                                .style("filter", "drop-shadow(0 2px 2px rgba(0,0,0,0.1))");

                            if (drug["PRV Issue Year"]) {
                                drugGroup.select("circle:last-child")
                                    .transition()
                                    .duration(200)
                                    .attr("r", 12)
                                    .attr("stroke-width", 3);
                            }

                            drugGroup.select(".drug-label")
                                .transition()
                                .duration(200)
                                .attr("opacity", 1);

                            showTooltip(event, drug);
                        })
                        .on("mouseleave", () => {
                            drugGroup.select("circle")
                                .transition()
                                .duration(200)
                                .attr("r", 8.25)
                                .attr("stroke-width", .425)
                                .attr("stroke", "#565656")
                                .style("filter", "none");

                            if (drug["PRV Issue Year"]) {
                                drugGroup.select("circle:last-child")
                                    .transition()
                                    .duration(200)
                                    .attr("r", 10.25)
                                    .attr("stroke-width", 2);
                            }

                            drugGroup.select(".drug-label")
                                .transition()
                                .duration(200)
                                .attr("opacity", 0);

                            hideTooltip();
                        })
                        .on("click", () => {
                            onShowDrugDetail({
                                candidate: drug["Candidate"],
                                year: drug["PRV Year"] || drug["RPDD Year"],
                                Company: drug.Company,
                                therapeuticArea: drug.TherapeuticArea1,
                                entries: data.filter(d => d.TherapeuticArea1 === drug.TherapeuticArea1),
                                color: therapeuticAreaColorScale(drug.TherapeuticArea1),
                                currentStage: drug["Current Development Stage"],
                                indication: drug.Indication || "",
                                rpddAwardDate: drug["RPDD Year"],
                                voucherAwardDate: drug["PRV Year"] || "",
                                treatmentClass: drug.Class1 || "TBD",
                                mechanismOfAction: drug.MOA || "TBD",
                                companyUrl: drug["Link to CrunchBase"] || ""
                            });
                        });

                    // Hidden drug label
                    const labelGroup = drugGroup.append("g")
                        .attr("opacity", 0)
                        .attr("class", "drug-label");

                    const labelX = drugAngle < Math.PI ? 12 : -12;
                    
                    labelGroup.append("text")
                        .attr("x", labelX)
                        .attr("y", 0)
                        .attr("text-anchor", drugAngle < Math.PI ? "start" : "end")
                        .attr("dy", "1.425em")
                        .attr("dx", "-.825em")
                        .text(truncateText(drug["Candidate"], maxLabelWidth))
                        .attr("fill", "#565656")
                        .attr("font-size", "11.25px")
                        .style("text-transform", "uppercase");
                });
            });
        });
    }

    // Initialize visualization when data or svg changes
    $: if (data.length > 0 && svg) {
        createVisualization();
    }
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